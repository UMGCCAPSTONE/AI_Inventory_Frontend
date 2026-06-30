import { ApiError } from '../types/api'

// Map any thrown value to a user-facing message: the typed ApiError carries a
// server message (shared ADR 0002); anything else gets a safe generic. Used by
// mutation feedback (toasts/inline errors). SuppliersPage has an older local
// copy; consolidating it onto this util is a later scoped change.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}
