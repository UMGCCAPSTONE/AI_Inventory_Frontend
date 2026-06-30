import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import type { Supplier } from '@umgccapstone/contracts'
import type { CrossSupplierDelivery } from '../types'
import { EmptyState, ErrorState, LoadingState } from './states'

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

type Props = {
  deliveries: CrossSupplierDelivery[]
  suppliers: Supplier[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export default function RecentOrdersTable({
  deliveries,
  suppliers,
  isLoading,
  isError,
  onRetry,
}: Props) {
  if (isLoading) return <LoadingState label="Loading recent orders…" />
  if (isError) return <ErrorState description="Could not load recent orders." onRetry={onRetry} />

  const supplierNames = new Map(suppliers.map((s) => [s.id, s.name]))
  // Most recent first, capped at 10 rows
  const rows = [...deliveries]
    .sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate))
    .slice(0, 10)

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No recent orders"
        description="Delivery records will appear here once orders have been processed."
      />
    )
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Recent orders">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((delivery) => (
            <TableRow key={delivery.id}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {dateFmt.format(new Date(delivery.deliveryDate))}
              </TableCell>
              <TableCell>
                {delivery.supplierName ??
                  supplierNames.get(delivery.supplierId) ??
                  delivery.supplierId}
              </TableCell>
              <TableCell sx={{ maxWidth: 200 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {delivery.items.map((item) => item.name).join(', ') || '—'}
                </Box>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {currencyFmt.format(delivery.totalAmount)}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={delivery.status === 'PENDING' ? 'Pending' : 'Delivered'}
                  color={delivery.status === 'PENDING' ? 'warning' : 'success'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
