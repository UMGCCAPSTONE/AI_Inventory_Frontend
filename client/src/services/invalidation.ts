import type { QueryClient } from '@tanstack/react-query'

// Write -> invalidate map (ADR 0004). Each entry lists every query key a
// write makes stale; invalidateAfterWrite refreshes them all. Empty for now
// — no mutations exist yet (T-12/T-13/T-14 land the first writes). Add an
// entry (and extend WriteKey) in the same ticket that adds a mutation hook:
//
//   export type WriteKey = 'inventory.update'
//
//   export const writeInvalidationMap: Record<WriteKey, readonly (readonly unknown[])[]> = {
//     'inventory.update': [
//       queryKeys.dashboard.header,
//       queryKeys.dashboard.today,
//       queryKeys.inventory.list,
//     ],
//   }
export type WriteKey = never

export const writeInvalidationMap: Record<WriteKey, readonly (readonly unknown[])[]> = {}

export function invalidateAfterWrite(queryClient: QueryClient, writeKey: WriteKey): Promise<void[]> {
  const queryKeysToInvalidate: readonly (readonly unknown[])[] = writeInvalidationMap[writeKey]
  return Promise.all(
    queryKeysToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}
