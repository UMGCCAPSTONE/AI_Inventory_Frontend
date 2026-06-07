import { useEffect, useState, type DependencyList } from 'react'

/**
 * The four required UI states (see ADR 0005) modeled as a discriminated union.
 * Every data-bound screen renders exactly one of these.
 */
export type AsyncResource<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'empty' }
  | { status: 'success'; data: T }

/** A response counts as empty when it is null/undefined or an empty collection. */
function isEmptyResult(value: unknown): boolean {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

/**
 * Library-free async-state primitive. This is an intentional seam: T-34 replaces
 * the `fetcher` callers with the shared TanStack Query client + query-key
 * registry (see ADR 0002 / ADR 0004) without changing how screens consume the
 * four states.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T | null>,
  deps: DependencyList = [],
): AsyncResource<T> {
  // Starts in `loading`; the async callbacks below resolve it. On a deps change
  // the previous result is kept until the new fetch settles (no loading flash) —
  // T-34's TanStack Query client takes over this behavior.
  const [resource, setResource] = useState<AsyncResource<T>>({ status: 'loading' })

  useEffect(() => {
    let active = true

    fetcher()
      .then((data) => {
        if (!active) return
        setResource(
          isEmptyResult(data) ? { status: 'empty' } : { status: 'success', data: data as T },
        )
      })
      .catch((error: unknown) => {
        if (!active) return
        setResource({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return resource
}
