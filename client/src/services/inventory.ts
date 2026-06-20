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
