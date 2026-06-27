import { useTodayDashboard } from '../hooks'
import type { TodayDashboardData } from '../types'

function TodayDashboard() {
  const { data, isPending, isError } = useTodayDashboard()

  if (isPending) {
    return (
      <section className="today-dashboard" aria-label="Inventory">
        <p className="status-message" role="status">
          Loading inventory…
        </p>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="today-dashboard" aria-label="Inventory">
        <p className="status-message danger" role="alert">
          We couldn't load inventory. Check your connection and try again.
        </p>
      </section>
    )
  }

  return (
    <section className="today-dashboard" aria-label="Inventory">
      <InventoryPanel data={data.inventory} />
    </section>
  )
}

function InventoryPanel({ data }: { data: TodayDashboardData['inventory'] }) {
  return (
    <section className="inventory-panel" aria-labelledby="inventory-heading">
      <div className="panel-heading">
        <div>
          <h2 id="inventory-heading">Current inventory</h2>
          <p>Sorted by expiry urgency - click any item for detail</p>
        </div>
        <button type="button">+ Add item</button>
      </div>

      {data.filters.length > 0 ? (
        <div className="filter-row" aria-label="Inventory filters">
          {data.filters.map((filter) => (
            <button
              className={[
                'filter-chip',
                filter.active ? 'active' : '',
                filter.urgent ? 'urgent' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              type="button"
              key={filter.label}
            >
              {filter.urgent ? '△ ' : ''}
              {filter.label} <span>{filter.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {data.items.length > 0 ? (
        <div className="inventory-list">
          {data.items.map((item) => (
            <article
              className={item.highlighted ? 'inventory-item highlighted' : 'inventory-item'}
              key={item.name}
            >
              <span className="item-icon" aria-hidden="true">
                {item.icon}
              </span>
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>
                  <strong>{item.amount}</strong>
                  <span>{item.supplier}</span>
                  <span>{item.unitCost}</span>
                </p>
              </div>
              <div className="item-urgency">
                <strong className={item.urgencyTone}>{item.urgency}</strong>
                <span>{item.label}</span>
                {item.badge ? <em>{item.badge}</em> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="status-message">
          No inventory items yet. Use "+ Add item" to start tracking stock, expiry, and value.
        </p>
      )}
    </section>
  )
}

export default TodayDashboard
