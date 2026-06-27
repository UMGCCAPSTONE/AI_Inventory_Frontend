import type {
  CreateInventoryItemInput,
  InventoryItem,
  InventoryListQuery,
  UpdateInventoryItemInput,
} from '@umgccapstone/contracts'
import { apiClient } from './apiClient'

// Inventory list service (T-7B). Reads GET /api/inventory using the contract
// query shape; the grid drives the params (search/category/status/sort/page).
// Pagination total lives in the envelope `meta` (ADR 0002), so this uses
// apiClient.list to keep `meta` instead of discarding it.

export type InventoryPage = {
  items: InventoryItem[]
  total: number
  page: number
  pageSize: number
}

function toQueryString(query: InventoryListQuery): string {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.category) params.set('category', query.category)
  if (query.status) params.set('status', query.status)
  params.set('sort', query.sort)
  params.set('order', query.order)
  params.set('page', String(query.page))
  params.set('pageSize', String(query.pageSize))
  return params.toString()
}

export async function fetchInventory(query: InventoryListQuery): Promise<InventoryPage> {
  const { data, meta } = await apiClient.list<InventoryItem>(`/inventory?${toQueryString(query)}`)
  const items = data ?? []
  return {
    items,
    total: Number(meta?.total ?? items.length),
    page: Number(meta?.page ?? query.page),
    pageSize: Number(meta?.pageSize ?? query.pageSize),
  }
}

// The list endpoint caps pageSize at 100 (contract inventory.ts), so "export
// all items" (T-7S) can't be a single request — page through until we've
// collected `total`. Unfiltered + name-sorted so the export is the full,
// deterministically ordered dataset regardless of the grid's current view.
const EXPORT_PAGE_SIZE = 100

export async function fetchAllInventory(): Promise<InventoryItem[]> {
  const all: InventoryItem[] = []
  let page = 1
  // Guard against a misbehaving `total` (e.g. NaN) by also stopping when a page
  // comes back short — a full page implies there may be more.
  for (;;) {
    const result = await fetchInventory({
      sort: 'name',
      order: 'asc',
      page,
      pageSize: EXPORT_PAGE_SIZE,
    })
    all.push(...result.items)
    if (all.length >= result.total || result.items.length < EXPORT_PAGE_SIZE) break
    page += 1
  }
  return all
}

// Inventory writes (T-7C). Paths are the literal assertion unit (CONTEXT.md —
// "API path assertion"); no route-constant layer. The server returns the full
// item DTO with recomputed derived fields (ADR 0004); mutation hooks invalidate
// the read queries rather than trusting any client-side recompute.
export function createInventoryItem(input: CreateInventoryItemInput): Promise<InventoryItem> {
  return apiClient.post<InventoryItem>('/inventory', input)
}

export function updateInventoryItem(
  id: string,
  input: UpdateInventoryItemInput,
): Promise<InventoryItem> {
  return apiClient.patch<InventoryItem>(`/inventory/${id}`, input)
}

export function deleteInventoryItem(id: string): Promise<void> {
  return apiClient.delete<void>(`/inventory/${id}`)
}
