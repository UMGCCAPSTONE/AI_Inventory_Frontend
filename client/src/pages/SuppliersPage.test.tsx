import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Supplier } from '@umgccapstone/contracts'
import SuppliersPage from './SuppliersPage'
import { fetchSuppliers, createSupplier, updateSupplier, fetchSupplierDeliveries } from '../services/suppliers'

// Stub @mui/x-data-grid (same module-resolution issue as SupplierDirectory.test)
// but honor renderCell so the per-row Edit action is present and clickable.
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: Array<Record<string, unknown>>
    columns: Array<{
      field: string
      renderCell?: (params: { row: Record<string, unknown>; value: unknown }) => ReactNode
    }>
  }) => (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.id)}>
            {columns.map((column) => (
              <td key={column.field}>
                {column.renderCell
                  ? column.renderCell({ row, value: row[column.field] })
                  : String(row[column.field] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}))

vi.mock('../services/suppliers', () => ({
  fetchSuppliers: vi.fn(),
  createSupplier: vi.fn(),
  updateSupplier: vi.fn(),
  fetchSupplierDeliveries: vi.fn(),
}))

const mockFetch = vi.mocked(fetchSuppliers)
const mockCreate = vi.mocked(createSupplier)
const mockUpdate = vi.mocked(updateSupplier)
const mockFetchDeliveries = vi.mocked(fetchSupplierDeliveries)

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

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <SuppliersPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  mockFetch.mockReset()
  mockCreate.mockReset()
  mockUpdate.mockReset()
  mockFetchDeliveries.mockReset()
})

describe('SuppliersPage — US-SUPP-1: supplier directory view', () => {
  it('renders the page without crashing when mounted with mock supplier data', async () => {
    mockFetch.mockResolvedValue(suppliers)
    renderPage()
    expect(await screen.findByText('Acme Produce')).toBeInTheDocument()
  })

  it('renders a row for each supplier in the API response', async () => {
    mockFetch.mockResolvedValue(suppliers)
    renderPage()
    expect(await screen.findByText('Acme Produce')).toBeInTheDocument()
    expect(screen.getByText('Best Meats')).toBeInTheDocument()
  })

  it('shows the empty state when the supplier list is empty', async () => {
    mockFetch.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/no suppliers yet/i)).toBeInTheDocument()
  })

  it('does not render a delete control — deletion is out of scope', async () => {
    mockFetch.mockResolvedValue(suppliers)
    renderPage()
    await screen.findByText('Acme Produce')
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })
})

describe('SuppliersPage — US-SUPP-2: add supplier', () => {
  it('opens the add-supplier form when the "Add supplier" button is clicked', async () => {
    mockFetch.mockResolvedValue(suppliers)
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('fires POST /suppliers with the correct payload on submit', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockCreate.mockResolvedValue({ id: '3', name: 'New Co' } as Supplier)
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Name' }), {
      target: { value: 'New Co' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: /add supplier/i }))

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1))
    expect(mockCreate.mock.calls[0][0]).toEqual(expect.objectContaining({ name: 'New Co' }))
  })

  it('shows a validation error and does not submit when required fields are empty', async () => {
    mockFetch.mockResolvedValue(suppliers)
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /add supplier/i }))

    expect(await within(dialog).findByText(/at least 1 character/i)).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('closes the form and refreshes the list after a successful add', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockCreate.mockResolvedValue({ id: '3', name: 'New Co' } as Supplier)
    renderPage()
    await screen.findByText('Acme Produce')
    expect(mockFetch).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Name' }), {
      target: { value: 'New Co' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: /add supplier/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2)) // invalidation refetch
    expect(await screen.findByText(/supplier added/i)).toBeInTheDocument()
  })
})

