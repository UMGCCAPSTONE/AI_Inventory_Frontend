import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardSummary } from '@umgccapstone/contracts'
import InventoryPage from './InventoryPage'
import { fetchDashboardSummary, fetchInventory, fetchSuppliers } from '../services'

// The page renders the MUI X DataGrid (T-7B), which needs these in jsdom.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

vi.mock('../services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services')>()
  return {
    ...actual,
    fetchDashboardSummary: vi.fn(),
    fetchInventory: vi.fn(),
    fetchSuppliers: vi.fn(),
  }
})

const summary: DashboardSummary = {
  totalItems: 9,
  lowStockCount: 8,
  expiringSoonCount: 2,
  atRiskValue: 120,
  lastUpdatedAt: null,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <InventoryPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchInventory).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 })
  vi.mocked(fetchSuppliers).mockResolvedValue([])
})

afterEach(() => {
  vi.clearAllMocks()
})

// T-7A: Inventory Page — Metrics & Layout
describe('InventoryPage — US-INV-1: metrics & layout', () => {
  it('renders the heading and the four KPI cards from the summary API', async () => {
    vi.mocked(fetchDashboardSummary).mockResolvedValue(summary)

    renderPage()

    expect(await screen.findByRole('heading', { name: /inventory items/i })).toBeInTheDocument()

    // Scope to the metrics region — the grid also has an "Expiring soon" chip.
    const metrics = screen.getByLabelText('Inventory metrics')
    expect(await within(metrics).findByText('Total items')).toBeInTheDocument()
    for (const label of ['Expiring soon', 'At-risk value', 'Below par']) {
      expect(within(metrics).getByText(label)).toBeInTheDocument()
    }
    // Values come straight from the API (ADR 0004 — not recomputed)
    expect(within(metrics).getByText('9')).toBeInTheDocument() // totalItems
    expect(within(metrics).getByText('$120.00')).toBeInTheDocument() // atRiskValue
  })

  it('shows the loading state while the summary is fetching', () => {
    vi.mocked(fetchDashboardSummary).mockReturnValue(new Promise<DashboardSummary>(() => {}))

    renderPage()

    expect(screen.getByText(/loading metrics/i)).toBeInTheDocument()
  })

  it('shows the error state when the summary request fails', async () => {
    vi.mocked(fetchDashboardSummary).mockRejectedValue(new Error('boom'))

    renderPage()

    expect(await screen.findByText(/couldn't load metrics/i)).toBeInTheDocument()
  })
})

// T-7B: Inventory DataGrid — covered in InventoryDataGrid.test.tsx
describe.skip('InventoryPage — US-INV-2: item grid', () => {
  it.todo('see InventoryDataGrid.test.tsx')
})

// T-7C: Inventory Item Management Flow
describe.skip('InventoryPage — US-INV-3: add / edit item', () => {
  it.todo('opens the add-item form when the "+ Add item" button is clicked')
  it.todo('fires the POST /inventory API call with the correct payload on form submit')
  it.todo('opens the edit form pre-filled with server data when an existing item is clicked')
  it.todo('fires the PATCH /inventory/:id call on edit form submit')
  it.todo('shows a validation error and does not submit when required fields are empty')
})
