import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  DashboardSummary,
  CategorySummaryRow,
  Recommendation,
  InventoryItem,
  MenuItem,
} from '@umgccapstone/contracts'
import ReportsPage from './ReportsPage'
import {
  fetchDashboardSummary,
  fetchCategoryReport,
  fetchRecommendations,
  fetchDashboardAlerts,
  fetchMenuItems,
} from '../services'

vi.mock('../services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services')>()
  return {
    ...actual,
    fetchDashboardSummary: vi.fn(),
    fetchCategoryReport: vi.fn(),
    fetchRecommendations: vi.fn(),
    fetchDashboardAlerts: vi.fn(),
    fetchMenuItems: vi.fn(),
  }
})

// The donut renders via SVG (needs ResizeObserver/layout jsdom lacks). Stub it —
// the category assertions target the accompanying HTML legend, which carries the
// same figures and is the chart's text alternative.
vi.mock('@mui/x-charts/PieChart', () => ({ PieChart: () => null }))

const kpiFixture: DashboardSummary = {
  totalItems: 42,
  lowStockCount: 13,
  expiringSoonCount: 7,
  atRiskValue: 999.99,
  lastUpdatedAt: null,
}

const categoryFixture: CategorySummaryRow[] = [
  { category: 'PRODUCE', itemCount: 6, totalValue: 120.5, lowStockCount: 1 },
  { category: 'MEAT', itemCount: 4, totalValue: 350.0, lowStockCount: 2 },
]

// Recommendation history fixture (US-REP-3). PROPOSED is included to prove the
// component filters it out (still pending, not history).
const recBase = {
  explanation: 'Uses at-risk stock.',
  source: 'AI' as const,
  menuItemId: null,
  ingredientsUsed: [],
  isAvailable: true,
  limitingIngredientId: null,
  kind: 'NEW' as const,
  category: 'MAIN' as const,
  foodCost: 4,
  suggestedPrice: 13.33,
  margin: 0.7,
  usesExpiringItems: true,
}
const recommendationFixture: Recommendation[] = [
  { ...recBase, id: 'rec-1', name: 'Tomato Basil Risotto', status: 'ACCEPTED', createdAt: '2026-06-01T12:00:00.000Z' },
  { ...recBase, id: 'rec-2', name: 'Caprese Salad', status: 'DISMISSED', source: 'FALLBACK', createdAt: '2026-05-20T12:00:00.000Z' },
  { ...recBase, id: 'rec-3', name: 'Pending Special', status: 'PROPOSED', createdAt: '2026-06-02T12:00:00.000Z' },
]

// Waste-risk fixture (US-REP-4) — at-risk items from /dashboard/alerts.
const alertsFixture: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Atlantic Salmon',
    category: 'SEAFOOD',
    unitCost: 12,
    parLevel: 5,
    expirationDate: '2026-07-02T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    quantity: 8,
    unit: 'lb',
    isLowStock: false,
    isExpiringSoon: true,
    atRiskValue: 88.5,
  },
]

// Top-dishes-by-margin fixture (T-10S folded section). The ARCHIVED dish must be
// excluded from the ranking.
const menuFixture: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Branzino Special',
    category: 'MAIN',
    usesExpiringItems: false,
    isSpecial: true,
    status: 'ACTIVE',
    ingredients: [],
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    isAvailable: true,
    limitingIngredientId: null,
    foodCost: 9.6,
    suggestedPrice: 32,
    margin: 0.7,
  },
  {
    id: 'menu-3',
    name: 'Garden Salad',
    category: 'APPETIZER',
    usesExpiringItems: false,
    isSpecial: false,
    status: 'ACTIVE',
    ingredients: [],
    createdAt: '2026-06-02T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
    isAvailable: true,
    limitingIngredientId: null,
    foodCost: 5.4,
    suggestedPrice: 18,
    margin: 0.7,
  },
  {
    id: 'menu-2',
    name: 'Old Archived Dish',
    category: 'MAIN',
    usesExpiringItems: false,
    isSpecial: false,
    status: 'ARCHIVED',
    ingredients: [],
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    isAvailable: false,
    limitingIngredientId: null,
    foodCost: 5,
    suggestedPrice: 20,
    margin: 0.95,
  },
]

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportsPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchDashboardSummary).mockResolvedValue(kpiFixture)
  vi.mocked(fetchCategoryReport).mockResolvedValue(categoryFixture)
  vi.mocked(fetchRecommendations).mockResolvedValue(recommendationFixture)
  vi.mocked(fetchDashboardAlerts).mockResolvedValue(alertsFixture)
  vi.mocked(fetchMenuItems).mockResolvedValue(menuFixture)
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
    expect(await screen.findByText(/no inventory items yet/i)).toBeInTheDocument()
  })
})

