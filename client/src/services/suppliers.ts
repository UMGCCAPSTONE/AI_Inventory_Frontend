import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from '@umgccapstone/contracts'
import type { CrossSupplierDelivery, Delivery } from '../types'
import { ApiError } from '../types/api'
import { apiClient } from './apiClient'

// The deliveries domain (backend #66 item 1) isn't live yet, so its endpoints
// 404. apiClient throws on any non-2xx, which would surface an error state and
// make the page look broken. Treat a 404 specifically as "no data yet" (empty),
// while letting real failures (500s, network) still throw → error state.
async function emptyOn404<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

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

// Fetch delivery history for a supplier (T-9S). Degrades a 404 (endpoint not yet
// live, backend #66) to an empty array so the history renders an empty state
// instead of an error; a present-but-empty response also yields [].
export async function fetchSupplierDeliveries(supplierId: string): Promise<Delivery[]> {
  return emptyOn404(
    apiClient
      .get<Delivery[]>(`/suppliers/${supplierId}/deliveries`)
      .then((data) => data ?? []),
  )
}

// Fetch cross-supplier recent deliveries (T-9S mockup). Used by the Supplier
// Network page's Recent Orders table, Spend by Supplier chart, and Upcoming
// Deliveries sidebar. Degrades a 404 to an empty array until the backend ships
// the endpoint (#66) so those sections show an empty, not error, state.
export async function fetchRecentDeliveries(): Promise<CrossSupplierDelivery[]> {
  return emptyOn404(
    apiClient.get<CrossSupplierDelivery[]>('/deliveries/recent').then((data) => data ?? []),
  )
}
