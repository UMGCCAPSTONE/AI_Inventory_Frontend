import type { DashboardSummary, InventoryItem } from '@umgccapstone/contracts'
import type { DashboardHeaderData, RecommendationPreviewContent, TodayDashboardData } from '../types'
import { apiClient } from './apiClient'

// Inventory/dashboard KPI snapshot (T-7A) — real call to GET /api/dashboard/summary.
// Server-computed (ADR 0004); screens render these counts, never recompute them.
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>('/dashboard/summary')
}

// At-risk items for the dashboard alerts section (T-6B).
// Returns InventoryItem[] sorted by atRiskValue desc — server-computed flags
// (isLowStock, isExpiringSoon) are rendered as-is, never recomputed client-side.
export async function fetchDashboardAlerts(): Promise<InventoryItem[]> {
  return apiClient.get<InventoryItem[]>('/dashboard/alerts') ?? []
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
  }
}

export async function fetchRecommendationPreviews(): Promise<RecommendationPreviewContent[]> {
  return apiClient.get<RecommendationPreviewContent[]>('/dashboard/recommendations/preview')
}
