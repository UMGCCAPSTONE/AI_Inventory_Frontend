import type { DashboardHeaderData, TodayDashboardData } from '../types'

// Hook seams only (T-0): feature tickets replace these bodies with real API
// calls through appConfig.apiBaseUrl. Until then they resolve to empty
// datasets so every screen renders its empty state.
export async function fetchDashboardHeader(): Promise<DashboardHeaderData> {
  return {
    chefName: null,
    alertHeadline: null,
    summary: null,
    facts: [],
    metrics: [],
  }
}

export async function fetchTodayDashboard(): Promise<TodayDashboardData> {
  return {
    inventory: {
      filters: [],
      items: [],
    },
    specials: {
      intro: null,
      items: [],
    },
  }
}
