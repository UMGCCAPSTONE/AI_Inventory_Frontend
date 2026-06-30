import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Page asserts target the literal path passed to apiClient (CONTEXT.md "API path
// assertion"), so we mock apiClient and dispatch GET by path.
vi.mock('../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    // useAllInventory (Add Dish ingredient picker) fetches via apiClient.list;
    // resolve it to an empty page so the page mounts cleanly in tests.
    list: vi.fn(() => Promise.resolve({ data: [], meta: {} })),
  },
  setAuthHandlers: vi.fn(),
}))

import MenuBuilderPage from './MenuBuilderPage'
import { apiClient } from '../services/apiClient'
import { ToastProvider } from '../components/Toaster'

const getMock = vi.mocked(apiClient.get)
const postMock = vi.mocked(apiClient.post)
const patchMock = vi.mocked(apiClient.patch)

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  )
}

function makeRec(overrides = {}) {
  return {
    id: 'r1',
    name: 'Tomato Basil Soup',
    explanation: 'Uses up surplus tomatoes before they expire.',
    status: 'PROPOSED',
    source: 'AI',
    menuItemId: null,
    ingredientsUsed: [
      { id: 'l1', inventoryItemId: 'inv-tomato', name: 'Tomato', quantity: 2, unit: 'kg' },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    isAvailable: true,
    limitingIngredientId: null,
    kind: 'NEW',
    usesExpiringItems: false,
    foodCost: 3.5,
    suggestedPrice: 11.67,
    margin: 0.7,
    ...overrides,
  }
}

function makeMenuItem(overrides = {}) {
  return {
    id: 'm1',
    name: 'House Salad',
    isSpecial: false,
    status: 'ACTIVE',
    ingredients: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    isAvailable: true,
    limitingIngredientId: null,
    foodCost: 4,
    suggestedPrice: 13.33,
    margin: 0.7,
    ...overrides,
  }
}

// Resolve the page's two GETs by path; tests pass the recommendation/menu sets.
function respondWith({
  recommendations = [],
  menu = [],
}: {
  recommendations?: unknown[]
  menu?: unknown[]
}) {
  getMock.mockImplementation((path: string) => {
    if (path === '/recommendations') return Promise.resolve(recommendations)
    if (path === '/menu/availability') return Promise.resolve(menu)
    return Promise.resolve([])
  })
}

beforeEach(() => vi.clearAllMocks())

// T-8A: Menu Builder — Page Layout & Generate Flow
describe('MenuBuilderPage — US-MENU-1: page layout & generate', () => {
  it('renders the page with both the specials and current-menu sections', () => {
    respondWith({})
    render(<MenuBuilderPage />, { wrapper })

    expect(screen.getByRole('heading', { name: 'Menu Builder' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'AI Suggested Specials' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Current menu' })).toBeInTheDocument()
  })

  it('shows the "Generate recommendations" button in the initial state', () => {
    respondWith({})
    render(<MenuBuilderPage />, { wrapper })
    expect(screen.getByRole('button', { name: /generate recommendations/i })).toBeInTheDocument()
  })

  it('fires POST /recommendations/generate when the generate button is clicked', async () => {
    respondWith({})
    postMock.mockResolvedValue([])
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(screen.getByRole('button', { name: /generate recommendations/i }))

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/recommendations/generate'))
  })

  it('shows a loading state while generation is in flight', async () => {
    // Seed one rec so the empty-state (which renders its own Generate CTA) is not
    // shown — keeps a single, unambiguous generate button to assert on.
    respondWith({ recommendations: [makeRec()] })
    postMock.mockReturnValue(new Promise(() => {})) // never resolves
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(await screen.findByRole('button', { name: /generate recommendations/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled())
  })

  it('renders the recommendation list when the API responds with results', async () => {
    respondWith({ recommendations: [makeRec()] })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByText('Tomato Basil Soup')).toBeInTheDocument()
  })

  it('shows an error with a retry option when generation fails', async () => {
    respondWith({})
    postMock.mockRejectedValue(new Error('AI upstream down'))
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(screen.getByRole('button', { name: /generate recommendations/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})

// T-8B: Recommendation Cards — Detail, Explanation & Actions
describe('MenuBuilderPage — US-MENU-2: recommendation detail', () => {
  it('renders a card for each recommendation in the API response', async () => {
    respondWith({
      recommendations: [makeRec({ id: 'r1', name: 'Soup' }), makeRec({ id: 'r2', name: 'Stew' })],
    })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByRole('article', { name: 'Soup' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Stew' })).toBeInTheDocument()
  })

  it('displays availability from isAvailable — does not recompute from stock', async () => {
    respondWith({
      recommendations: [makeRec({ isAvailable: false, limitingIngredientId: 'inv-tomato' })],
    })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByText('Unavailable')).toBeInTheDocument()
    expect(screen.getByText(/Limited by Tomato/)).toBeInTheDocument()
  })

  it('renders the explanation as plain text', async () => {
    respondWith({ recommendations: [makeRec({ explanation: 'Plain reasoning text.' })] })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByText('Plain reasoning text.')).toBeInTheDocument()
  })

  it('shows food cost, suggested price, and margin from server-computed fields', async () => {
    respondWith({ recommendations: [makeRec({ foodCost: 3.5, suggestedPrice: 11.67, margin: 0.7 })] })
    render(<MenuBuilderPage />, { wrapper })

    await screen.findByText('Tomato Basil Soup')
    expect(screen.getByText('$11.67')).toBeInTheDocument() // suggested price, prominent
    expect(screen.getByText(/70% margin/)).toBeInTheDocument()
    expect(screen.getByText(/Food cost \$3\.50/)).toBeInTheDocument()
  })

  it('shows the "uses expiring items" badge when the field is set', async () => {
    respondWith({ recommendations: [makeRec({ usesExpiringItems: true })] })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByText('Uses expiring items')).toBeInTheDocument()
  })

  it('expands the recipe to show ingredients', async () => {
    respondWith({ recommendations: [makeRec()] })
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(await screen.findByRole('button', { name: /view recipe/i }))
    expect(await screen.findByText(/Tomato — 2 kg/)).toBeInTheDocument()
  })
})

describe('MenuBuilderPage — US-MENU-3/4/5: accept / dismiss / save', () => {
  it('fires PATCH /recommendations/:id with status ACCEPTED on accept', async () => {
    respondWith({ recommendations: [makeRec({ id: 'r1' })] })
    patchMock.mockResolvedValue(makeRec({ id: 'r1', status: 'ACCEPTED' }))
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(await screen.findByRole('button', { name: 'Accept' }))

    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith('/recommendations/r1', { status: 'ACCEPTED' }),
    )
  })

  it('fires PATCH with status DISMISSED on dismiss', async () => {
    respondWith({ recommendations: [makeRec({ id: 'r1' })] })
    patchMock.mockResolvedValue(makeRec({ id: 'r1', status: 'DISMISSED' }))
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(await screen.findByRole('button', { name: 'Dismiss' }))

    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith('/recommendations/r1', { status: 'DISMISSED' }),
    )
  })

  it('fires PATCH with status SAVED on save', async () => {
    respondWith({ recommendations: [makeRec({ id: 'r1' })] })
    patchMock.mockResolvedValue(makeRec({ id: 'r1', status: 'SAVED' }))
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith('/recommendations/r1', { status: 'SAVED' }),
    )
  })

  it('surfaces an error when an action fails', async () => {
    respondWith({ recommendations: [makeRec({ id: 'r1' })] })
    patchMock.mockRejectedValue(new Error('write failed'))
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(await screen.findByRole('button', { name: 'Dismiss' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})

describe('MenuBuilderPage — ADR 0014: kind-aware actions', () => {
  it('hides Accept for an EXISTING recommendation (dismiss/save only)', async () => {
    respondWith({ recommendations: [makeRec({ kind: 'EXISTING', menuItemId: 'm9' })] })
    render(<MenuBuilderPage />, { wrapper })

    await screen.findByRole('article', { name: 'Tomato Basil Soup' })
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('omits an accepted recommendation from the Active list (it moves to the menu) — T-72', async () => {
    respondWith({ recommendations: [makeRec({ status: 'ACCEPTED' })] })
    render(<MenuBuilderPage />, { wrapper })

    // Active = PROPOSED only: an accepted dish is now a menu item, so it drops
    // out of the AI-generated queue (reachable via Current menu + history).
    expect(await screen.findByText('No recommendations yet')).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Tomato Basil Soup' })).toBeNull()
  })
})

describe('MenuBuilderPage — US-MENU-6: empty & fallback', () => {
  it('shows the empty state when no recommendations are available', async () => {
    respondWith({ recommendations: [] })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByText('No recommendations yet')).toBeInTheDocument()
  })

  it('flags a fallback recommendation', async () => {
    respondWith({
      recommendations: [makeRec({ source: 'FALLBACK', kind: 'EXISTING', menuItemId: 'm9' })],
    })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByText('Fallback')).toBeInTheDocument()
  })
})

describe('MenuBuilderPage — current menu section', () => {
  it('lists ACTIVE menu items and omits archived ones', async () => {
    respondWith({
      menu: [
        makeMenuItem({ id: 'm1', name: 'House Salad' }),
        makeMenuItem({ id: 'm2', name: 'Old Special', status: 'ARCHIVED' }),
      ],
    })
    render(<MenuBuilderPage />, { wrapper })

    expect(await screen.findByText('House Salad')).toBeInTheDocument()
    expect(screen.queryByText('Old Special')).toBeNull()
  })

  it('deletes a dish via the kebab + confirm dialog — PATCH status ARCHIVED (T-72)', async () => {
    respondWith({ menu: [makeMenuItem({ id: 'm1', name: 'House Salad' })] })
    patchMock.mockResolvedValue(makeMenuItem({ id: 'm1', status: 'ARCHIVED' }))
    render(<MenuBuilderPage />, { wrapper })

    await screen.findByText('House Salad')
    // Open the kebab menu, then choose Delete.
    fireEvent.click(screen.getByRole('button', { name: 'Actions for House Salad' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))

    // Confirm dialog opens; confirming fires the archive PATCH.
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith('/menu-items/m1', { status: 'ARCHIVED' }),
    )
  })

  it('toggles a dish to special via the kebab — PATCH isSpecial true (T-72)', async () => {
    respondWith({ menu: [makeMenuItem({ id: 'm1', name: 'House Salad', isSpecial: false })] })
    patchMock.mockResolvedValue(makeMenuItem({ id: 'm1', isSpecial: true }))
    render(<MenuBuilderPage />, { wrapper })

    await screen.findByText('House Salad')
    fireEvent.click(screen.getByRole('button', { name: 'Actions for House Salad' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Make special' }))

    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith('/menu-items/m1', { isSpecial: true }),
    )
  })
})

describe('MenuBuilderPage — saved/history filter (T-8S folded)', () => {
  it('the Saved filter shows only SAVED recommendations', async () => {
    respondWith({
      recommendations: [
        makeRec({ id: 'r1', name: 'Active One', status: 'PROPOSED' }),
        makeRec({ id: 'r2', name: 'Saved One', status: 'SAVED' }),
      ],
    })
    render(<MenuBuilderPage />, { wrapper })

    // Default (Active) view: the proposed one shows, the saved one does not.
    expect(await screen.findByRole('article', { name: 'Active One' })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Saved One' })).toBeNull()

    // Switch to Saved.
    fireEvent.click(screen.getByText('Saved'))
    expect(await screen.findByRole('article', { name: 'Saved One' })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Active One' })).toBeNull()
  })
})

describe('MenuBuilderPage — Add Dish', () => {
  it('opens the Add Dish form', async () => {
    respondWith({})
    render(<MenuBuilderPage />, { wrapper })

    fireEvent.click(screen.getByRole('button', { name: '+ Add Dish' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
  })
})
