import { Box } from '@mui/material'
import DashboardHeader from '../components/DashboardHeader'
import AlertsSection from '../components/AlertsSection'
import RecommendationPreviewSection from '../components/RecommendationPreviewSection'
import SpecialsCarousel from '../components/SpecialsCarousel'

// Dashboard (Today) — redesign layout (docs/mockups/dashboard.html):
//   - hero greeting + 4-up KPI bar (DashboardHeader)
//   - two-column grid: Alerts | AI Recommendations (saved-recs preview)
//   - "Tonight's Specials" carousel (isSpecial dishes)
// Each section owns its own loading/error/empty states (ADR 0005).
export default function DashboardPage() {
  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }}>
      <DashboardHeader />
      <Box
        data-testid="dashboard-columns"
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'start',
        }}
      >
        <AlertsSection />
        <RecommendationPreviewSection />
      </Box>
      <SpecialsCarousel />
    </Box>
  )
}
