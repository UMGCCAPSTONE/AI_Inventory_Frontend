import type { Supplier } from '@umgccapstone/contracts'
import { apiClient } from './apiClient'

// Suppliers list service (T-14 API). The inventory grid uses this to resolve an
// item's `supplierId` into a supplier name + reorder cadence (the item itself
// only carries the id). Read-only list; suppliers change rarely.
export async function fetchSuppliers(): Promise<Supplier[]> {
  return (await apiClient.get<Supplier[]>('/suppliers')) ?? []
}
