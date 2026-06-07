import { appConfig } from '../services/config'
import { dashboardSummaryMock } from '../mocks/dashboardSummary.mock'
import type { DashboardSummary } from '../types/contracts'
import { useAsyncResource, type AsyncResource } from './useAsyncResource'

/**
 * Seam: returns the mock fixture while `enableMocks` is on, otherwise resolves
 * empty. T-34 / the dashboard feature ticket replaces this body with a call
 * through the shared API client (query key: `['dashboard', 'summary']`).
 */
async function fetchDashboardSummary(): Promise<DashboardSummary | null> {
  if (appConfig.enableMocks) return dashboardSummaryMock
  return null
}

export function useDashboardSummary(): AsyncResource<DashboardSummary> {
  return useAsyncResource(fetchDashboardSummary, [])
}
