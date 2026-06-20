import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardSummary, InventoryItem, Supplier } from '@umgccapstone/contracts'
import InventoryPage from './InventoryPage'
import { ToastProvider } from '../components/Toaster'
import { ApiError } from '../types/api'
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchDashboardSummary,
  fetchInventory,
  fetchSuppliers,
  updateInventoryItem,
} from '../services'

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
    createInventoryItem: vi.fn(),
    updateInventoryItem: vi.fn(),
    deleteInventoryItem: vi.fn(),
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
      <ToastProvider>
        <InventoryPage />
      </ToastProvider>
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
const supplier: Supplier = {
  id: 'sup-1',
  name: 'Fresh Farms',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
}

const item: InventoryItem = {
  id: 'item-1',
  name: 'Roma tomato',
  category: 'PRODUCE',
  quantity: 5,
  unit: 'kg',
  unitCost: 2,
  parLevel: 3,
  expirationDate: null,
  supplierId: 'sup-1',
  createdAt: '2026-06-16T00:00:00Z',
  updatedAt: '2026-06-16T00:00:00Z',
  isLowStock: false,
  isExpiringSoon: false,
  atRiskValue: 0,
}

function fillNumber(dialog: HTMLElement, label: RegExp, value: string) {
  fireEvent.change(within(dialog).getByLabelText(label), { target: { value } })
}

describe('InventoryPage — US-INV-3: add / edit / delete item', () => {
  beforeEach(() => {
    vi.mocked(fetchDashboardSummary).mockResolvedValue(summary)
    vi.mocked(fetchInventory).mockResolvedValue({ items: [item], total: 1, page: 1, pageSize: 20 })
    vi.mocked(fetchSuppliers).mockResolvedValue([supplier])
  })

  it('opens the add-item form when the "+ Add Item" button is clicked', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /add item/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: /add item/i })).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/name/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it('fires createInventoryItem with the correct payload on submit', async () => {
    vi.mocked(createInventoryItem).mockResolvedValue(item)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /add item/i }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(within(dialog).getByLabelText(/name/i), { target: { value: 'Basil' } })
    fillNumber(dialog, /quantity/i, '4')
    fillNumber(dialog, /par level/i, '2')
    fillNumber(dialog, /unit cost/i, '1.5')

    fireEvent.click(within(dialog).getByRole('button', { name: /add item/i }))

    await waitFor(() =>
      expect(createInventoryItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Basil',
          quantity: 4,
          parLevel: 2,
          unitCost: 1.5,
          category: 'PRODUCE',
          unit: 'each',
          expirationDate: null,
        }),
      ),
    )
  })

  it('shows a validation error and does not submit when required fields are empty', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /add item/i }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.click(within(dialog).getByRole('button', { name: /add item/i }))

    await waitFor(() =>
      expect(within(dialog).getByLabelText(/quantity/i)).toHaveAttribute('aria-invalid', 'true'),
    )
    expect(createInventoryItem).not.toHaveBeenCalled()
  })

  it('opens the edit form pre-filled with the item, including supplier', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText(/name/i)).toHaveValue('Roma tomato')
    expect(within(dialog).getByLabelText(/par level/i)).toHaveValue(3)
    // Supplier select is populated from the API and shows the linked supplier.
    expect(within(dialog).getByText('Fresh Farms')).toBeInTheDocument()
  })

  it('fires updateInventoryItem on edit submit', async () => {
    vi.mocked(updateInventoryItem).mockResolvedValue(item)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(within(dialog).getByLabelText(/name/i), { target: { value: 'Roma tomatoes' } })
    fireEvent.click(within(dialog).getByRole('button', { name: /save changes/i }))

    await waitFor(() =>
      expect(updateInventoryItem).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({ name: 'Roma tomatoes' }),
      ),
    )
  })

  it('maps a server 400 with a field onto that input', async () => {
    vi.mocked(createInventoryItem).mockRejectedValue(
      new ApiError({ code: 'DUPLICATE_NAME', message: 'Name already exists', field: 'name' }, 400),
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /add item/i }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(within(dialog).getByLabelText(/name/i), { target: { value: 'Basil' } })
    fillNumber(dialog, /quantity/i, '4')
    fillNumber(dialog, /par level/i, '2')
    fillNumber(dialog, /unit cost/i, '1.5')
    fireEvent.click(within(dialog).getByRole('button', { name: /add item/i }))

    expect(await within(dialog).findByText('Name already exists')).toBeInTheDocument()
  })

  it('deletes an item after confirmation by name', async () => {
    vi.mocked(deleteInventoryItem).mockResolvedValue(undefined)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(within(dialog).getByLabelText(/item name/i), {
      target: { value: 'Roma tomato' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteInventoryItem).toHaveBeenCalledWith('item-1'))
  })

  it('keeps the item and shows the dishes on a 409 ITEM_IN_USE', async () => {
    vi.mocked(deleteInventoryItem).mockRejectedValue(
      new ApiError(
        { code: 'ITEM_IN_USE', message: 'In use by: Margherita Pizza, Caprese Salad' },
        409,
      ),
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(within(dialog).getByLabelText(/item name/i), {
      target: { value: 'Roma tomato' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(await within(dialog).findByText(/in use by: margherita pizza/i)).toBeInTheDocument()
    // The dialog stays open so the row is not removed.
    expect(within(dialog).getByRole('heading', { name: /delete item/i })).toBeInTheDocument()
  })
})
