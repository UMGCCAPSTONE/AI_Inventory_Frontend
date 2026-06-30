import { Box, Typography } from '@mui/material'
import type { Supplier } from '@umgccapstone/contracts'
import type { CrossSupplierDelivery } from '../types'
import { EmptyState, ErrorState, LoadingState } from './states'

// Palette cycles through these colours for each supplier segment.
const SEGMENT_COLORS = ['#2C3E50', '#5D7B6F', '#C0A060', '#8B6E5A', '#4A7BA7', '#9B7B9B', '#6B8E6B']

type Segment = {
  supplierId: string
  name: string
  value: number
  color: string
}

type Props = {
  deliveries: CrossSupplierDelivery[]
  suppliers: Supplier[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function SupplierSpendChart({ deliveries, suppliers, isLoading, isError, onRetry }: Props) {
  if (isLoading) return <LoadingState label="Loading spend data…" />
  if (isError) return <ErrorState description="Could not load spend data." onRetry={onRetry} />

  // Aggregate spend from delivered orders only
  const spendMap = new Map<string, number>()
  for (const d of deliveries) {
    if (d.status === 'PENDING') continue
    spendMap.set(d.supplierId, (spendMap.get(d.supplierId) ?? 0) + d.totalAmount)
  }

  if (spendMap.size === 0) {
    return (
      <EmptyState
        title="No spend data yet"
        description="Completed deliveries will appear here."
      />
    )
  }

  const supplierNames = new Map(suppliers.map((s) => [s.id, s.name]))
  const segments: Segment[] = [...spendMap.entries()].map(([id, value], i) => ({
    supplierId: id,
    name: supplierNames.get(id) ?? id,
    value,
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }))

  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const R = 40
  const cx = 50
  const cy = 50
  const circumference = 2 * Math.PI * R

  let cumulativePct = 0
  const arcs = segments.map((seg) => {
    const pct = seg.value / total
    const dash = pct * circumference
    const gap = circumference - dash
    const rotation = cumulativePct * 360 - 90
    cumulativePct += pct
    return { ...seg, dash, gap, rotation }
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* SVG donut — built with the strokeDasharray arc trick, no chart lib required */}
        <svg
          viewBox="0 0 100 100"
          width={140}
          height={140}
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={18}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              transform={`rotate(${arc.rotation} ${cx} ${cy})`}
            />
          ))}
          {/* White inner disc creates the doughnut hole */}
          <circle cx={cx} cy={cy} r={31} fill="white" />
        </svg>

        {/* Legend */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {segments.map((seg) => (
            <Box
              key={seg.supplierId}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: seg.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                {seg.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {currencyFmt.format(seg.value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
