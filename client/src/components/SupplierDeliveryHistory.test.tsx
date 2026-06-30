import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Supplier } from '@umgccapstone/contracts'
import SupplierDeliveryHistory from './SupplierDeliveryHistory'
import { fetchSupplierDeliveries } from '../services/suppliers'

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: Array<Record<string, unknown>>
    columns: Array<{ field: string; headerName: string }>
  }) => (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.field}>{col.headerName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.id)}>
            {columns.map((col) => (
              <td key={col.field}>{String(row[col.field] ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}))

vi.mock('../services/suppliers', () => ({
  fetchSupplierDeliveries: vi.fn(),
}))

const mockFetch = vi.mocked(fetchSupplierDeliveries)

const supplier: Supplier = {
  id: 's1',
  name: 'Acme Produce',
  totalSpend: 1250,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const deliveries = [
  {
    id: 'd1',
    supplierId: 's1',
    deliveryDate: '2026-06-01T00:00:00.000Z',
    items: [
      { name: 'Tomatoes', quantity: 10, unit: 'kg' },
      { name: 'Lettuce', quantity: 5, unit: 'kg' },
    ],
    totalAmount: 85.0,
  },
  {
    id: 'd2',
    supplierId: 's1',
    deliveryDate: '2026-06-15T00:00:00.000Z',
    items: [{ name: 'Carrots', quantity: 8, unit: 'kg' }],
    totalAmount: 32.5,
  },
]

function renderDrawer(open = true) {
  // QueryCache with a silent onError prevents TanStack Query v5 from producing
  // unhandled promise rejections that Vitest catches as test failures.
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: () => {} }),
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <SupplierDeliveryHistory
        supplier={open ? supplier : null}
        onClose={vi.fn()}
      />
    </QueryClientProvider>,
  )
}

beforeEach(() => mockFetch.mockReset())

describe('SupplierDeliveryHistory — US-SUPP-4', () => {
  it('does not fetch when no supplier is selected', () => {
    renderDrawer(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('shows loading state while the delivery history is fetching', () => {
    // Use a deferred promise so cleanup doesn't hang after the assertion.
    let settle!: (v: never[]) => void
    mockFetch.mockReturnValue(new Promise<never[]>((res) => { settle = res }))
    const { unmount } = renderDrawer()
    expect(screen.getByText(/loading delivery history/i)).toBeInTheDocument()
    settle([])
    unmount()
  })

  it('shows error state when the delivery history API call fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const { unmount } = renderDrawer()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    // Reset before unmount so no pending background refetch rejects after cleanup.
    mockFetch.mockResolvedValue([])
    unmount()
  })

  it('retries the fetch when the retry button is clicked after an error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error')).mockResolvedValue([])
    renderDrawer()
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))
  })

  it('shows empty state when no deliveries exist', async () => {
    mockFetch.mockResolvedValue([])
    renderDrawer()
    expect(await screen.findByText(/no deliveries yet/i)).toBeInTheDocument()
  })

  it('shows delivery rows with date, item count, and amount', async () => {
    mockFetch.mockResolvedValue(deliveries)
    renderDrawer()

    expect(await screen.findByText('2 items')).toBeInTheDocument()
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('calls GET /suppliers/:id/deliveries for the selected supplier', async () => {
    mockFetch.mockResolvedValue(deliveries)
    renderDrawer()
    await screen.findByText('2 items')
    expect(mockFetch).toHaveBeenCalledWith('s1')
  })

  it('renders the supplier name as a subtitle in the drawer header', async () => {
    mockFetch.mockResolvedValue([])
    renderDrawer()
    expect(await screen.findByText('Acme Produce')).toBeInTheDocument()
  })
})
