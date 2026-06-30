import { Box, Chip, Typography } from '@mui/material'
import type { Supplier } from '@umgccapstone/contracts'
import type { CrossSupplierDelivery } from '../types'
import { EmptyState } from './states'

const schedFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

function timeToLabel(dateStr: string): string {
  const diffMs = new Date(dateStr).getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return `${diffDays} days`
}

type Props = {
  deliveries: CrossSupplierDelivery[]
  suppliers: Supplier[]
}

export default function UpcomingDeliveriesList({ deliveries, suppliers }: Props) {
  const supplierNames = new Map(suppliers.map((s) => [s.id, s.name]))
  const now = Date.now()

  const upcoming = deliveries
    .filter((d) => d.status === 'PENDING' && new Date(d.deliveryDate).getTime() >= now)
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate))
    .slice(0, 5)

  if (upcoming.length === 0) {
    return (
      <EmptyState
        title="No upcoming deliveries"
        description="Scheduled deliveries will appear here."
      />
    )
  }

  return (
    <Box>
      {upcoming.map((delivery) => {
        const label = timeToLabel(delivery.deliveryDate)
        const urgent = label === 'Today' || label === 'Tomorrow'
        const supplierLabel =
          delivery.supplierName ?? supplierNames.get(delivery.supplierId) ?? delivery.supplierId

        return (
          <Box
            key={delivery.id}
            sx={{
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-of-type': { borderBottom: 0 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.25,
              }}
            >
              <Typography variant="subtitle2" sx={{ flex: 1, mr: 1 }} noWrap>
                {supplierLabel}
              </Typography>
              <Chip
                size="small"
                label={label}
                color={urgent ? 'warning' : 'default'}
                sx={{ fontSize: '0.7rem', flexShrink: 0 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {schedFmt.format(new Date(delivery.deliveryDate))}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
