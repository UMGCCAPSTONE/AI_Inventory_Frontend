import { appConfig } from './config'
import { ApiError, type ApiEnvelope } from '../types/api'

export type HealthStatus = {
  status: string
}

// Lightweight backend connectivity probe. The health endpoint lives at the
// server root (GET /health), NOT under the /api base, so it can't go through
// apiClient (which is pinned to appConfig.apiBaseUrl). We derive the origin
// from the configured base URL and fetch directly. The response uses the same
// { data } envelope as the rest of the API (shared ADR 0002).
export async function checkBackendHealth(): Promise<HealthStatus> {
  if (!appConfig.apiBaseUrl) {
    throw new ApiError({
      code: 'CONFIG_ERROR',
      message: 'API base URL is not configured.',
    })
  }

  const origin = new URL(appConfig.apiBaseUrl).origin
  const response = await fetch(`${origin}/health`)

  if (!response.ok) {
    throw new ApiError(
      { code: 'HEALTH_CHECK_FAILED', message: `Backend returned ${response.status}.` },
      response.status,
    )
  }

  const body = (await response.json()) as ApiEnvelope<HealthStatus>
  return body.data
}
