import { useQuery } from '@tanstack/react-query'
import {
  fetchDashboardHeader,
  fetchDashboardSummary,
  fetchDashboardAlerts,
  fetchTodayDashboard,
  queryKeys,
} from '../services'

export function useDashboardHeader() {
  return useQuery({
    queryKey: queryKeys.dashboard.header,
    queryFn: fetchDashboardHeader,
  })
}

export function useTodayDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.today,
    queryFn: fetchTodayDashboard,
  })
}

// Inventory KPI cards (T-7A) read this snapshot.
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: fetchDashboardSummary,
  })
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: queryKeys.dashboard.alerts,
    queryFn: fetchDashboardAlerts,
  })
}
