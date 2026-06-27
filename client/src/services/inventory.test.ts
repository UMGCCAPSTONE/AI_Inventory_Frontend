import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./apiClient', () => ({ apiClient: { list: vi.fn() } }))

import { fetchAllInventory, fetchInventory } from './inventory'
import { apiClient } from './apiClient'

const listMock = vi.mocked(apiClient.list)

afterEach(() => vi.clearAllMocks())

// One full page of placeholder items (the list endpoint caps pageSize at 100).
function pageOf(count: number, idPrefix: string) {
  return Array.from({ length: count }, (_, i) => ({ id: `${idPrefix}-${i}` }))
}

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

describe('fetchAllInventory', () => {
  it('pages through every item (pageSize 100) and concatenates them', async () => {
    // 150 total → two requests: a full page of 100, then a partial page of 50.
    listMock
      .mockResolvedValueOnce({ data: pageOf(100, 'a'), meta: { total: 150 } } as never)
      .mockResolvedValueOnce({ data: pageOf(50, 'b'), meta: { total: 150 } } as never)

    const items = await fetchAllInventory()

    expect(items).toHaveLength(150)
    expect(listMock).toHaveBeenCalledTimes(2)
    expect(listMock.mock.calls[0][0]).toContain('page=1')
    expect(listMock.mock.calls[0][0]).toContain('pageSize=100')
    expect(listMock.mock.calls[1][0]).toContain('page=2')
  })

  it('makes a single request when everything fits on one page', async () => {
    listMock.mockResolvedValue({ data: pageOf(20, 'a'), meta: { total: 20 } } as never)

    const items = await fetchAllInventory()

    expect(items).toHaveLength(20)
    expect(listMock).toHaveBeenCalledTimes(1)
  })

  it('returns an empty array when there are no items', async () => {
    listMock.mockResolvedValue({ data: [], meta: { total: 0 } } as never)

    await expect(fetchAllInventory()).resolves.toEqual([])
    expect(listMock).toHaveBeenCalledTimes(1)
  })

  it('stops on a short page even if total is unreliable', async () => {
    // total is NaN-ish; the short-page guard must still terminate the loop.
    listMock.mockResolvedValue({ data: pageOf(10, 'a'), meta: { total: Number.NaN } } as never)

    const items = await fetchAllInventory()

    expect(items).toHaveLength(10)
    expect(listMock).toHaveBeenCalledTimes(1)
  })
})
