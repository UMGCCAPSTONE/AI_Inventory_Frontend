import { Box, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useDashboardSummary } from '../hooks'
import { firebaseAuth } from '../services/firebase'
import StatCard from './StatCard'
import StatCardSkeleton from './StatCardSkeleton'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const STAT_CARD_COUNT = 4

// Time-of-day word, computed once at module load (avoids calling Date during
// render — react-hooks/purity).
const GREETING_HOUR = new Date(Date.now()).getHours()
const TIME_GREETING =
  GREETING_HOUR < 12 ? 'Good morning' : GREETING_HOUR < 18 ? 'Good afternoon' : 'Good evening'

// How to address the chef: "Chef <FirstName>" when the signed-in Firebase user
// has a display name, otherwise the friendly default "Chef" on its own. Read from
// firebaseAuth.currentUser (not useAuth) so the greeting renders without an
// AuthProvider and degrades cleanly when Firebase is disabled.
function chefName(): string {
  const display = firebaseAuth?.currentUser?.displayName?.trim()
  const first = display ? display.split(/\s+/)[0] : null
  return first ? `Chef ${first}` : 'Chef'
}

// Dashboard hero + KPI bar (T-6A / T-42). Greeting personalises with the Firebase
// display name when present, else stays generic. The four cards render the server
// summary as-is (ADR 0004) — never recomputed.
function DashboardHeader() {
  const { data: summary, isPending, isError } = useDashboardSummary()
  const name = chefName()

  return (
    <Box component="section" aria-labelledby="dashboard-heading" sx={{ mb: 3.5 }}>
      <Typography
        variant="h2"
        component="h1"
        id="dashboard-heading"
        sx={{ fontWeight: 600, letterSpacing: '-0.02em', mb: 3 }}
      >
        {TIME_GREETING},{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>
          {name}
        </Box>
      </Typography>

      <Box aria-label="Inventory summary">
        {isPending ? (
          <Box role="status" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box component="span" sx={visuallyHidden}>
              Loading inventory summary…
            </Box>
            {Array.from({ length: STAT_CARD_COUNT }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </Box>
        ) : isError ? (
          <Typography role="alert" color="error" sx={{ py: 1 }}>
            Could not load inventory summary. Check your connection and try again.
          </Typography>
        ) : summary ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <StatCard label="Total items" value={String(summary.totalItems)} helper="inventory records" />
            <StatCard
              label="Below par"
              value={String(summary.lowStockCount)}
              tone={summary.lowStockCount > 0 ? 'danger' : 'default'}
              helper="below reorder level"
            />
            <StatCard
              label="Expiring soon"
              value={String(summary.expiringSoonCount)}
              tone={summary.expiringSoonCount > 0 ? 'warning' : 'default'}
              helper="expire within 7 days"
            />
            <StatCard
              label="At-risk value"
              value={money.format(summary.atRiskValue)}
              tone={summary.atRiskValue > 0 ? 'danger' : 'default'}
              helper="tied up in at-risk stock"
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}

export default DashboardHeader
