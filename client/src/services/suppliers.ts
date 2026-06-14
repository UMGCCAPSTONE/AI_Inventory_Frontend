import { apiClient } from './apiClient'
import type { Supplier } from '../types'

// Reads suppliers.list (T-9A / ADR 0004 query-key registry).
export async function fetchSuppliers(): Promise<Supplier[]> {
  return apiClient.get<Supplier[]>('/suppliers')
}
