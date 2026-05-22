type InventoryFilter = {
  label: string
  count: number
  active?: boolean
  urgent?: boolean
}

type InventoryItem = {
  icon: string
  name: string
  amount: string
  supplier: string
  unitCost: string
  urgency: string
  urgencyTone: 'danger' | 'warning' | 'success'
  label: string
  badge?: string
  highlighted?: boolean
}

type SpecialIngredient = {
  icon: string
  name: string
  amount: string
}

type Special = {
  name: string
  description: string
  foodCost: string
  suggestedPrice: string
  margin: string
  usageLabel: string
  ingredients: SpecialIngredient[]
  topPick?: boolean
}

type TodayDashboardData = {
  inventory: {
    title: string
    subtitle: string
    filters: InventoryFilter[]
    items: InventoryItem[]
  }
  specials: {
    eyebrow: string
    title: string
    subtitle: string
    intro: string
    items: Special[]
  }
}

const placeholderTodayData: TodayDashboardData = {
  inventory: {
    title: 'Current inventory',
    subtitle: 'Sorted by expiry urgency - click any item for detail',
    filters: [
      { label: 'All', count: 14, active: true },
      { label: 'Produce', count: 6 },
      { label: 'Proteins', count: 4 },
      { label: 'Dairy', count: 3 },
      { label: 'Pantry', count: 1 },
      { label: 'Urgent', count: 3, urgent: true },
    ],
    items: [
      {
        icon: '🐟',
        name: 'Branzino, whole',
        amount: '4.2 kg',
        supplier: 'Mercato Pesce',
        unitCost: '$28.50/kg',
        urgency: '36h',
        urgencyTone: 'danger',
        label: 'Until expiry',
        badge: 'Use first',
        highlighted: true,
      },
      {
        icon: '🍅',
        name: 'Heirloom tomatoes',
        amount: '3.8 kg',
        supplier: 'Greenmarket',
        unitCost: '$9.20/kg',
        urgency: '2d',
        urgencyTone: 'danger',
        label: 'Until expiry',
        badge: 'Peak ripeness',
      },
      {
        icon: '🌿',
        name: 'Basil, fresh',
        amount: '340 g',
        supplier: 'Greenmarket',
        unitCost: '$28/kg',
        urgency: '2d',
        urgencyTone: 'warning',
        label: 'Until wilt',
        badge: 'Wilting',
      },
      {
        icon: '🧀',
        name: 'Burrata, fresh',
        amount: '12 pcs',
        supplier: 'Caseificio Local',
        unitCost: '$8.40 each',
        urgency: '4d',
        urgencyTone: 'warning',
        label: 'Until expiry',
      },
      {
        icon: '🥩',
        name: 'Beef tenderloin',
        amount: '5.6 kg',
        supplier: 'Pat LaFrieda',
        unitCost: '$42/kg',
        urgency: '5d',
        urgencyTone: 'warning',
        label: 'Until expiry',
      },
      {
        icon: '🍋',
        name: 'Meyer lemons',
        amount: '2.1 kg',
        supplier: 'Greenmarket',
        unitCost: '$6.40/kg',
        urgency: '8d',
        urgencyTone: 'success',
        label: 'Until expiry',
      },
      {
        icon: '🍝',
        name: 'Fresh pappardelle',
        amount: '2.8 kg',
        supplier: 'In-house',
        unitCost: '$4.20/kg',
        urgency: '3d',
        urgencyTone: 'success',
        label: 'Made today',
      },
      {
        icon: '🌽',
        name: 'Sweet corn, summer',
        amount: '4.4 kg',
        supplier: 'Greenmarket',
        unitCost: '$3.80/kg',
        urgency: '6d',
        urgencyTone: 'success',
        label: 'Until expiry',
      },
      {
        icon: '🧄',
        name: 'Garlic, whole heads',
        amount: '1.8 kg',
        supplier: 'Pantry',
        unitCost: '$5.20/kg',
        urgency: '3w',
        urgencyTone: 'success',
        label: 'Until expiry',
      },
    ],
  },
  specials: {
    eyebrow: 'M',
    title: "Tonight's specials",
    subtitle: 'AI-generated - grounded in deterministic margin & expiry math',
    intro:
      "Tonight you have three ingredients under 48 hours: branzino, heirloom tomatoes, and basil. Together they're $184 of inventory at risk. Here are four specials I'd put on the board - each one features at least one urgent ingredient and clears 60%+ margin at typical pricing.",
    items: [
      {
        name: 'Branzino al sale, summer tomato',
        description:
          'Whole salt-baked branzino, smashed heirloom tomatoes, lemon, basil oil',
        foodCost: '$14.20',
        suggestedPrice: '$48',
        margin: '70%',
        usageLabel: 'Uses 3 urgent',
        topPick: true,
        ingredients: [
          { icon: '🐟', name: 'Branzino', amount: '1 whole' },
          { icon: '🍅', name: 'Heirloom', amount: '200g' },
          { icon: '🌿', name: 'Basil', amount: '15g' },
          { icon: '🍋', name: 'Meyer', amount: '1' },
        ],
      },
      {
        name: 'Caprese di stagione',
        description: 'Heirloom tomato sliced thick, hand-torn burrata, basil, aged balsamic',
        foodCost: '$5.80',
        suggestedPrice: '$22',
        margin: '74%',
        usageLabel: 'Uses 3 urgent',
        ingredients: [
          { icon: '🍅', name: 'Heirloom', amount: '250g' },
          { icon: '🌿', name: 'Basil', amount: '8g' },
          { icon: '🧀', name: 'Burrata', amount: '1pc' },
        ],
      },
      {
        name: 'Pappardelle al pomodoro crudo',
        description: 'Fresh wide pasta tossed with no-cook heirloom tomato sauce, basil, garlic',
        foodCost: '$4.10',
        suggestedPrice: '$24',
        margin: '83%',
        usageLabel: 'Uses 2 urgent - 1 needs-use',
        ingredients: [
          { icon: '🍅', name: 'Heirloom', amount: '180g' },
          { icon: '🌿', name: 'Basil', amount: '12g' },
          { icon: '🍝', name: 'Pappardelle', amount: '120g' },
        ],
      },
      {
        name: 'Branzino crudo, lemon & chili',
        description: 'Thinly sliced raw branzino, Meyer lemon, basil shoots, espelette',
        foodCost: '$6.40',
        suggestedPrice: '$22',
        margin: '71%',
        usageLabel: 'Uses 2 urgent',
        ingredients: [
          { icon: '🐟', name: 'Branzino', amount: '80g' },
          { icon: '🌿', name: 'Basil', amount: '4g' },
          { icon: '🍋', name: 'Meyer', amount: '1/2' },
        ],
      },
    ],
  },
}

type TodayDashboardProps = {
  data?: TodayDashboardData
}

function TodayDashboard({ data = placeholderTodayData }: TodayDashboardProps) {
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
