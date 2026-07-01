import { useState } from 'react'
import { Box, List, ListItem, ListItemText, Pagination, Typography } from '@mui/material'
import type { InventoryItem } from '@umgccapstone/contracts'
import { EmptyState, ErrorState, LoadingState } from './states'
import FadedChip from './FadedChip'
import { useDashboardAlerts } from '../hooks'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const PAGE_SIZE = 9

type Severity = { label: string; color: 'error' | 'warning' }

// Single severity rule (matches AlertsSection): "at risk" = low-stock OR expiring
// soon (ADR 0004). Drives both the chip and the bar color so color carries the
// same meaning in both places.
function severityOf(item: InventoryItem): Severity {
  if (item.isLowStock && item.isExpiringSoon) return { label: 'Expiring & Low Stock', color: 'error' }
  if (item.isLowStock) return { label: 'Below Par', color: 'error' }
  return { label: 'Expiring Soon', color: 'warning' }
}

function detail(item: InventoryItem): string {
  const parts: string[] = []
  if (item.isExpiringSoon && item.expirationDate)
    parts.push(`Expires ${new Date(item.expirationDate).toLocaleDateString()}`)
  if (item.isLowStock) parts.push(`${item.quantity} ${item.unit} on hand`)
  return parts.join(' · ')
}

// T-10C — Waste-risk summary. Reads GET /api/dashboard/alerts: the at-risk items
// (low-stock OR expiring soon) as server-computed InventoryItem DTOs, sorted by
// atRiskValue desc. Each row's bar is sized to its share of the largest at-risk
// value (so the biggest exposures stand out) and colored by severity. Paged at
// PAGE_SIZE rows (like the recommendation history) so the panel stays bounded.
function WasteRiskList() {
  const { data, isPending, isError, refetch } = useDashboardAlerts()
  const [page, setPage] = useState(1)

  if (isPending) return <LoadingState label="Loading waste-risk summary…" />
  if (isError)
    return (
      <ErrorState
        title="Couldn't load waste-risk summary"
        description="Check your connection and try again."
        onRetry={() => refetch()}
      />
    )

  const items = data ?? []
  if (items.length === 0)
    return <EmptyState title="No items at risk" description="All inventory items are healthy." />

  // Bars are scaled to the largest at-risk value across ALL items so they stay
  // comparable across pages.
  const maxValue = Math.max(...items.map((i) => i.atRiskValue), 0.0001)
  const pageCount = Math.ceil(items.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(pageCount, 1))
  const pageItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <>
      <List disablePadding aria-label="Waste-risk summary">
        {pageItems.map((item) => {
          const severity = severityOf(item)
          return (
            <ListItem
              key={item.id}
              disableGutters
              sx={{ display: 'block', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ListItemText primary={item.name} secondary={detail(item)} sx={{ flex: 1, m: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {money.format(item.atRiskValue)}
                </Typography>
                <FadedChip label={severity.label} color={severity.color} />
              </Box>
              <Box
                sx={{ mt: 0.875, height: 7, borderRadius: 999, bgcolor: 'var(--surface-2)', overflow: 'hidden' }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${(item.atRiskValue / maxValue) * 100}%`,
                    bgcolor: 'var(--waste)',
                    borderRadius: 999,
                  }}
                />
              </Box>
            </ListItem>
          )
        })}
      </List>

      {pageCount > 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
          <Pagination
            count={pageCount}
            page={safePage}
            onChange={(_, value) => setPage(value)}
            size="small"
          />
        </Box>
      ) : null}
    </>
  )
}

export default WasteRiskList
