import { appConfig } from '../services/config'
import { todayDashboardMock } from '../mocks/todayDashboard.mock'
import type { TodayDashboard } from '../types/contracts'
import { useAsyncResource, type AsyncResource } from './useAsyncResource'

/**
 * Seam: returns the mock fixture while `enableMocks` is on, otherwise resolves
 * empty. T-34 / the inventory + menu feature tickets replace this body with
 * calls through the shared API client (query keys: `['inventory', 'today']`,
 * `['specials', 'today']`).
 */
async function fetchTodayDashboard(): Promise<TodayDashboard | null> {
  if (appConfig.enableMocks) return todayDashboardMock
  return null
}

export function useTodayDashboard(): AsyncResource<TodayDashboard> {
  return useAsyncResource(fetchTodayDashboard, [])
}
