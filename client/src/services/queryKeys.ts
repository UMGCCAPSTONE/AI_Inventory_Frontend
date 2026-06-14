// Query-key registry (ADR 0004). Every TanStack Query key in the app is
// declared here; hooks must not inline their own keys. T-34 extends this
// with the write→invalidate map.
export const queryKeys = {
  dashboard: {
    header: ['dashboard', 'header'] as const,
    today: ['dashboard', 'today'] as const,
  },
  suppliers: {
    list: ['suppliers', 'list'] as const,
  },
} as const
