// Shared API envelope shapes (shared ADR 0002). The backend wraps successful
// responses as { data, meta } and failures as { error: { code, message, field? } }.
// apiClient (T-34) is the only place these are parsed.
export type ApiMeta = Record<string, unknown>

export type ApiEnvelope<T> = {
  data: T
  meta?: ApiMeta
}

export type ApiErrorBody = {
  code: string
  message: string
  field?: string
}

export class ApiError extends Error {
  code: string
  field?: string
  status?: number

  constructor(body: ApiErrorBody, status?: number) {
    super(body.message)
    this.name = 'ApiError'
    this.code = body.code
    this.field = body.field
    this.status = status
  }
}
