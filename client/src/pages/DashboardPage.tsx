import { Box } from '@mui/material'
import DashboardHeader from '../components/DashboardHeader'
import AlertsSection from '../components/AlertsSection'
import TodayDashboard from '../components/TodayDashboard'
import RecommendationPreviewSection from '../components/RecommendationPreviewSection'

// Dashboard layout wrapper (ADR 0007). Composes the welcome header, alerts
// section (T-6B), today's inventory panel, and the AI recommendation preview
// section (T-6C).
export default function DashboardPage() {
  return (
    <Box>
      <DashboardHeader />
      <AlertsSection />
      <TodayDashboard />
      <RecommendationPreviewSection />
    </Box>
  )
}
