import { appConfig } from './config'

// Lightweight backend-connectivity probe. Unlike the typed data services this
// deliberately does NOT go through apiClient or the { data, meta } envelope
// (shared ADR 0002) — a health endpoint usually returns a bare body, and all
// we need to know is whether the backend at appConfig.apiBaseUrl answers.

export type HealthStatus = {
  ok: boolean
  status: number | null
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  if (!appConfig.apiBaseUrl) {
    return { ok: false, status: null }
  }

  const response = await fetch(`${appConfig.apiBaseUrl}/health`)
  return { ok: response.ok, status: response.status }
}

// Dev convenience: probes the backend once and logs the result so you can
// confirm connectivity straight from the browser console. Called at startup
// from main.tsx (dev only).
export async function logBackendHealth(): Promise<void> {
  if (!appConfig.apiBaseUrl) {
    console.warn(
      '[backend] VITE_API_BASE_URL is not set — the frontend is not configured to call a backend.',
    )
    return
  }

  try {
    const { ok, status } = await checkBackendHealth()
    if (ok) {
      console.log(`[backend] Connected to backend at ${appConfig.apiBaseUrl} (health ${status}).`)
    } else {
      console.warn(
        `[backend] Reached ${appConfig.apiBaseUrl} but /health returned ${status}. Backend is up but unhealthy.`,
      )
    }
  } catch (error) {
    console.error(
      `[backend] Could not reach backend at ${appConfig.apiBaseUrl}. Is it running, and is CORS allowing http://localhost:5173?`,
      error,
    )
  }
}
