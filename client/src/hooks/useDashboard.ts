import { useQuery } from '@tanstack/react-query'
import { fetchDashboardHeader, fetchTodayDashboard, queryKeys } from '../services'

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
