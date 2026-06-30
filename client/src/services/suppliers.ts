import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from '@umgccapstone/contracts'
import type { Delivery } from '../types'
import { apiClient } from './apiClient'

// Suppliers service (T-14 API). The inventory grid uses the list to resolve an
// item's `supplierId` into a supplier name + reorder cadence (the item itself
// only carries the id). Suppliers change rarely.
export async function fetchSuppliers(): Promise<Supplier[]> {
  return (await apiClient.get<Supplier[]>('/suppliers')) ?? []
}

// Create a supplier (T-9B). Body is validated server-side with the same
// `createSupplierInputSchema` the form validates against (shared contract).
export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  return apiClient.post<Supplier>('/suppliers', input)
}

// Update a supplier (T-9B). Callers send only the changed fields; the server
// applies a partial update via `updateSupplierInputSchema`.
export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  return apiClient.patch<Supplier>(`/suppliers/${id}`, input)
}

// Fetch delivery history for a supplier (T-9S). Falls back to an empty array
// when the backend returns nothing (endpoint not yet live returns 404 → error
// state; empty array → empty state).
export async function fetchSupplierDeliveries(supplierId: string): Promise<Delivery[]> {
  return (await apiClient.get<Delivery[]>(`/suppliers/${supplierId}/deliveries`)) ?? []
}
