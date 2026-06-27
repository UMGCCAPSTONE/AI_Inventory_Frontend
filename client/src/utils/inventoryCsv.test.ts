import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { InventoryItem, Supplier } from '@umgccapstone/contracts'
import {
  INVENTORY_CSV_HEADERS,
  buildInventoryCsv,
  downloadCsv,
  inventoryCsvFilename,
} from './inventoryCsv'

// Fixed "now" so the relative Expiry column ("Nd left") is deterministic.
const NOW = new Date('2026-06-26T00:00:00.000Z')

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    name: 'Roma tomato',
    category: 'PRODUCE',
    quantity: 5,
    unit: 'kg',
    unitCost: 2,
    parLevel: 3,
    expirationDate: null,
    supplierId: undefined,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    isLowStock: false,
    isExpiringSoon: false,
    atRiskValue: 0,
    ...overrides,
  }
}

const supplier: Supplier = {
  id: 'sup-1',
  name: 'Fresh Farms',
  deliveryCadence: 'weekly',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
}

function rows(csv: string): string[] {
  return csv.split('\r\n')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('buildInventoryCsv — headers', () => {
  it('emits the six display columns in grid order as the first row', () => {
    const csv = buildInventoryCsv([], [])
    expect(rows(csv)[0]).toBe('Item,Stock,Expiry,At-risk,Par / Reorder,Supplier')
    expect(INVENTORY_CSV_HEADERS).toEqual([
      'Item',
      'Stock',
      'Expiry',
      'At-risk',
      'Par / Reorder',
      'Supplier',
    ])
  })

  it('returns a header-only document for an empty inventory (C-1)', () => {
    const csv = buildInventoryCsv([], [])
    expect(rows(csv)).toHaveLength(1)
  })
})

describe('buildInventoryCsv — cell formatting mirrors the grid', () => {
  it('formats Stock as "quantity unit"', () => {
    const csv = buildInventoryCsv([makeItem({ quantity: 12, unit: 'lb' })], [])
    expect(rows(csv)[1]).toContain('12 lb')
  })

  it('Expiry: "—" when there is no expiration date', () => {
    const csv = buildInventoryCsv([makeItem({ expirationDate: null })], [])
    expect(rows(csv)[1].split(',')[2]).toBe('—')
  })

  it('Expiry: "Nd left" when expiring soon in the future', () => {
    const csv = buildInventoryCsv(
      [makeItem({ expirationDate: '2026-06-29T00:00:00Z', isExpiringSoon: true })],
      [],
    )
    expect(rows(csv)[1].split(',')[2]).toBe('3d left')
  })

  it('Expiry: "Expired" when expiring soon and already past', () => {
    const csv = buildInventoryCsv(
      [makeItem({ expirationDate: '2026-06-20T00:00:00Z', isExpiringSoon: true })],
      [],
    )
    expect(rows(csv)[1].split(',')[2]).toBe('Expired')
  })

  it('Expiry: "Stable" when a date exists but it is not expiring soon', () => {
    const csv = buildInventoryCsv(
      [makeItem({ expirationDate: '2026-12-01T00:00:00Z', isExpiringSoon: false })],
      [],
    )
    expect(rows(csv)[1].split(',')[2]).toBe('Stable')
  })

  it('At-risk: formats positive value as currency, "—" when zero', () => {
    const withRisk = buildInventoryCsv([makeItem({ atRiskValue: 7.5 })], [])
    expect(rows(withRisk)[1].split(',')[3]).toBe('$7.50')

    const noRisk = buildInventoryCsv([makeItem({ atRiskValue: 0 })], [])
    expect(noRisk.split('\r\n')[1].split(',')[3]).toBe('—')
  })

  it('Par / Reorder: includes the supplier cadence when known', () => {
    const csv = buildInventoryCsv(
      [makeItem({ parLevel: 10, unit: 'kg', supplierId: 'sup-1' })],
      [supplier],
    )
    expect(rows(csv)[1]).toContain('10 kg · weekly')
  })

  it('Par / Reorder: omits cadence when the item has no supplier', () => {
    const csv = buildInventoryCsv([makeItem({ parLevel: 10, unit: 'kg', supplierId: undefined })], [])
    const parCell = rows(csv)[1].split(',')[4]
    expect(parCell).toBe('10 kg')
  })

  it('Supplier: resolves the name by id, "—" when unlinked or unknown', () => {
    const linked = buildInventoryCsv([makeItem({ supplierId: 'sup-1' })], [supplier])
    expect(rows(linked)[1]).toContain('Fresh Farms')

    const unlinked = buildInventoryCsv([makeItem({ supplierId: undefined })], [supplier])
    expect(unlinked.split('\r\n')[1].endsWith('—')).toBe(true)

    const dangling = buildInventoryCsv([makeItem({ supplierId: 'ghost' })], [supplier])
    expect(dangling.split('\r\n')[1].endsWith('—')).toBe(true)
  })
})

describe('buildInventoryCsv — RFC 4180 escaping', () => {
  it('quotes and escapes fields containing commas, quotes, or newlines', () => {
    const csv = buildInventoryCsv([makeItem({ name: 'Tomato, "Roma"\nbatch' })], [])
    expect(rows(csv)[1].startsWith('"Tomato, ""Roma""\nbatch"')).toBe(true)
  })

  it('quotes currency that carries a thousands separator', () => {
    const csv = buildInventoryCsv([makeItem({ atRiskValue: 1234.5 })], [])
    // $1,234.50 contains a comma → must be quoted so it stays one field.
    expect(rows(csv)[1]).toContain('"$1,234.50"')
  })
})

describe('inventoryCsvFilename', () => {
  it('date-stamps the filename as inventory-YYYY-MM-DD.csv', () => {
    expect(inventoryCsvFilename(new Date('2026-06-26T12:00:00Z'))).toBe('inventory-2026-06-26.csv')
  })
})

describe('downloadCsv', () => {
  it('builds a BOM-prefixed text/csv blob and clicks a download link', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })

    const click = vi.fn()
    const realCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreateElement(tag)
      if (tag === 'a') el.click = click
      return el
    })

    downloadCsv('inventory-2026-06-26.csv', 'Item,Stock\nBasil,2 kg')

    expect(createObjectURL).toHaveBeenCalledOnce()
    const [blob] = createObjectURL.mock.calls[0] as unknown as [Blob]
    expect(blob.type).toContain('text/csv')
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
