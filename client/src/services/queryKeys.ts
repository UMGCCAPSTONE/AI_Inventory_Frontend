// Query-key registry (ADR 0004). Every TanStack Query key in the app is
// declared here; hooks must not inline their own keys. T-34 extends this
// with the write→invalidate map.
import type { InventoryListQuery } from '@umgccapstone/contracts'

export const queryKeys = {
  dashboard: {
    header: ['dashboard', 'header'] as const,
    today: ['dashboard', 'today'] as const,
    summary: ['dashboard', 'summary'] as const,
    alerts: ['dashboard', 'alerts'] as const,
    recommendations: ['dashboard', 'recommendations'] as const,
  },
  menu: {
    availability: ['menu', 'availability'] as const,
    // ACTIVE menu items shown in the Menu Builder's "regular menu" section (T-8);
    // sourced from GET /menu/availability (every MenuItem with live availability).
    items: ['menu', 'items'] as const,
  },
  recommendations: {
    // AI menu recommendations shown in the Menu Builder (T-8). Generated content
    // snapshot + live availability; the active list renders PROPOSED items.
    list: ['recommendations', 'list'] as const,
  },
  inventory: {
    // The query object is part of the key so each search/filter/sort/page
    // combination caches independently (T-7B).
    list: (query: InventoryListQuery) => ['inventory', 'list', query] as const,
    // Every inventory item, unpaginated — the ingredient picker in Add Dish (T-8).
    all: ['inventory', 'all'] as const,
  },
  suppliers: {
    list: ['suppliers', 'list'] as const,
  },
  reports: {
    category: ['reports', 'category'] as const,
  },
} as const
