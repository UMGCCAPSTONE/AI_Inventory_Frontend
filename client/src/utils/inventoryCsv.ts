import type { InventoryItem, Supplier } from '@umgccapstone/contracts'

// T-7S — Inventory CSV export. The exported columns mirror the Inventory grid's
// displayed columns 1:1 (see InventoryDataGrid.tsx), so the file matches exactly
// what the user sees on screen (US-INV-6 QA: "CSV column headers match the
// displayed table fields"). The display-formatting helpers below are duplicated
// from the grid on purpose — if a grid column's format changes, change it here
// too. The grid's "Actions" column is omitted; it has no exportable value.

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const MS_PER_DAY = 24 * 60 * 60 * 1000

// Header labels in the grid's visual order.
export const INVENTORY_CSV_HEADERS = [
  'Item',
  'Stock',
  'Expiry',
  'At-risk',
  'Par / Reorder',
  'Supplier',
] as const

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / MS_PER_DAY)
}

// Mirrors the grid's Expiry chip: no date → "—", expiring soon → "Nd left"
// ("Expired" once past), otherwise "Stable". Uses the server-computed
// `isExpiringSoon` flag (ADR 0004) — never a client recomputation of the window.
function expiryCell(item: InventoryItem): string {
  if (!item.expirationDate) return '—'
  if (item.isExpiringSoon) {
    const days = daysUntil(item.expirationDate)
    return days <= 0 ? 'Expired' : `${days}d left`
  }
  return 'Stable'
}

function atRiskCell(item: InventoryItem): string {
  return item.atRiskValue > 0 ? money.format(item.atRiskValue) : '—'
}

function parReorderCell(item: InventoryItem, supplier?: Supplier): string {
  const cadence = supplier?.deliveryCadence
  return cadence ? `${item.parLevel} ${item.unit} · ${cadence}` : `${item.parLevel} ${item.unit}`
}

// RFC 4180 quoting: wrap a field in double quotes when it contains a comma,
// double quote, or newline, doubling any embedded quotes. Currency over $1,000
// formats with a thousands separator, so this also covers the At-risk column.
function escapeCsvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function toRow(fields: readonly string[]): string {
  return fields.map(escapeCsvField).join(',')
}

// Build the full CSV text (header + one row per item). Supplier name and reorder
// cadence are joined in from the Suppliers list because an item only carries a
// `supplierId` (CONTEXT.md — "inventory item"). An empty `items` list yields a
// header-only document so "export" still produces a valid CSV (T-7S C-1).
export function buildInventoryCsv(items: InventoryItem[], suppliers: Supplier[]): string {
  const supplierById = new Map(suppliers.map((s) => [s.id, s]))
  const rows = items.map((item) => {
    const supplier = item.supplierId ? supplierById.get(item.supplierId) : undefined
    return toRow([
      item.name,
      `${item.quantity} ${item.unit}`,
      expiryCell(item),
      atRiskCell(item),
      parReorderCell(item, supplier),
      supplier?.name ?? '—',
    ])
  })
  return [toRow(INVENTORY_CSV_HEADERS), ...rows].join('\r\n')
}

// Date-stamped name so repeated exports don't overwrite, e.g. inventory-2026-06-26.csv.
export function inventoryCsvFilename(date = new Date()): string {
  return `inventory-${date.toISOString().slice(0, 10)}.csv`
}

// Trigger a browser download of `csv` under `filename`. Prepends a UTF-8 BOM
// (U+FEFF) so Excel renders the non-ASCII display characters (— and ·) correctly
// instead of mojibake. Kept separate from buildInventoryCsv so the pure builder
// stays unit-testable without touching the DOM.
export function downloadCsv(filename: string, csv: string): void {
  const bom = String.fromCharCode(0xfeff)
  const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
