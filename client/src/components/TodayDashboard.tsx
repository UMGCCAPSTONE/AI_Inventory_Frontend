import type { TodayDashboard as TodayDashboardData } from '../types/contracts'
import { useTodayDashboard } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states/StateViews'

function TodayDashboard() {
  const resource = useTodayDashboard()

  switch (resource.status) {
    case 'loading':
      return (
        <section className="today-dashboard" aria-label="Inventory and specials">
          <LoadingState title="Loading inventory and specials..." />
        </section>
      )
    case 'error':
      return (
        <section className="today-dashboard" aria-label="Inventory and specials">
          <ErrorState
            title="Couldn't load inventory and specials"
            message={resource.error.message}
          />
        </section>
      )
    case 'empty':
      return (
        <section className="today-dashboard" aria-label="Inventory and specials">
          <EmptyState
            title="Nothing to show yet"
            message="Add inventory to start tracking expiry and generating tonight's specials."
          />
        </section>
      )
    case 'success':
      return (
        <section className="today-dashboard" aria-label="Inventory and specials">
          <InventoryPanel data={resource.data.inventory} />
          <SpecialsPanel data={resource.data.specials} />
        </section>
      )
  }
}

function InventoryPanel({ data }: { data: TodayDashboardData['inventory'] }) {
  return (
    <section className="inventory-panel" aria-labelledby="inventory-heading">
      <div className="panel-heading">
        <div>
          <h2 id="inventory-heading">{data.title}</h2>
          <p>{data.subtitle}</p>
        </div>
        <button type="button">+ Add item</button>
      </div>

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
    </section>
  )
}

function SpecialsPanel({ data }: { data: TodayDashboardData['specials'] }) {
  return (
    <section className="specials-panel" aria-labelledby="specials-heading">
      <div className="specials-heading">
        <span aria-hidden="true">{data.eyebrow}</span>
        <div>
          <h2 id="specials-heading">
            Tonight's <em>specials</em>
          </h2>
          <p>{data.subtitle}</p>
        </div>
      </div>
      <p className="specials-intro">{data.intro}</p>

      <div className="special-grid">
        {data.items.map((special) => (
          <article className={special.topPick ? 'special-card top-pick' : 'special-card'} key={special.name}>
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
    </section>
  )
}

export default TodayDashboard
