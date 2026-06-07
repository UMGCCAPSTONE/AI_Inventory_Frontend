import type { DashboardSummary } from '../types/contracts'

/**
 * Mock fixture for the dashboard header. Relocated out of the component so the
 * UI stays populated for testing until the backend API is wired (see ADR 0006).
 * Served by `useDashboardSummary()` only when `appConfig.enableMocks` is true.
 */
export const dashboardSummaryMock: DashboardSummary = {
  greeting: 'Good afternoon',
  chefName: 'Chef',
  alertHeadline: 'Five things need attention.',
  summary:
    "Three ingredients are within 48 hours of expiring. I've put together four specials that use them up profitably - review below.",
  facts: [
    '87 SKUs tracked',
    '$2,847 inventory value',
    "Yesterday's covers: 142",
    'Updated 8m ago',
  ],
  metrics: [
    {
      label: 'At Risk',
      value: '$184',
      valueTone: 'danger',
      helper: 'expires < 48h',
    },
    {
      label: "This Week's Waste",
      value: '$67',
      valueTone: 'warning',
      helper: 'down 38% vs last week',
    },
    {
      label: 'Avg Margin',
      value: '68%',
      valueTone: 'success',
      helper: 'on featured dishes',
    },
    {
      label: 'Reorder Today',
      value: '7',
      helper: 'items below par',
    },
  ],
}
