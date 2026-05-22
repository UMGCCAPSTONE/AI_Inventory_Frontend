type HeaderMetric = {
  label: string
  value: string
  valueTone?: 'danger' | 'warning' | 'success' | 'default'
  helper: string
}

type DashboardHeaderData = {
  greeting: string
  chefName: string
  alertHeadline: string
  summary: string
  facts: string[]
  metrics: HeaderMetric[]
}

const placeholderHeaderData: DashboardHeaderData = {
  greeting: 'Good afternoon',
  chefName: 'Chef',
  alertHeadline: 'Five things need attention.',
  summary:
    "Three ingredients are within 48 hours of expiring. I've put together four specials that use them up profitably - review below.",
  facts: [
    '87 SKUs tracked',
    '$2,847 inventory value',
    "Yesterday's covers: 142",
    'Updated 8m ago',
  ],
  metrics: [
    {
      label: 'At Risk',
      value: '$184',
      valueTone: 'danger',
      helper: 'expires < 48h',
    },
    {
      label: "This Week's Waste",
      value: '$67',
      valueTone: 'warning',
      helper: 'down 38% vs last week',
    },
    {
      label: 'Avg Margin',
      value: '68%',
      valueTone: 'success',
      helper: 'on featured dishes',
    },
    {
      label: 'Reorder Today',
      value: '7',
      helper: 'items below par',
    },
  ],
}

type DashboardHeaderProps = {
  data?: DashboardHeaderData
}

function DashboardHeader({ data = placeholderHeaderData }: DashboardHeaderProps) {
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
