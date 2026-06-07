import './states.css'

/**
 * Shared presentational components for three of the four required UI states
 * (loading / error / empty); the fourth state, success, is each screen's own
 * content (see ADR 0005). Plain CSS for now — these are the seam T-34 swaps for
 * MUI-based shared state components (ADR 0001) without changing call sites.
 */

type StateViewProps = {
  /** Accessible label / heading for the state region. */
  title: string
  /** Optional supporting copy. */
  message?: string
}

export function LoadingState({ title, message }: StateViewProps) {
  return (
    <div className="state-view state-loading" role="status" aria-live="polite">
      <span className="state-spinner" aria-hidden="true" />
      <p className="state-title">{title}</p>
      {message ? <p className="state-message">{message}</p> : null}
    </div>
  )
}

export function EmptyState({ title, message }: StateViewProps) {
  return (
    <div className="state-view state-empty">
      <p className="state-title">{title}</p>
      {message ? <p className="state-message">{message}</p> : null}
    </div>
  )
}

type ErrorStateProps = StateViewProps & {
  /** Optional retry handler; renders a retry button when provided. */
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-view state-error" role="alert">
      <p className="state-title">{title}</p>
      {message ? <p className="state-message">{message}</p> : null}
      {onRetry ? (
        <button type="button" className="state-retry" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