describe('SuppliersPage — US-SUPP-3: edit supplier', () => {
  it('opens the edit form pre-filled with server data when a supplier is selected', async () => {
    mockFetch.mockResolvedValue(suppliers)
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'Edit Acme Produce' }))
    const dialog = await screen.findByRole('dialog')

    await waitFor(() =>
      expect(
        (within(dialog).getByRole('textbox', { name: 'Name' }) as HTMLInputElement).value,
      ).toBe('Acme Produce'),
    )
  })

  it('fires PATCH /suppliers/:id with only the changed fields on submit', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockUpdate.mockResolvedValue({ ...suppliers[0], name: 'Acme Renamed' })
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'Edit Acme Produce' }))
    const dialog = await screen.findByRole('dialog')
    const nameInput = within(dialog).getByRole('textbox', { name: 'Name' }) as HTMLInputElement
    await waitFor(() => expect(nameInput.value).toBe('Acme Produce'))

    fireEvent.change(nameInput, { target: { value: 'Acme Renamed' } })
    fireEvent.click(within(dialog).getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
    expect(mockUpdate).toHaveBeenCalledWith('1', { name: 'Acme Renamed' })
  })

  it('closes the form and reflects the updated supplier after success', async () => {
    mockFetch
      .mockResolvedValueOnce(suppliers)
      .mockResolvedValue([{ ...suppliers[0], name: 'Acme Renamed' }, suppliers[1]])
    mockUpdate.mockResolvedValue({ ...suppliers[0], name: 'Acme Renamed' })
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'Edit Acme Produce' }))
    const dialog = await screen.findByRole('dialog')
    const nameInput = within(dialog).getByRole('textbox', { name: 'Name' }) as HTMLInputElement
    await waitFor(() => expect(nameInput.value).toBe('Acme Produce'))

    fireEvent.change(nameInput, { target: { value: 'Acme Renamed' } })
    fireEvent.click(within(dialog).getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText(/supplier updated/i)).toBeInTheDocument()
    expect(await screen.findByText('Acme Renamed')).toBeInTheDocument()
  })
})

describe('SuppliersPage — US-SUPP-4: delivery history', () => {
  it('shows a History button for each supplier row', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockFetchDeliveries.mockResolvedValue([])
    renderPage()
    await screen.findByText('Acme Produce')

    expect(screen.getByRole('button', { name: 'View delivery history for Acme Produce' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View delivery history for Best Meats' })).toBeInTheDocument()
  })

  it('opens the delivery history drawer for the clicked supplier', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockFetchDeliveries.mockResolvedValue([])
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'View delivery history for Acme Produce' }))

    expect(await screen.findByText('Delivery history')).toBeInTheDocument()
    expect(await screen.findByText(/no deliveries yet/i)).toBeInTheDocument()
    expect(mockFetchDeliveries).toHaveBeenCalledWith('1')
  })

  it('shows the supplier name in the drawer header', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockFetchDeliveries.mockResolvedValue([])
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'View delivery history for Acme Produce' }))

    expect(await screen.findByText('Delivery history')).toBeInTheDocument()
  })

  it('shows delivery rows with date, item count, and amount on success', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockFetchDeliveries.mockResolvedValue([
      {
        id: 'd1',
        supplierId: '1',
        deliveryDate: '2026-06-01T00:00:00.000Z',
        items: [
          { name: 'Tomatoes', quantity: 10 },
          { name: 'Lettuce', quantity: 5 },
        ],
        totalAmount: 85.0,
      },
    ])
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'View delivery history for Acme Produce' }))

    expect(await screen.findByText('2 items')).toBeInTheDocument()
  })

  it('shows empty state when no delivery history exists', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockFetchDeliveries.mockResolvedValue([])
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'View delivery history for Acme Produce' }))

    expect(await screen.findByText(/no deliveries yet/i)).toBeInTheDocument()
  })

  it('shows error state when the delivery history API call fails', async () => {
    mockFetch.mockResolvedValue(suppliers)
    mockFetchDeliveries.mockRejectedValue(new Error('Network error'))
    renderPage()
    await screen.findByText('Acme Produce')

    fireEvent.click(screen.getByRole('button', { name: 'View delivery history for Acme Produce' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
