import type { InventoryItem, InventoryListQuery } from '@umgccapstone/contracts'
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
