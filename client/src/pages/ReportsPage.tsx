import { Box, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useReportKpis } from '../hooks'
import StatCard from '../components/StatCard'
import StatCardSkeleton from '../components/StatCardSkeleton'
import ReportCard from '../components/ReportCard'
import CategoryDonutChart from '../components/CategoryDonutChart'
import TopDishesByPrice from '../components/TopDishesByPrice'
import RecommendationHistoryList from '../components/RecommendationHistoryList'
import WasteRiskList from '../components/WasteRiskList'
import { ErrorState } from '../components/states'

const METRIC_CARD_COUNT = 4

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function ReportsPage() {
  const { data, isPending, isError, refetch } = useReportKpis()

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 3 }}>
        Reports
      </Typography>

      <Box aria-label="KPI metrics" sx={{ mb: 4 }}>
        {isPending ? (
          <Box role="status" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box component="span" sx={visuallyHidden}>
              Loading metrics…
            </Box>
            {Array.from({ length: METRIC_CARD_COUNT }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </Box>
        ) : isError ? (
          <ErrorState
            title="Couldn't load reports"
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        ) : data.totalItems === 0 ? (
          <Typography color="text.secondary">
            No inventory items yet — add items to see your KPI data.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <StatCard label="Total items" value={String(data.totalItems)} />
            <StatCard
              label="Expiring soon"
              value={String(data.expiringSoonCount)}
              tone="warning"
              helper="within 7 days"
            />
            <StatCard label="At-risk value" value={money.format(data.atRiskValue)} tone="danger" />
            <StatCard label="Low stock" value={String(data.lowStockCount)} tone="warning" />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        <ReportCard title="Category breakdown">
          <CategoryDonutChart />
        </ReportCard>
        <ReportCard title="Top dishes by price">
          <TopDishesByPrice />
        </ReportCard>
        <ReportCard title="Recommendation history">
          <RecommendationHistoryList />
        </ReportCard>
        <ReportCard title="Waste-risk summary">
          <WasteRiskList />
        </ReportCard>
      </Box>
    </Box>
  )
}

export default ReportsPage
