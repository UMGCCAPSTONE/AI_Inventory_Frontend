import { appConfig } from './config'
import { ApiError, type ApiEnvelope, type ApiErrorBody } from '../types/api'

// The shared data-layer client (T-34 / ADR 0004). This is the only place
// fetch is called: it attaches the Firebase bearer token (shared ADR 0003),
// unwraps the { data, meta } envelope, and normalizes { error } into a typed
// ApiError (shared ADR 0002). Callers (mutations) are responsible for
// presenting an ApiError to the user — e.g. via a toast or inline form error
// using `error.field`. A shared toast component doesn't exist yet; add one
// in the first ticket that needs mutation feedback.

type AuthHandlers = {
  getIdToken: () => Promise<string | null>
  onUnauthorized: () => void
}

let authHandlers: AuthHandlers = {
  getIdToken: async () => null,
  onUnauthorized: () => {},
}

// Registered by AuthContext so this plain module can read live auth state
// without importing React/context (avoids a circular dependency).
export function setAuthHandlers(handlers: AuthHandlers): void {
  authHandlers = handlers
}

type EnvelopeOrError = ApiEnvelope<unknown> | { error: ApiErrorBody }

async function safeParseJson(response: Response): Promise<EnvelopeOrError | null> {
  try {
    return (await response.json()) as EnvelopeOrError
  } catch {
    return null
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!appConfig.apiBaseUrl) {
    throw new ApiError({
      code: 'CONFIG_ERROR',
      message: 'API base URL is not configured.',
    })
  }

  const token = await authHandlers.getIdToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, { ...init, headers })

  if (response.status === 401) {
    authHandlers.onUnauthorized()
  }

  const body = await safeParseJson(response)

  if (!response.ok || (body && 'error' in body)) {
    const errorBody: ApiErrorBody =
      body && 'error' in body ? body.error : { code: 'UNKNOWN_ERROR', message: 'Request failed.' }
    throw new ApiError(errorBody, response.status)
  }

  return (body as ApiEnvelope<T> | null)?.data as T
}

function withJsonBody(method: string, body?: unknown): RequestInit {
  return {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, withJsonBody('POST', body)),
  patch: <T>(path: string, body?: unknown) => request<T>(path, withJsonBody('PATCH', body)),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
