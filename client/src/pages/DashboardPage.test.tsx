import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('../services/apiClient', () => ({
  apiClient: { get: vi.fn() },
  setAuthHandlers: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
    <a href={to} {...props}>{children}</a>
  ),
}))

import DashboardPage from './DashboardPage'
import { apiClient } from '../services/apiClient'

const getMock = vi.mocked(apiClient.get)

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

function makeSummary(overrides = {}) {
  return { totalItems: 10, lowStockCount: 0, expiringSoonCount: 0, atRiskValue: 0, lastUpdatedAt: null, ...overrides }
}

function makeItem(overrides = {}) {
  return {
    id: 'item-1',
    name: 'Tomatoes',
    category: 'PRODUCE',
    quantity: 2,
    unit: 'kg',
    unitCost: 5,
    parLevel: 10,
    expirationDate: null,
    supplierId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    isLowStock: true,
    isExpiringSoon: false,
    atRiskValue: 10,
    ...overrides,
  }
}

// DashboardPage now composes AlertsSection (T-6B), which fetches /dashboard/alerts.
// US-DASH-1 specs mock by path so that call resolves to an empty list and the
// summary-card assertions stay isolated from the alerts section.
function summaryOnly(summary: unknown) {
  return (path: string) =>
    path === '/dashboard/summary' ? Promise.resolve(summary) : Promise.resolve([])
}

beforeEach(() => vi.clearAllMocks())

// T-6A: Dashboard Summary Cards & Metrics
describe('DashboardPage — US-DASH-1: summary cards & metrics', () => {
  it('renders the page without crashing when mounted with mock data', async () => {
    getMock.mockImplementation(summaryOnly({ totalItems: 10, lowStockCount: 2, expiringSoonCount: 1, atRiskValue: 50 }))

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Total items')).toBeInTheDocument()
    })
  })

  it('displays atRiskValue from the API response — does not compute from raw inventory', async () => {
    getMock.mockImplementation(summaryOnly({ totalItems: 5, lowStockCount: 0, expiringSoonCount: 0, atRiskValue: 123.45 }))

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('$123.45')).toBeInTheDocument()
    })
    expect(getMock).toHaveBeenCalledWith('/dashboard/summary')
    expect(getMock).not.toHaveBeenCalledWith(expect.stringContaining('/inventory'))
  })

  it('shows all four KPI cards with live values from the API', async () => {
    getMock.mockImplementation(summaryOnly({ totalItems: 42, lowStockCount: 3, expiringSoonCount: 7, atRiskValue: 250 }))

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('$250.00')).toBeInTheDocument()
    })
  })

  it('shows zero counts cleanly for empty inventory (all-zero summary, not an error)', async () => {
    getMock.mockImplementation(summaryOnly({ totalItems: 0, lowStockCount: 0, expiringSoonCount: 0, atRiskValue: 0 }))

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows a loading state while summary data is fetching', async () => {
    getMock.mockImplementation((path: string) =>
      path === '/dashboard/summary' ? new Promise(() => {}) : Promise.resolve([]),
    )

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Loading inventory summary…')).toBeInTheDocument()
    })
  })

  it('shows an error state if the summary API call fails', async () => {
    getMock.mockImplementation((path: string) =>
      path === '/dashboard/summary' ? Promise.reject(new Error('Network error')) : Promise.resolve([]),
    )

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

// T-6B: Dashboard Urgent Alerts Section
describe('DashboardPage — US-DASH-2: urgent alerts', () => {
  it('renders alerts for items where isExpiringSoon or isLowStock is set in the server response', async () => {
    getMock.mockImplementation((path: string) => {
      if (path === '/dashboard/summary') return Promise.resolve(makeSummary())
      if (path === '/dashboard/alerts')
        return Promise.resolve([
          makeItem({ name: 'Tomatoes', isLowStock: true }),
          makeItem({ id: 'item-2', name: 'Basil', isLowStock: false, isExpiringSoon: true, expirationDate: '2026-06-21T00:00:00.000Z' }),
        ])
      return Promise.resolve([])
    })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument()
      expect(screen.getByText('Basil')).toBeInTheDocument()
    })
  })

  it('shows the empty alerts state when no items are at risk', async () => {
    getMock.mockImplementation((path: string) => {
      if (path === '/dashboard/summary') return Promise.resolve(makeSummary())
      return Promise.resolve([])
    })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => expect(screen.getByText('No active alerts')).toBeInTheDocument())
  })

  it('displays urgency labels from the server field — does not derive them from dates or quantities', async () => {
    getMock.mockImplementation((path: string) => {
      if (path === '/dashboard/summary') return Promise.resolve(makeSummary())
      if (path === '/dashboard/alerts')
        return Promise.resolve([
          makeItem({ isLowStock: true, isExpiringSoon: false }),
          makeItem({ id: 'item-2', name: 'Basil', isLowStock: false, isExpiringSoon: true, expirationDate: '2026-06-21T00:00:00.000Z' }),
        ])
      return Promise.resolve([])
    })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Below par')).toBeInTheDocument()
      expect(screen.getByText('Expiring soon')).toBeInTheDocument()
    })
    expect(getMock).toHaveBeenCalledWith('/dashboard/alerts')
  })

  it('shows loading state while alerts are fetching', async () => {
    getMock.mockImplementation((path: string) => {
      if (path === '/dashboard/summary') return Promise.resolve(makeSummary())
      return new Promise(() => {})
    })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => expect(screen.getByText('Loading alerts…')).toBeInTheDocument())
  })

  it('shows error state if the alerts API call fails', async () => {
    getMock.mockImplementation((path: string) => {
      if (path === '/dashboard/summary') return Promise.resolve(makeSummary())
      return Promise.reject(new Error('Network error'))
    })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => expect(screen.getByText("Couldn't load alerts")).toBeInTheDocument())
  })
})

