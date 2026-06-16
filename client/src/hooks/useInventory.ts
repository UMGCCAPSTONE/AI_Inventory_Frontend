import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { InventoryListQuery } from '@umgccapstone/contracts'
import { fetchInventory, queryKeys } from '../services'

// Inventory list query (T-7B). `keepPreviousData` holds the current rows while
// the next page/sort/filter loads, so the grid doesn't flash empty between
// requests. The query object drives both the cache key and the request params.
export function useInventory(query: InventoryListQuery) {
  return useQuery({
    queryKey: queryKeys.inventory.list(query),
    queryFn: () => fetchInventory(query),
    placeholderData: keepPreviousData,
  })
}
