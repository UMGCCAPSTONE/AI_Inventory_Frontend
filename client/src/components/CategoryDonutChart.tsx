import { Fragment } from 'react'
import { Box, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import type { Category } from '@umgccapstone/contracts'
import { EmptyState, ErrorState, LoadingState } from './states'
import { useReportCategory } from '../hooks'
import { CATEGORY_LABELS } from '../utils/categories'
import { CHART_COLORS } from '../utils/chartColors'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// T-10C/T-10S — Category breakdown as a donut of inventory $ share by category
// (server-computed totals, ADR 0004). Laid out as one grid so the donut is its own
// column alongside the legend's category / count / price columns, all distributed
// space-between. The legend is the chart's text alternative (data not by color alone).
function CategoryDonutChart() {
  const { data, isPending, isError, refetch } = useReportCategory()

  if (isPending) return <LoadingState label="Loading category breakdown…" />
  if (isError)
    return (
      <ErrorState
        title="Couldn't load category report"
        description="Check your connection and try again."
        onRetry={() => refetch()}
      />
    )

  const rows = data ?? []
  if (rows.length === 0)
    return (
      <EmptyState
        title="No category data yet"
        description="Add inventory items to see a breakdown by category."
      />
    )

  const total = rows.reduce((sum, r) => sum + r.totalValue, 0)
  const slices = rows.map((r, i) => ({
    id: r.category,
    value: r.totalValue,
    label: CATEGORY_LABELS[r.category as Category] ?? r.category,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <Box
      aria-label="Category breakdown"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto',
        columnGap: 2,
        rowGap: 0.75,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Donut occupies the first column, spanning every legend row. */}
      <Box
        sx={{
          gridColumn: 1,
          gridRow: `1 / span ${rows.length}`,
          position: 'relative',
          width: 180,
          height: 180,
        }}
      >
        <PieChart
          series={[{ data: slices, innerRadius: 55, paddingAngle: 2 }]}
          width={180}
          height={180}
          hideLegend
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
            Total
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {money.format(total)}
          </Typography>
        </Box>
      </Box>

      {rows.map((r, i) => (
        <Fragment key={r.category}>
          <Box
            sx={{ gridColumn: 2, gridRow: i + 1, display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '2px',
                bgcolor: CHART_COLORS[i % CHART_COLORS.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" noWrap>
              {CATEGORY_LABELS[r.category as Category] ?? r.category}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ gridColumn: 3, gridRow: i + 1 }}>
            {r.itemCount} items
          </Typography>
          <Typography variant="body2" sx={{ gridColumn: 4, gridRow: i + 1, fontWeight: 600 }}>
            {money.format(r.totalValue)}
          </Typography>
        </Fragment>
      ))}
    </Box>
  )
}

export default CategoryDonutChart
