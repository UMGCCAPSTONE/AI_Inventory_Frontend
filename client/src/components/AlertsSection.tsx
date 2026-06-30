import { Box, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { InventoryItem } from '@umgccapstone/contracts'
import { useDashboardAlerts } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states'

// Severity styling keyed to the redesign tokens (docs/mockups/dashboard.html):
// expiring = amber, below-par / both = terracotta.
type Severity = {
  label: string
  dot: string
  pillBg: string
  pillColor: string
}

function severityOf(item: InventoryItem): Severity {
  if (item.isLowStock && item.isExpiringSoon)
    return { label: 'Expiring & low stock', dot: 'var(--terra)', pillBg: 'var(--terra)', pillColor: '#fff' }
  if (item.isLowStock)
    return { label: 'Below par', dot: 'var(--terra)', pillBg: 'var(--terra-soft)', pillColor: 'var(--terra)' }
  return { label: 'Expiring soon', dot: 'var(--amber)', pillBg: 'var(--amber-soft)', pillColor: '#7c5a12' }
}

// The dashboard is a glanceable preview: show the most-urgent few (the server
// returns them sorted by at-risk value) and link to Inventory for the full,
// filterable list rather than paginating here.
const MAX_ALERTS = 6

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
    <Paper
      component="section"
      variant="outlined"
      aria-label="Inventory alerts"
      sx={{ p: 3, boxShadow: 'var(--shadow)', height: '100%' }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 2 }}>
        <Typography component="h2" sx={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22 }}>
          Alerts
        </Typography>
        {!isPending && !isError && alerts.length > 0 ? (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {alerts.length} need attention
          </Typography>
        ) : null}
      </Stack>

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
        <Box>
          {alerts.slice(0, MAX_ALERTS).map((item) => {
            const sev = severityOf(item)
            return (
              <Box
                key={item.id}
                component={Link}
                to="/inventory"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.5,
                  borderTop: '1px solid var(--hairline-soft)',
                  '&:first-of-type': { borderTop: 'none' },
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { bgcolor: 'var(--surface-2)' },
                }}
              >
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: sev.dot, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500, color: 'text.primary' }} noWrap>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }} noWrap>
                    {alertDetail(item)}
                  </Typography>
                </Box>
                <Box
                  component="span"
                  sx={{
                    flexShrink: 0,
                    fontSize: 11.5,
                    fontWeight: 600,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    bgcolor: sev.pillBg,
                    color: sev.pillColor,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sev.label}
                </Box>
              </Box>
            )
          })}
          {alerts.length > MAX_ALERTS ? (
            <Box
              component={Link}
              to="/inventory"
              sx={{
                display: 'inline-block',
                mt: 1.5,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View all {alerts.length} alerts →
            </Box>
          ) : null}
        </Box>
      )}
    </Paper>
  )
}
