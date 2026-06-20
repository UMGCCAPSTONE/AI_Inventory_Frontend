import { Box } from '@mui/material'
import DashboardHeader from '../components/DashboardHeader'
import AlertsSection from '../components/AlertsSection'
import TodayDashboard from '../components/TodayDashboard'

// Dashboard layout wrapper (ADR 0007). Composes the welcome header, alerts
// section (T-6B), and today's inventory+specials panel. T-6C adds the AI
// recommendation preview below alerts when it lands.
export default function DashboardPage() {
  return (
    <Box>
      <DashboardHeader />
      <AlertsSection />
      <TodayDashboard />
    </Box>
  )
}
