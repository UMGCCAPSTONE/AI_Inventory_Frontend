import { describe, it } from 'vitest'

// Placeholder specs for the Dashboard page (T-6A / T-6B / T-6C).
// All blocks are describe.skip until the page component exists.
// Un-skip and fill in each block as the corresponding ticket merges.

// T-6A: Dashboard Summary Cards & Metrics
describe.skip('DashboardPage — US-DASH-1: summary cards & metrics', () => {
  it.todo('renders the page without crashing when mounted with mock data')
  it.todo('displays atRiskValue, waste %, and margin from the API response — does not compute from raw inventory')
  it.todo('shows the chef name in the welcome heading when the API provides one')
  it.todo('shows the facts list when the API returns fact strings')
  it.todo('renders the empty/no-metrics placeholder when the metrics array is empty')
})

// T-6B: Dashboard Urgent Alerts Section
describe.skip('DashboardPage — US-DASH-2: urgent alerts', () => {
  it.todo('renders alerts for items where isExpiringSoon or atRiskValue is set in the server response')
  it.todo('shows the empty alerts state when no items have isExpiringSoon or atRiskValue set')
  it.todo('displays urgency labels from the server field — does not derive them from dates or quantities')
})

// T-6C: Dashboard AI Recommendation Preview Cards
describe.skip('DashboardPage — US-DASH-3: AI recommendation preview', () => {
  it.todo('renders recommendation preview cards from the mock API response')
  it.todo('displays server-computed availability and limiting-ingredient fields on each card')
  it.todo('navigates to the Menu Builder when a recommendation card is clicked')
  it.todo('shows the empty specials state when the recommendations list is empty')
})
