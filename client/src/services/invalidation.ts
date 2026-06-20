import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

// Write -> invalidate map (ADR 0004). Each entry lists every query key a write
// makes stale; invalidateAfterWrite refreshes them all. Centralizing this is
// the point — "what refreshes after this write?" is reviewable in one place.
export type WriteKey = 'inventory.write'

// An inventory add/edit/delete (T-7C) stales every inventory list (all
// search/filter/sort/page combos — invalidated by the ['inventory'] prefix) and
// the dashboard reads whose server-computed counts depend on inventory. Reports
// and menu-availability query keys join this list when those screens land.
export const writeInvalidationMap: Record<WriteKey, readonly (readonly unknown[])[]> = {
  'inventory.write': [
    ['inventory'],
    queryKeys.dashboard.summary,
    queryKeys.dashboard.header,
    queryKeys.dashboard.today,
  ],
}

export function invalidateAfterWrite(queryClient: QueryClient, writeKey: WriteKey): Promise<void[]> {
  const queryKeysToInvalidate: readonly (readonly unknown[])[] = writeInvalidationMap[writeKey]
  return Promise.all(
    queryKeysToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}
