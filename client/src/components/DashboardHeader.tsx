import { useDashboardHeader, useDashboardSummary } from '../hooks'
import type { MetricTone } from '../types'

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function tone(value: number, nonZeroTone: MetricTone): MetricTone {
  return value > 0 ? nonZeroTone : 'default'
}

function DashboardHeader() {
  const { data, isPending, isError } = useDashboardHeader()
  const { data: summary, isPending: summaryPending, isError: summaryError } = useDashboardSummary()

  if (isPending) {
    return (
      <section className="dashboard-header" aria-labelledby="dashboard-heading">
        <div className="dashboard-copy">
          <h1 id="dashboard-heading">Welcome.</h1>
          <p className="status-message" role="status">
            Loading your kitchen overview…
          </p>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="dashboard-header" aria-labelledby="dashboard-heading">
        <div className="dashboard-copy">
          <h1 id="dashboard-heading">Welcome.</h1>
          <p className="status-message danger" role="alert">
            We couldn't load the kitchen overview. Check your connection and try again.
          </p>
        </div>
      </section>
    )
  }

  const summaryCards = summary
    ? [
        {
          label: 'Total Items',
          value: String(summary.totalItems),
          valueTone: 'default' as MetricTone,
          helper: 'inventory records',
        },
        {
          label: 'Below Par',
          value: String(summary.lowStockCount),
          valueTone: tone(summary.lowStockCount, 'danger'),
          helper: 'below reorder level',
        },
        {
          label: 'Expiring Soon',
          value: String(summary.expiringSoonCount),
          valueTone: tone(summary.expiringSoonCount, 'warning'),
          helper: 'expire within 7 days',
        },
        {
          label: 'At-Risk Value',
          value: formatCurrency(summary.atRiskValue),
          valueTone: tone(summary.atRiskValue, 'danger'),
          helper: 'tied up in at-risk stock',
        },
      ]
    : null

  return (
    <section className="dashboard-header" aria-labelledby="dashboard-heading">
      <div className="dashboard-copy">
        <h1 id="dashboard-heading">
          Welcome{data.chefName ? `, ${data.chefName}` : ''}.
          {data.alertHeadline ? <em> {data.alertHeadline}</em> : null}
        </h1>
        {data.summary ? <p>{data.summary}</p> : null}
        {data.facts.length > 0 ? (
          <dl className="dashboard-facts" aria-label="Kitchen summary">
            {data.facts.map((fact) => (
              <div className="fact-item" key={fact}>
                <dt>{fact}</dt>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="metric-panel" aria-label="Inventory summary">
        {summaryPending ? (
          <p className="status-message" role="status">
            Loading inventory summary…
          </p>
        ) : summaryError ? (
          <p className="status-message danger" role="alert">
            Could not load inventory summary. Check your connection and try again.
          </p>
        ) : summaryCards ? (
          summaryCards.map((card) => (
            <article className="metric-card" key={card.label}>
              <h2>{card.label}</h2>
              <strong className={`metric-value ${card.valueTone}`}>{card.value}</strong>
              <p>{card.helper}</p>
            </article>
          ))
        ) : null}
      </div>
    </section>
  )
}

export default DashboardHeader
