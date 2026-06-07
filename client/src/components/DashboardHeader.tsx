import type { DashboardSummary } from '../types/contracts'
import { useDashboardSummary } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states/StateViews'

function DashboardHeader() {
  const resource = useDashboardSummary()

  switch (resource.status) {
    case 'loading':
      return (
        <section className="dashboard-header" aria-labelledby="dashboard-heading">
          <LoadingState title="Loading your kitchen summary..." />
        </section>
      )
    case 'error':
      return (
        <section className="dashboard-header" aria-labelledby="dashboard-heading">
          <ErrorState
            title="Couldn't load your kitchen summary"
            message={resource.error.message}
          />
        </section>
      )
    case 'empty':
      return (
        <section className="dashboard-header" aria-labelledby="dashboard-heading">
          <EmptyState
            title="No summary yet"
            message="Once inventory and service data are available, your daily summary will appear here."
          />
        </section>
      )
    case 'success':
      return <DashboardHeaderView data={resource.data} />
  }
}

function DashboardHeaderView({ data }: { data: DashboardSummary }) {
  return (
    <section className="dashboard-header" aria-labelledby="dashboard-heading">
      <div className="dashboard-copy">
        <h1 id="dashboard-heading">
          {data.greeting}, {data.chefName}.{' '}
          <em>{data.alertHeadline}</em>
        </h1>
        <p>{data.summary}</p>
        <dl className="dashboard-facts" aria-label="Kitchen summary">
          {data.facts.map((fact) => (
            <div className="fact-item" key={fact}>
              <dt>{fact}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="metric-panel" aria-label="Attention metrics">
        {data.metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <h2>{metric.label}</h2>
            <strong className={`metric-value ${metric.valueTone ?? 'default'}`}>
              {metric.value}
            </strong>
            <p>{metric.helper}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardHeader
