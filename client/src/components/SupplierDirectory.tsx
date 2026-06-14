import { useState } from 'react'
import { Box, TextField, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useSuppliers } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
  { field: 'contactName', headerName: 'Contact', flex: 1, minWidth: 160 },
  { field: 'emailPhone', headerName: 'Email / Phone', flex: 1.4, minWidth: 220 },
  { field: 'deliveryCadence', headerName: 'Delivery cadence', flex: 1, minWidth: 160 },
]

const containerSx = { maxWidth: 1390, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }

function SupplierDirectory() {
  const { data, isPending, isError, refetch } = useSuppliers()
  const [search, setSearch] = useState('')

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
