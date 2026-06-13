import { useDashboardHeader } from '../hooks'

function DashboardHeader() {
  const { data, isPending, isError } = useDashboardHeader()

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

      <div className="metric-panel" aria-label="Attention metrics">
        {data.metrics.length > 0 ? (
          data.metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <h2>{metric.label}</h2>
              <strong className={`metric-value ${metric.valueTone ?? 'default'}`}>
                {metric.value}
              </strong>
              <p>{metric.helper}</p>
            </article>
          ))
        ) : (
          <p className="status-message">
            No metrics yet — at-risk value, waste, and margins appear once inventory data is
            connected.
          </p>
        )}
      </div>
    </section>
  )
}

export default DashboardHeader
