import { describe, it } from 'vitest'

// Placeholder specs for the Inventory page (T-7A / T-7B / T-7C).
// All blocks are describe.skip until the page component exists.
// Un-skip and fill in each block as the corresponding ticket merges.

// T-7A: Inventory Page — Metrics & Layout
describe.skip('InventoryPage — US-INV-1: metrics & layout', () => {
  it.todo('renders the page without crashing when mounted with mock data')
  it.todo('displays server-computed inventory KPIs (total items, total value, expiring count)')
  it.todo('shows the correct page heading and layout regions')
})

// T-7B: Inventory DataGrid Component
describe.skip('InventoryPage — US-INV-2: item grid', () => {
  it.todo('renders a row for each item in the mock API response')
  it.todo('shows the low-stock badge when isLowStock is true in the API response — does not recompute from quantity')
  it.todo('shows the expiring-soon badge when isExpiringSoon is true in the API response — does not recompute from date')
  it.todo('renders the empty state message when the items array is empty')
  it.todo('applies the urgency tone class from the server field — does not derive it from raw data')
})

// T-7C: Inventory Item Management Flow
describe.skip('InventoryPage — US-INV-3: add / edit item', () => {
  it.todo('opens the add-item form when the "+ Add item" button is clicked')
  it.todo('fires the POST /inventory API call with the correct payload on form submit')
  it.todo('opens the edit form pre-filled with server data when an existing item is clicked')
  it.todo('fires the PATCH /inventory/:id call on edit form submit')
  it.todo('shows a validation error and does not submit when required fields are empty')
})