// T-6C: Dashboard AI Recommendation Preview Cards
describe('DashboardPage — US-DASH-3: AI recommendation preview', () => {
  const contentFixture = [
    { id: '1', name: 'Spaghetti Carbonara', summary: 'Classic Italian pasta with eggs and pancetta' },
    { id: '2', name: 'Veggie Risotto', summary: 'Seasonal vegetables with arborio rice' },
  ]
  const availabilityFixture = [
    { id: '1', isAvailable: true, limitingIngredient: null },
    { id: '2', isAvailable: false, limitingIngredient: 'Arborio rice' },
  ]

  function t6cImpl(overrides: { previews?: unknown; availability?: unknown } = {}) {
    const previews = 'previews' in overrides ? overrides.previews : contentFixture
    const availability = 'availability' in overrides ? overrides.availability : availabilityFixture
    return (path: string) => {
      if (path === '/dashboard/summary') return Promise.resolve(makeSummary())
      if (path === '/dashboard/alerts') return Promise.resolve([])
      if (path === '/dashboard/recommendations/preview') return Promise.resolve(previews)
      if (path === '/menu/availability') return Promise.resolve(availability)
      return Promise.resolve([])
    }
  }

  it('renders recommendation preview cards from the mock API response', async () => {
    getMock.mockImplementation(t6cImpl())
    render(<DashboardPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument()
      expect(screen.getByText('Veggie Risotto')).toBeInTheDocument()
    })
  })

  it('displays server-computed availability and limiting-ingredient fields on each card', async () => {
    getMock.mockImplementation(t6cImpl())
    render(<DashboardPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText('Available')).toBeInTheDocument()
      expect(screen.getByText('Not available')).toBeInTheDocument()
      expect(screen.getByText('Arborio rice')).toBeInTheDocument()
    })
  })

  it('navigates to the Menu Builder when a recommendation card CTA is clicked', async () => {
    getMock.mockImplementation(t6cImpl())
    render(<DashboardPage />, { wrapper })
    const buttons = await screen.findAllByRole('button', { name: /build/i })
    fireEvent.click(buttons[0])
    expect(mockNavigate).toHaveBeenCalledWith('/menu')
  })

  it('shows the empty state when the recommendations list is empty', async () => {
    getMock.mockImplementation(t6cImpl({ previews: [] }))
    render(<DashboardPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText(/no recommendations yet/i)).toBeInTheDocument()
    })
  })

  it('renders at most 3 cards even when the API returns more than 3', async () => {
    const manyPreviews = [
      { id: '1', name: 'Dish One', summary: 'Summary one' },
      { id: '2', name: 'Dish Two', summary: 'Summary two' },
      { id: '3', name: 'Dish Three', summary: 'Summary three' },
      { id: '4', name: 'Dish Four', summary: 'Summary four' },
      { id: '5', name: 'Dish Five', summary: 'Summary five' },
    ]
    getMock.mockImplementation(t6cImpl({ previews: manyPreviews }))
    render(<DashboardPage />, { wrapper })
    await waitFor(() => expect(screen.getByText('Dish One')).toBeInTheDocument())
    const buttons = screen.getAllByRole('button', { name: /build/i })
    expect(buttons).toHaveLength(3)
    expect(screen.queryByText('Dish Four')).toBeNull()
    expect(screen.queryByText('Dish Five')).toBeNull()
  })
})

// T-42: Dashboard (Today) layout — mockup grid (KPI row + Alerts | AI preview)
describe('DashboardPage — T-42: layout grid', () => {
  function layoutImpl(path: string) {
    if (path === '/dashboard/summary')
      return Promise.resolve(makeSummary({ totalItems: 9, lowStockCount: 8, expiringSoonCount: 2, atRiskValue: 120 }))
    if (path === '/dashboard/alerts')
      return Promise.resolve([
        makeItem({ name: 'Basil', isLowStock: false, isExpiringSoon: true, expirationDate: '2026-07-01T00:00:00.000Z' }),
      ])
    if (path === '/dashboard/recommendations/preview')
      return Promise.resolve([{ id: '1', name: 'Branzino Special', summary: 'Uses branzino + basil' }])
    if (path === '/menu/availability')
      return Promise.resolve([{ id: '1', isAvailable: true, limitingIngredient: null }])
    return Promise.resolve([])
  }

  it('composes the KPI cards, urgent alerts, and recommendation preview on one page', async () => {
    getMock.mockImplementation(layoutImpl)
    render(<DashboardPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText('Total items')).toBeInTheDocument() // KPI row
      expect(screen.getByText('Basil')).toBeInTheDocument() // alerts column
      expect(screen.getByText('Branzino Special')).toBeInTheDocument() // preview column
    })
  })

  it('places alerts and the recommendation preview inside the two-column container', async () => {
    getMock.mockImplementation(layoutImpl)
    render(<DashboardPage />, { wrapper })
    const columns = await screen.findByTestId('dashboard-columns')
    expect(columns).toContainElement(screen.getByLabelText('Inventory alerts'))
    expect(columns).toContainElement(screen.getByLabelText('AI recommendation preview'))
  })

  it('no longer renders the unwired "Current inventory" panel (TodayDashboard retired — ADR 0009)', async () => {
    getMock.mockImplementation(layoutImpl)
    render(<DashboardPage />, { wrapper })
    await waitFor(() => expect(screen.getByText('Total items')).toBeInTheDocument())
    expect(screen.queryByText('Current inventory')).toBeNull()
  })
})
