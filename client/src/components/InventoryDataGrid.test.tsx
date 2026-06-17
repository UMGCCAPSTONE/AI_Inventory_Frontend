import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { InventoryItem } from '@umgccapstone/contracts'
import InventoryDataGrid from './InventoryDataGrid'
import { fetchInventory, fetchSuppliers } from '../services'

// MUI X DataGrid needs ResizeObserver + matchMedia, which jsdom doesn't provide.
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

// Mock the HTTP services; keep the real queryKeys registry + hooks.
vi.mock('../services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services')>()
  return { ...actual, fetchInventory: vi.fn(), fetchSuppliers: vi.fn() }
})

const mockFetchInventory = vi.mocked(fetchInventory)
const mockFetchSuppliers = vi.mocked(fetchSuppliers)

const sampleItem: InventoryItem = {
  id: '1',
  name: 'Roma tomato',
  category: 'PRODUCE',
  quantity: 5,
  unit: 'kg',
  unitCost: 2,
  parLevel: 3,
  expirationDate: null,
  createdAt: '2026-06-16T00:00:00Z',
  updatedAt: '2026-06-16T00:00:00Z',
  isLowStock: false,
  isExpiringSoon: false,
  atRiskValue: 0,
}

function renderGrid(props: { onEdit?: (item: InventoryItem) => void } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <InventoryDataGrid {...props} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  mockFetchSuppliers.mockResolvedValue([])
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('InventoryDataGrid', () => {
  it('renders the grid and requests inventory with the default query', async () => {
    mockFetchInventory.mockResolvedValue({ items: [sampleItem], total: 1, page: 1, pageSize: 20 })

    renderGrid()

    expect(await screen.findByRole('grid')).toBeInTheDocument()
    expect(mockFetchInventory).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'name', order: 'asc', page: 1, pageSize: 20 }),
    )
  })

  it('shows the empty state when there are no items', async () => {
    mockFetchInventory.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 })

    renderGrid()

    expect(await screen.findByText('No inventory items')).toBeInTheDocument()
  })

  it('shows the error state when the request fails', async () => {
    mockFetchInventory.mockRejectedValue(new Error('boom'))

    renderGrid()

    expect(await screen.findByText("Couldn't load inventory")).toBeInTheDocument()
  })

  it('debounced search drives the request params', async () => {
    mockFetchInventory.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 })

    renderGrid()
    await waitFor(() => expect(mockFetchInventory).toHaveBeenCalled())

    fireEvent.change(screen.getByLabelText('Search items'), { target: { value: 'tomato' } })

    await waitFor(() =>
      expect(mockFetchInventory).toHaveBeenCalledWith(expect.objectContaining({ search: 'tomato' })),
    )
  })

  it('sorting by a column drives the request params', async () => {
    mockFetchInventory.mockResolvedValue({ items: [sampleItem], total: 1, page: 1, pageSize: 20 })

    renderGrid()
    const itemHeader = await screen.findByRole('columnheader', { name: /Item/i })

    fireEvent.click(itemHeader)

    await waitFor(() =>
      expect(mockFetchInventory).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'name', order: 'desc' }),
      ),
    )
  })

  it('clicking a category chip drives the category param', async () => {
    mockFetchInventory.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 })

    renderGrid()
    await waitFor(() => expect(mockFetchInventory).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Produce'))

    await waitFor(() =>
      expect(mockFetchInventory).toHaveBeenCalledWith(expect.objectContaining({ category: 'PRODUCE' })),
    )
  })

  it('clicking a status chip drives the status param', async () => {
    mockFetchInventory.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 })

    renderGrid()
    await waitFor(() => expect(mockFetchInventory).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Low stock'))

    await waitFor(() =>
      expect(mockFetchInventory).toHaveBeenCalledWith(expect.objectContaining({ status: 'low_stock' })),
    )
  })

  it('calls onEdit with the row when its Edit button is clicked', async () => {
    mockFetchInventory.mockResolvedValue({ items: [sampleItem], total: 1, page: 1, pageSize: 20 })
    const onEdit = vi.fn()

    renderGrid({ onEdit })

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: '1', name: 'Roma tomato' }))
  })
})
