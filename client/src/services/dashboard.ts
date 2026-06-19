import type { DashboardSummary } from '@umgccapstone/contracts'
import type { DashboardHeaderData, TodayDashboardData } from '../types'
import { apiClient } from './apiClient'

// Inventory/dashboard KPI snapshot (T-7A) — real call to GET /api/dashboard/summary.
// Server-computed (ADR 0004); screens render these counts, never recompute them.
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>('/dashboard/summary')
}

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
