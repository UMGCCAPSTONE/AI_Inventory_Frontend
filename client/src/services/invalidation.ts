import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

// Write -> invalidate map (ADR 0004). Each entry lists every query key a write
// makes stale; invalidateAfterWrite refreshes them all. Centralizing this is
// the point — "what refreshes after this write?" is reviewable in one place.
// Extend WriteKey and add an entry in the same ticket that adds a mutation hook.
export type WriteKey =
  | 'inventory.write'
  | 'supplier.create'
  | 'supplier.update'
  | 'recommendation.generate'
  | 'recommendation.status'
  | 'menuItem.write'

// An inventory add/edit/delete (T-7C) stales every inventory list (all
// search/filter/sort/page combos — invalidated by the ['inventory'] prefix) and
// the dashboard reads whose server-computed counts depend on inventory.
// `menu.availability` is also invalidated (ADR 0008) because ingredient stock
// changes affect whether a dish can be made. Content snapshots
// (`dashboard.recommendations`) are NOT invalidated — they are editorial, not
// inventory-derived. T-10B adds queryKeys.reports.category so it re-fetches
// after any inventory write. T-10C adds queryKeys.dashboard.alerts so the
// Reports waste-risk summary (and the Dashboard alerts feed, which reads the
// same key) refresh after any inventory write.
//
// Supplier writes (T-9B) only need `suppliers.list`: the inventory grid resolves
// `supplierId -> name` through the same `useSuppliers` query, so refreshing that
// list also refreshes the grid — no separate inventory key required.
export const writeInvalidationMap: Record<WriteKey, readonly (readonly unknown[])[]> = {
  'inventory.write': [
    ['inventory'],
    queryKeys.dashboard.summary,
    queryKeys.dashboard.header,
    queryKeys.dashboard.today,
    queryKeys.dashboard.alerts,
    queryKeys.menu.availability,
    queryKeys.reports.category,
  ],
  'supplier.create': [queryKeys.suppliers.list],
  'supplier.update': [queryKeys.suppliers.list],
  // Generating recommendations (T-8) restages the recommendation list and the
  // Dashboard's recommendation-content preview (ADR 0008 reserved this — content
  // is only stale after a recommendation-engine write, which this is). It does not
  // touch inventory or the menu, so nothing else is invalidated.
  'recommendation.generate': [queryKeys.recommendations.list, queryKeys.dashboard.recommendations],
  // Accept/dismiss/save (T-8) all change the active recommendation list and the
  // Dashboard preview. Accept additionally creates an ACTIVE menu item, so the
  // "regular menu" list and menu availability are refreshed too; dismiss/save
  // over-invalidate those harmlessly (one key keeps the map reviewable).
  'recommendation.status': [
    queryKeys.recommendations.list,
    queryKeys.dashboard.recommendations,
    queryKeys.menu.items,
    queryKeys.menu.availability,
  ],
  // Adding a dish (T-8 "Add Dish") restages the regular-menu list and its live
  // availability. It does not touch inventory, recommendations, or the dashboard.
  'menuItem.write': [queryKeys.menu.items, queryKeys.menu.availability],
}

export function invalidateAfterWrite(queryClient: QueryClient, writeKey: WriteKey): Promise<void[]> {
  const queryKeysToInvalidate: readonly (readonly unknown[])[] = writeInvalidationMap[writeKey]
  return Promise.all(
    queryKeysToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}
