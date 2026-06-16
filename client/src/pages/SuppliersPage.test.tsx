import { describe, it } from 'vitest'

// Placeholder specs for the Suppliers page (T-9A component is built; T-9B add/edit flow is pending).
// All blocks are describe.skip until the page component and add/edit flow exist.
// Un-skip and fill in each block as the corresponding ticket merges.

// T-9A component (SupplierDirectory) is merged — its own component test covers rendering.
// These specs cover the full page behaviour and the add/edit flow (T-9B).

// T-9B: Supplier Add / Edit Flow — full page integration
describe.skip('SuppliersPage — US-SUPP-1: supplier directory view', () => {
  it.todo('renders the page without crashing when mounted with mock supplier data')
  it.todo('renders a card or row for each supplier in the API response')
  it.todo('shows the empty state when the supplier list is empty')
  it.todo('does not render a delete control — deletion is out of scope per acceptance criteria')
})

describe.skip('SuppliersPage — US-SUPP-2: add supplier', () => {
  it.todo('opens the add-supplier form when the "Add Supplier" button is clicked')
  it.todo('fires the POST /suppliers API call with the correct payload on form submit')
  it.todo('shows a validation error and does not submit when required fields are empty')
  it.todo('closes the form and refreshes the list after a successful add')
})

describe.skip('SuppliersPage — US-SUPP-3: edit supplier', () => {
  it.todo('opens the edit form pre-filled with server data when an existing supplier is selected')
  it.todo('fires the PATCH /suppliers/:id call with only the changed fields on submit')
  it.todo('closes the form and reflects the updated supplier in the list after success')
})
