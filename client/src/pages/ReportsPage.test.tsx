import { describe, it } from 'vitest'

// Placeholder specs for the Reports page (T-10A / T-10B / T-10C).
// All blocks are describe.skip until the page component exists.
// Un-skip and fill in each block as the corresponding ticket merges.

// T-10A: Reports — Basic KPI Cards
describe.skip('ReportsPage — US-REP-1: KPI cards', () => {
  it.todo('renders the page without crashing when mounted with mock report data')
  it.todo('displays server-computed KPI values (total spend, waste %, average margin)')
  it.todo('shows the KPI empty/no-data state when the report has no data')
})

// T-10B: Reports — Category Summary Table
describe.skip('ReportsPage — US-REP-2: category summary', () => {
  it.todo('renders a row for each category in the mock report response')
  it.todo('displays server-computed per-category spend, waste, and margin fields')
  it.todo('shows the empty-table state when the category list is empty')
  it.todo('does not recompute any derived field — values come from the server response')
})

// T-10C: Reports — Recommendation History & Waste-Risk
describe.skip('ReportsPage — US-REP-3: recommendation history', () => {
  it.todo('renders the recommendation history list from the mock API response')
  it.todo('shows accepted vs dismissed status from the server field')
  it.todo('shows the empty state when no recommendation history exists')
})

describe.skip('ReportsPage — US-REP-4: waste-risk breakdown', () => {
  it.todo('renders the waste-risk breakdown from server-computed fields')
  it.todo('displays at-risk item count and estimated waste value from the API')
  it.todo('shows the empty state when there are no at-risk items')
})
