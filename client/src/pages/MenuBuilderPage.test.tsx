import { describe, it } from 'vitest'

// Placeholder specs for the Menu Builder page (T-8A / T-8B).
// All blocks are describe.skip until the page component exists.
// Un-skip and fill in each block as the corresponding ticket merges.

// T-8A: Menu Builder — Page Layout & Generate Flow
describe.skip('MenuBuilderPage — US-MENU-1: page layout & generate', () => {
  it.todo('renders the page without crashing when mounted with mock data')
  it.todo('shows the "Generate recommendations" button in the initial state')
  it.todo('fires the POST /recommendations API call when the generate button is clicked')
  it.todo('shows a loading indicator while the generation request is in flight')
  it.todo('renders the recommendation list when the API responds with results')
})

// T-8B: Recommendation Cards — Detail, Explanation & Actions
describe.skip('MenuBuilderPage — US-MENU-2: recommendation detail', () => {
  it.todo('renders a card for each recommendation in the API response')
  it.todo('displays the availability status when isAvailable is true/false in the API response — does not recompute from stock')
  it.todo('displays the limiting ingredient name from the limitingIngredient field in the API response')
  it.todo('shows the food cost, suggested price, and margin from server-computed fields')
})

describe.skip('MenuBuilderPage — US-MENU-3: accept recommendation', () => {
  it.todo('fires the PATCH /recommendations/:id/status call with { status: "accepted" } on accept')
  it.todo('reflects the accepted state on the card after the API call succeeds')
})

describe.skip('MenuBuilderPage — US-MENU-4: dismiss recommendation', () => {
  it.todo('fires the PATCH /recommendations/:id/status call with { status: "dismissed" } on dismiss')
  it.todo('removes or marks the card as dismissed after the API call succeeds')
})

describe.skip('MenuBuilderPage — US-MENU-5: explanation modal', () => {
  it.todo('opens the "Why this?" explanation panel when triggered')
  it.todo('displays the server-provided reasoning text in the explanation panel')
})

describe.skip('MenuBuilderPage — US-MENU-6: empty state', () => {
  it.todo('shows the empty state when no recommendations are available')
})
