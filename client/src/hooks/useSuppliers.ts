import { useQuery } from '@tanstack/react-query'
import { fetchSuppliers, queryKeys } from '../services'

export function useSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.list,
    queryFn: fetchSuppliers,
  })
}
