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
      expect(screen.getByText('Total Items')).toBeInTheDocument()
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
      expect(screen.getByText('Below Par')).toBeInTheDocument()
      expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
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
    const buttons = await screen.findAllByRole('button', { name: /go to menu builder/i })
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
})
