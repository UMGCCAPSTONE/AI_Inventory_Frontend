import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from '@umgccapstone/contracts'
import {
  createSupplier,
  fetchSupplierDeliveries,
  fetchSuppliers,
  invalidateAfterWrite,
  queryKeys,
  updateSupplier,
} from '../services'

// Suppliers list query. Used by the inventory grid to map supplierId → name +
// cadence. Suppliers change rarely, so cache them for a few minutes.
export function useSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.list,
    queryFn: fetchSuppliers,
    staleTime: 5 * 60 * 1000,
  })
}

// Create-supplier mutation (T-9B). On success, refresh the suppliers list (and,
// via the shared query, the inventory grid) through the ADR-0004 invalidation map.
export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSupplierInput) => createSupplier(input),
    onSuccess: () => invalidateAfterWrite(queryClient, 'supplier.create'),
  })
}

// Update-supplier mutation (T-9B). Callers pass the id plus the changed fields only.
export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupplierInput }) =>
      updateSupplier(id, input),
    onSuccess: () => invalidateAfterWrite(queryClient, 'supplier.update'),
  })
}

// Delivery history query (T-9S). Disabled until a supplierId is provided so
// no fetch fires before the user opens the drawer for a specific supplier.
export function useSupplierDeliveries(supplierId: string | undefined) {
  return useQuery({
    queryKey: supplierId
      ? queryKeys.suppliers.deliveries(supplierId)
      : (['suppliers', 'deliveries', 'none'] as const),
    queryFn: () => fetchSupplierDeliveries(supplierId!),
    enabled: !!supplierId,
  })
}
