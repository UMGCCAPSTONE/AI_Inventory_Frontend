import { Avatar, Box, Button, Chip, Typography } from '@mui/material'
import type { Supplier } from '@umgccapstone/contracts'
import type { SupplierStatus } from '../types'

type Props = {
  supplier: Supplier & { status?: SupplierStatus; nextDelivery?: string }
  onView: () => void
  onEdit: () => void
}

const STATUS_LABEL: Record<SupplierStatus, string> = {
  ACTIVE: 'Active',
  ORDER_DUE: 'Order due',
  INACTIVE: 'Inactive',
}

const STATUS_COLOR: Record<SupplierStatus, 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  ORDER_DUE: 'warning',
  INACTIVE: 'default',
}

export default function SupplierCard({ supplier, onView, onEdit }: Props) {
  const initials = supplier.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const subtitle = [supplier.contactName, supplier.deliveryCadence].filter(Boolean).join(' · ') || '—'

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Avatar
        sx={{
          bgcolor: 'grey.100',
          color: 'text.primary',
          fontWeight: 600,
          fontSize: '0.85rem',
          flexShrink: 0,
        }}
      >
        {initials}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {supplier.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {subtitle}
        </Typography>
      </Box>

      {supplier.status ? (
        <Chip
          size="small"
          label={STATUS_LABEL[supplier.status]}
          color={STATUS_COLOR[supplier.status]}
          sx={{ flexShrink: 0 }}
        />
      ) : null}

      {supplier.nextDelivery ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0, minWidth: 90, textAlign: 'right' }}
        >
          {supplier.nextDelivery}
        </Typography>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Button
          size="small"
          onClick={onEdit}
          aria-label={`Edit ${supplier.name}`}
          sx={{ color: 'text.secondary', minWidth: 'auto' }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onView}
          aria-label={`View delivery history for ${supplier.name}`}
        >
          View
        </Button>
      </Box>
    </Box>
  )
}
