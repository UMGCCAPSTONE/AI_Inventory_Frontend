import { Box, Chip, List, ListItem, ListItemText, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { InventoryItem } from '@umgccapstone/contracts'
import { useDashboardAlerts } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states'

function severityChip(item: InventoryItem) {
  if (item.isLowStock && item.isExpiringSoon)
    return <Chip label="Expiring & Low Stock" color="error" size="small" />
  if (item.isLowStock) return <Chip label="Below Par" color="error" size="small" />
  return <Chip label="Expiring Soon" color="warning" size="small" />
}

function alertDetail(item: InventoryItem): string {
  const parts: string[] = []
  if (item.isLowStock) parts.push(`${item.quantity} ${item.unit} on hand`)
  if (item.isExpiringSoon && item.expirationDate)
    parts.push(`Expires ${new Date(item.expirationDate).toLocaleDateString()}`)
  return parts.join(' · ')
}

export default function AlertsSection() {
  const { data: alerts, isPending, isError, refetch } = useDashboardAlerts()

  return (
    <Box sx={{ px: 3, pb: 2 }} aria-label="Inventory alerts">
      <Typography variant="h6" component="h2" gutterBottom>
        Alerts
      </Typography>

      {isPending ? (
        <LoadingState label="Loading alerts…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load alerts"
          description="Check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : alerts.length === 0 ? (
        <EmptyState title="No active alerts" description="All inventory items are healthy." />
      ) : (
        <List disablePadding>
          {alerts.map((item) => (
            <ListItem
              key={item.id}
              component={Link}
              to="/inventory"
              disablePadding
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1,
                px: 0,
                borderBottom: '1px solid',
                borderColor: 'divider',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemText
                primary={item.name}
                secondary={alertDetail(item)}
                sx={{ flex: 1, m: 0, px: 1 }}
              />
              {severityChip(item)}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
