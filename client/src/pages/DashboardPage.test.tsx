import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/apiClient', () => ({
  apiClient: { get: vi.fn() },
  setAuthHandlers: vi.fn(),
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

beforeEach(() => vi.clearAllMocks())

// T-6A: Dashboard Summary Cards & Metrics
describe('DashboardPage — US-DASH-1: summary cards & metrics', () => {
  it('renders the page without crashing when mounted with mock data', async () => {
    getMock.mockResolvedValue({ totalItems: 10, lowStockCount: 2, expiringSoonCount: 1, atRiskValue: 50 })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Total Items')).toBeInTheDocument()
    })
  })

  it('displays atRiskValue from the API response — does not compute from raw inventory', async () => {
    getMock.mockResolvedValue({ totalItems: 5, lowStockCount: 0, expiringSoonCount: 0, atRiskValue: 123.45 })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('$123.45')).toBeInTheDocument()
    })
    expect(getMock).toHaveBeenCalledWith('/dashboard/summary')
    expect(getMock).not.toHaveBeenCalledWith(expect.stringContaining('/inventory'))
  })

  it('shows all four KPI cards with live values from the API', async () => {
    getMock.mockResolvedValue({ totalItems: 42, lowStockCount: 3, expiringSoonCount: 7, atRiskValue: 250 })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('$250.00')).toBeInTheDocument()
    })
  })

  it('shows zero counts cleanly for empty inventory (all-zero summary, not an error)', async () => {
    getMock.mockResolvedValue({ totalItems: 0, lowStockCount: 0, expiringSoonCount: 0, atRiskValue: 0 })

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows a loading state while summary data is fetching', async () => {
    getMock.mockReturnValue(new Promise(() => {}))

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Loading inventory summary…')).toBeInTheDocument()
    })
  })

  it('shows an error state if the summary API call fails', async () => {
    getMock.mockRejectedValue(new Error('Network error'))

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
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
