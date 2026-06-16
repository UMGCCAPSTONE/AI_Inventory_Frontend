import { useQuery } from '@tanstack/react-query'
import { fetchSuppliers, queryKeys } from '../services'

// Suppliers list query. Used by the inventory grid to map supplierId → name +
// cadence. Suppliers change rarely, so cache them for a few minutes.
export function useSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.list,
    queryFn: fetchSuppliers,
    staleTime: 5 * 60 * 1000,
  })
}
