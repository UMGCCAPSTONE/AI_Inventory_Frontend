import { useMemo, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import type { Supplier } from '@umgccapstone/contracts'
import { useSuppliers } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states'

type SupplierDirectoryProps = {
  // When provided, each row gets an Edit action that hands back the full
  // supplier (T-9B). Omitted → read-only directory, exactly as T-9A shipped.
  onEditSupplier?: (supplier: Supplier) => void
  // When provided, each row gets a History action that opens the delivery
  // history drawer for that supplier (T-9S).
  onViewHistory?: (supplier: Supplier) => void
}

const baseColumns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
  { field: 'contactName', headerName: 'Contact', flex: 1, minWidth: 160 },
  { field: 'emailPhone', headerName: 'Email / Phone', flex: 1.4, minWidth: 220 },
  { field: 'deliveryCadence', headerName: 'Delivery cadence', flex: 1, minWidth: 160 },
]

const containerSx = { maxWidth: 1390, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }

function SupplierDirectory({ onEditSupplier, onViewHistory }: SupplierDirectoryProps = {}) {
  const { data, isPending, isError, refetch } = useSuppliers()
  const [search, setSearch] = useState('')

  const columns = useMemo<GridColDef[]>(() => {
    const extra: GridColDef[] = []

    if (onEditSupplier) {
      extra.push({
        field: 'actions',
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 90,
        renderCell: (params) => {
          const supplier = params.row.supplier as Supplier
          return (
            <Button
              size="small"
              onClick={() => onEditSupplier(supplier)}
              aria-label={`Edit ${supplier.name}`}
            >
              Edit
            </Button>
          )
        },
      })
    }

    if (onViewHistory) {
      extra.push({
        field: 'history',
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 90,
        renderCell: (params) => {
          const supplier = params.row.supplier as Supplier
          return (
            <Button
              size="small"
              onClick={() => onViewHistory(supplier)}
              aria-label={`View delivery history for ${supplier.name}`}
            >
              History
            </Button>
          )
        },
      })
    }

    return extra.length > 0 ? [...baseColumns, ...extra] : baseColumns
  }, [onEditSupplier, onViewHistory])

  if (isPending) {
    return (
      <Box component="section" aria-label="Suppliers" sx={containerSx}>
        <LoadingState label="Loading suppliers…" />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box component="section" aria-label="Suppliers" sx={containerSx}>
        <ErrorState
          description="We couldn't load the supplier directory. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </Box>
    )
  }

  const filtered = data.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const rows = filtered.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    contactName: supplier.contactName ?? '—',
    emailPhone: [supplier.email, supplier.phone].filter(Boolean).join(' · ') || '—',
    deliveryCadence: supplier.deliveryCadence ?? '—',
    // Carried for the Edit action's renderCell (not a visible column).
    supplier,
  }))

  return (
    <Box component="section" aria-labelledby="supplier-directory-heading" sx={containerSx}>
      <Typography id="supplier-directory-heading" variant="h4" component="h2" gutterBottom>
        Suppliers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search by name to find a supplier's contact info and delivery cadence.
      </Typography>

      {data.length === 0 ? (
        <EmptyState
          title="No suppliers yet"
          description="Suppliers you add will appear here with their contact details and delivery cadence."
        />
      ) : (
        <>
          <TextField
            label="Search suppliers"
            type="search"
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name"
            sx={{ mb: 2, maxWidth: 320, display: 'block' }}
          />

          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
            slots={{
              noRowsOverlay: () => (
                <EmptyState title="No matching suppliers" description="Try a different search term." />
              ),
            }}
          />
        </>
      )}
    </Box>
  )
}

export default SupplierDirectory
