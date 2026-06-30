import { Box, Drawer, IconButton, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import type { Supplier } from '@umgccapstone/contracts'
import { useSupplierDeliveries } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states'

type SupplierDeliveryHistoryProps = {
  supplier: Supplier | null
  onClose: () => void
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const columns: GridColDef[] = [
  {
    field: 'deliveryDate',
    headerName: 'Date',
    flex: 1,
    minWidth: 130,
    valueFormatter: (value: string) => dateFormatter.format(new Date(value)),
  },
  {
    field: 'itemCount',
    headerName: 'Items',
    width: 100,
  },
  {
    field: 'totalAmount',
    headerName: 'Amount',
    width: 120,
    valueFormatter: (value: number) => currencyFormatter.format(value),
  },
]

function SupplierDeliveryHistory({ supplier, onClose }: SupplierDeliveryHistoryProps) {
  const { data, isPending, isError, refetch } = useSupplierDeliveries(supplier?.id)

  const rows =
    data?.map((delivery) => ({
      id: delivery.id,
      deliveryDate: delivery.deliveryDate,
      itemCount: `${delivery.items.length} ${delivery.items.length === 1 ? 'item' : 'items'}`,
      totalAmount: delivery.totalAmount,
    })) ?? []

  return (
    <Drawer
      anchor="right"
      open={supplier !== null}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480 }, p: 3 } } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" component="h2">
            Delivery history
          </Typography>
          {supplier ? (
            <Typography variant="body2" color="text.secondary">
              {supplier.name}
            </Typography>
          ) : null}
        </Box>
        <IconButton onClick={onClose} aria-label="Close delivery history" size="small">
          ✕
        </IconButton>
      </Box>

      {isPending ? (
        <LoadingState label="Loading delivery history…" />
      ) : isError ? (
        <ErrorState
          description="We couldn't load the delivery history. Check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="No deliveries yet"
          description="Deliveries recorded for this supplier will appear here."
        />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25]}
        />
      )}
    </Drawer>
  )
}

export default SupplierDeliveryHistory