// T-10B: Reports — Category Summary Table
describe('ReportsPage — US-REP-2: category summary', () => {
  it('renders a row for each category in the mock report response', async () => {
    renderPage()
    expect(await screen.findByText('Produce')).toBeInTheDocument()
    expect(screen.getByText('Meat')).toBeInTheDocument()
  })

  it('shows each category total value and item count in the donut legend', async () => {
    renderPage()
    expect(await screen.findByText('$120.50')).toBeInTheDocument()
    expect(screen.getByText('$350.00')).toBeInTheDocument()
    expect(screen.getByText('6 items')).toBeInTheDocument()
    expect(screen.getByText('4 items')).toBeInTheDocument()
  })

  it('shows the empty state when the category list is empty', async () => {
    vi.mocked(fetchCategoryReport).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/no category data yet/i)).toBeInTheDocument()
  })
})

// T-10C: Reports — Recommendation History & Waste-Risk
describe('ReportsPage — US-REP-3: recommendation history', () => {
  it('renders the recommendation history list from the mock API response', async () => {
    renderPage()
    expect(await screen.findByText('Tomato Basil Risotto')).toBeInTheDocument()
    expect(screen.getByText('Caprese Salad')).toBeInTheDocument()
  })

  it('shows accepted vs dismissed status and hides still-pending PROPOSED recs', async () => {
    renderPage()
    await screen.findByText('Tomato Basil Risotto')
    // Status labels appear on both the row chips and the filter chips, so match all.
    expect(screen.getAllByText('Accepted').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dismissed').length).toBeGreaterThan(0)
    expect(screen.queryByText('Pending Special')).not.toBeInTheDocument()
  })

  it('shows the empty state when no actioned recommendations exist', async () => {
    vi.mocked(fetchRecommendations).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/no recommendation history yet/i)).toBeInTheDocument()
  })
})

describe('ReportsPage — US-REP-4: waste-risk summary', () => {
  it('renders the waste-risk list from server-computed alert fields', async () => {
    renderPage()
    expect(await screen.findByText('Atlantic Salmon')).toBeInTheDocument()
  })

  it('displays the estimated value at risk and the risk reason from the API', async () => {
    renderPage()
    expect(await screen.findByText('$88.50')).toBeInTheDocument()
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
  })

  it('shows the empty state when there are no at-risk items', async () => {
    vi.mocked(fetchDashboardAlerts).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/no items at risk/i)).toBeInTheDocument()
  })
})

// T-10S (folded into the T-10C round): Top dishes by suggested price
describe('ReportsPage — T-10S: top dishes by price', () => {
  it('ranks ACTIVE dishes by server-computed suggested price', async () => {
    renderPage()
    expect(await screen.findByText('Branzino Special')).toBeInTheDocument()
    expect(screen.getByText('Garden Salad')).toBeInTheDocument()
    expect(screen.getByText('$32.00')).toBeInTheDocument()
    expect(screen.getByText('$18.00')).toBeInTheDocument()
  })

  it('excludes archived dishes from the ranking', async () => {
    renderPage()
    await screen.findByText('Branzino Special')
    expect(screen.queryByText('Old Archived Dish')).not.toBeInTheDocument()
  })

  it('shows the empty state when there are no dishes', async () => {
    vi.mocked(fetchMenuItems).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/no dishes yet/i)).toBeInTheDocument()
  })
})
