import { useTodayDashboard } from '../hooks'
import type { TodayDashboardData } from '../types'

function TodayDashboard() {
  const { data, isPending, isError } = useTodayDashboard()

  if (isPending) {
    return (
      <section className="today-dashboard" aria-label="Inventory and specials">
        <p className="status-message" role="status">
          Loading inventory and specials…
        </p>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="today-dashboard" aria-label="Inventory and specials">
        <p className="status-message danger" role="alert">
          We couldn't load inventory and specials. Check your connection and try again.
        </p>
      </section>
    )
  }

  return (
    <section className="today-dashboard" aria-label="Inventory and specials">
      <InventoryPanel data={data.inventory} />
      <SpecialsPanel data={data.specials} />
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

function SpecialsPanel({ data }: { data: TodayDashboardData['specials'] }) {
  return (
    <section className="specials-panel" aria-labelledby="specials-heading">
      <div className="specials-heading">
        <span aria-hidden="true">M</span>
        <div>
          <h2 id="specials-heading">
            Tonight's <em>specials</em>
          </h2>
          <p>AI-generated - grounded in deterministic margin & expiry math</p>
        </div>
      </div>
      {data.intro ? <p className="specials-intro">{data.intro}</p> : null}

      {data.items.length > 0 ? (
        <div className="special-grid">
          {data.items.map((special) => (
            <article
              className={special.topPick ? 'special-card top-pick' : 'special-card'}
              key={special.name}
            >
              {special.topPick ? <span className="top-pick-badge">Top pick</span> : null}
              <h3>{special.name}</h3>
              <p className="special-description">{special.description}</p>

              <dl className="price-grid">
                <div>
                  <dt>Food cost</dt>
                  <dd>{special.foodCost}</dd>
                </div>
                <div>
                  <dt>Suggested price</dt>
                  <dd>{special.suggestedPrice}</dd>
                </div>
                <div>
                  <dt>Margin</dt>
                  <dd className="margin">{special.margin}</dd>
                </div>
              </dl>

              <div className="ingredient-block">
                <h4>{special.usageLabel}</h4>
                <div className="ingredient-tags">
                  {special.ingredients.map((ingredient) => (
                    <span key={`${special.name}-${ingredient.name}-${ingredient.amount}`}>
                      {ingredient.icon} {ingredient.name} · {ingredient.amount}
                    </span>
                  ))}
                </div>
              </div>

              <div className="special-actions">
                <button type="button">Add to tonight's menu</button>
                <button type="button">Why this?</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="status-message">
          No specials yet — recommendations appear once there are inventory items to work with.
        </p>
      )}
    </section>
  )
}

export default TodayDashboard
