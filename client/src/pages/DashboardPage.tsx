import DashboardHeader from '../components/DashboardHeader'
import AlertsSection from '../components/AlertsSection'
import RecommendationPreviewSection from '../components/RecommendationPreviewSection'

// Dashboard layout (T-42, ADR 0007 + ADR 0009). Mockup grid:
//   - top:    DashboardHeader — greeting + the four KPI cards (T-6A)
//   - middle: two columns — Urgent Alerts (T-6B) | AI recommendation preview (T-6C)
// Each section owns its own four UI states (ADR 0005); this wrapper only arranges
// them. TodayDashboard (an unwired T-0 stub that always rendered empty and
// duplicated the Inventory page) is retired here — see ADR 0009.
export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-columns" data-testid="dashboard-columns">
        <AlertsSection />
        <RecommendationPreviewSection />
      </div>
    </div>
  )
}
