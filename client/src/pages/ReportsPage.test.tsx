import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardSummary } from '@umgccapstone/contracts'
import type { CategorySummaryRow } from '../types/reports'
import ReportsPage from './ReportsPage'
import { fetchDashboardSummary, fetchCategoryReport } from '../services'

vi.mock('../services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services')>()
  return {
    ...actual,
    fetchDashboardSummary: vi.fn(),
    fetchCategoryReport: vi.fn(),
  }
})

const kpiFixture: DashboardSummary = {
  totalItems: 42,
  lowStockCount: 13,
  expiringSoonCount: 7,
  atRiskValue: 999.99,
  lastUpdatedAt: null,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportsPage />
    </QueryClientProvider>,
  )
}

const categoryFixture: CategorySummaryRow[] = [
  { category: 'PRODUCE', itemCount: 6, totalValue: 120.5, lowStockCount: 1 },
  { category: 'MEAT', itemCount: 4, totalValue: 350.0, lowStockCount: 2 },
]

beforeEach(() => {
  vi.mocked(fetchDashboardSummary).mockResolvedValue(kpiFixture)
  vi.mocked(fetchCategoryReport).mockResolvedValue(categoryFixture)
})

afterEach(() => {
  vi.clearAllMocks()
})

// T-10A: Reports — Basic KPI Cards
describe('ReportsPage — US-REP-1: KPI cards', () => {
  it('renders the page without crashing when mounted with mock report data', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: /reports/i })).toBeInTheDocument()
  })

  it('displays server-computed KPI values (totalItems, expiringSoonCount, atRiskValue, lowStockCount)', async () => {
    renderPage()
    expect(await screen.findByText('42')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('$999.99')).toBeInTheDocument()
    expect(screen.getByText('13')).toBeInTheDocument()
  })

  it('shows the empty state when totalItems is 0', async () => {
    vi.mocked(fetchDashboardSummary).mockResolvedValue({ ...kpiFixture, totalItems: 0 })
    renderPage()
    expect(
      await screen.findByText(/no inventory items yet/i),
    ).toBeInTheDocument()
  })
})

// T-10B: Reports — Category Summary Table
describe('ReportsPage — US-REP-2: category summary', () => {
  it('renders a row for each category in the mock report response', async () => {
    renderPage()
    expect(await screen.findByText('Produce')).toBeInTheDocument()
    expect(screen.getByText('Meat')).toBeInTheDocument()
  })

  it('displays server-computed per-category item count, total value, and low-stock count', async () => {
    renderPage()
    expect(await screen.findByText('6')).toBeInTheDocument()
    expect(screen.getByText('$120.50')).toBeInTheDocument()
    expect(screen.getByText('$350.00')).toBeInTheDocument()
  })

  it('shows the empty-table state when the category list is empty', async () => {
    vi.mocked(fetchCategoryReport).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/no category data yet/i)).toBeInTheDocument()
  })
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
