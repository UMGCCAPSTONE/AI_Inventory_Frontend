export type UrgencyTone = 'danger' | 'warning' | 'success'

export type MetricTone = 'danger' | 'warning' | 'success' | 'default'

export type HeaderMetric = {
  label: string
  value: string
  valueTone?: MetricTone
  helper: string
}

export type DashboardHeaderData = {
  chefName: string | null
  alertHeadline: string | null
  summary: string | null
  facts: string[]
  metrics: HeaderMetric[]
}

export type InventoryFilter = {
  label: string
  count: number
  active?: boolean
  urgent?: boolean
}

export type InventoryItem = {
  icon: string
  name: string
  amount: string
  supplier: string
  unitCost: string
  urgency: string
  urgencyTone: UrgencyTone
  label: string
  badge?: string
  highlighted?: boolean
}

export type SpecialIngredient = {
  icon: string
  name: string
  amount: string
}

export type Special = {
  name: string
  description: string
  foodCost: string
  suggestedPrice: string
  margin: string
  usageLabel: string
  ingredients: SpecialIngredient[]
  topPick?: boolean
}

export type TodayDashboardData = {
  inventory: {
    filters: InventoryFilter[]
    items: InventoryItem[]
  }
  specials: {
    intro: string | null
    items: Special[]
  }
}
