import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./apiClient', () => ({ apiClient: { list: vi.fn() } }))

import { fetchInventory } from './inventory'
import { apiClient } from './apiClient'

const listMock = vi.mocked(apiClient.list)

afterEach(() => vi.clearAllMocks())

describe('fetchInventory', () => {
  it('serializes all params into the /inventory query string and reads meta', async () => {
    listMock.mockResolvedValue({ data: [{ id: '1' }], meta: { total: 42, page: 2, pageSize: 10 } } as never)

    const result = await fetchInventory({
      search: 'tomato',
      category: 'PRODUCE',
      status: 'low_stock',
      sort: 'name',
      order: 'asc',
      page: 2,
      pageSize: 10,
    })

    const path = listMock.mock.calls[0][0]
    expect(path).toContain('/inventory?')
    expect(path).toContain('search=tomato')
    expect(path).toContain('category=PRODUCE')
    expect(path).toContain('status=low_stock')
    expect(path).toContain('sort=name')
    expect(path).toContain('order=asc')
    expect(path).toContain('page=2')
    expect(path).toContain('pageSize=10')
    expect(result).toEqual({ items: [{ id: '1' }], total: 42, page: 2, pageSize: 10 })
  })

  it('omits empty optional params and falls back to items.length when meta is absent', async () => {
    listMock.mockResolvedValue({ data: [{ id: '1' }, { id: '2' }] } as never)

    const result = await fetchInventory({ sort: 'name', order: 'asc', page: 1, pageSize: 20 })

    const path = listMock.mock.calls[0][0]
    expect(path).not.toContain('search=')
    expect(path).not.toContain('category=')
    expect(path).not.toContain('status=')
    expect(result.total).toBe(2) // fallback to items.length
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
  })

  it('returns an empty list when the API sends no data', async () => {
    listMock.mockResolvedValue({ data: undefined } as never)

    const result = await fetchInventory({ sort: 'name', order: 'asc', page: 1, pageSize: 20 })

    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })
})
