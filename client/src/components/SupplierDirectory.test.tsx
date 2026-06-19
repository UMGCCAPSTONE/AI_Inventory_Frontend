import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SupplierDirectory from './SupplierDirectory'
import { fetchSuppliers } from '../services/suppliers'
import type { Supplier } from '@umgccapstone/contracts'

// @mui/x-data-grid pulls in @mui/material/internal/Transition.mjs, which
// imports react-transition-group via a CJS-only directory re-export that
// Vitest's externalized-module resolver can't follow. Stub the grid with a
// minimal table so SupplierDirectory's data flow (rows, search, empty
// overlay) is still covered without loading the real DataGrid.
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    rows,
    columns,
    slots,
  }: {
    rows: Array<Record<string, unknown>>
    columns: Array<{ field: string; headerName: string }>
    slots?: { noRowsOverlay?: () => ReactNode }
  }) => {
    if (rows.length === 0) {
      const NoRowsOverlay = slots?.noRowsOverlay
      return NoRowsOverlay ? <NoRowsOverlay /> : null
    }

    return (
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)}>
              {columns.map((column) => (
                <td key={column.field}>{String(row[column.field])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
}))

vi.mock('../services/suppliers', () => ({
  fetchSuppliers: vi.fn(),
}))

const mockFetchSuppliers = fetchSuppliers as ReturnType<typeof vi.fn>

const suppliers: Supplier[] = [
  {
    id: '1',
    name: 'Acme Produce',
    contactName: 'Jane Doe',
    email: 'jane@acme.test',
    phone: '555-0100',
    deliveryCadence: 'Weekly',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Best Meats',
    contactName: 'Sam Lee',
    email: 'sam@best.test',
    phone: '555-0101',
    deliveryCadence: 'Bi-weekly',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

function renderDirectory() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <SupplierDirectory />
    </QueryClientProvider>,
  )
}

describe('SupplierDirectory', () => {
  beforeEach(() => {
    mockFetchSuppliers.mockReset()
  })

  it('shows a loading state while suppliers are being fetched', () => {
    mockFetchSuppliers.mockReturnValue(new Promise(() => {}))

    renderDirectory()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows an error state when the request fails', async () => {
    mockFetchSuppliers.mockRejectedValue(new Error('network error'))

    renderDirectory()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('shows an empty state when there are no suppliers', async () => {
    mockFetchSuppliers.mockResolvedValue([])

    renderDirectory()

    expect(await screen.findByText(/no suppliers yet/i)).toBeInTheDocument()
  })

  it('renders the supplier list from the API', async () => {
    mockFetchSuppliers.mockResolvedValue(suppliers)

    renderDirectory()

    expect(await screen.findByText('Acme Produce')).toBeInTheDocument()
    expect(screen.getByText('Best Meats')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@acme.test · 555-0100')).toBeInTheDocument()
    expect(screen.getByText('Weekly')).toBeInTheDocument()
  })

  it('narrows rows when searching by name', async () => {
    mockFetchSuppliers.mockResolvedValue(suppliers)

    renderDirectory()
    await screen.findByText('Acme Produce')

    fireEvent.change(screen.getByRole('searchbox', { name: /search suppliers/i }), {
      target: { value: 'best' },
    })

    expect(screen.queryByText('Acme Produce')).not.toBeInTheDocument()
    expect(screen.getByText('Best Meats')).toBeInTheDocument()
  })
})
