/**
 * Local stand-in for the shared `@umgccapstone/contracts` package.
 *
 * The shared contract is authored frontend-first (see ADR 0006) and will be
 * published to GitHub Packages by the backend repo. Until that package is
 * pinned in `package.json`, these types live here so the app compiles against a
 * single typed source of truth. When the real package lands, re-export from it
 * here (or delete this file and update imports) — call sites should not change.
 *
 * Seam only: do not add runtime values to this module.
 */

/** Tone used to color a value by urgency/severity. */
export type SeverityTone = 'danger' | 'warning' | 'success'

/* -------------------------------------------------------------------------- */
/* Dashboard summary (header)                                                  */
/* -------------------------------------------------------------------------- */

export type HeaderMetric = {
  label: string
  value: string
  valueTone?: SeverityTone | 'default'
  helper: string
}

export type DashboardSummary = {
  greeting: string
  chefName: string
  alertHeadline: string
  summary: string
  facts: string[]
  metrics: HeaderMetric[]
}

/* -------------------------------------------------------------------------- */
/* Today dashboard (inventory + specials)                                      */
/* -------------------------------------------------------------------------- */

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
  urgencyTone: SeverityTone
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

export type InventoryOverview = {
  title: string
  subtitle: string
  filters: InventoryFilter[]
  items: InventoryItem[]
}

export type SpecialsBoard = {
  eyebrow: string
  title: string
  subtitle: string
  intro: string
  items: Special[]
}

export type TodayDashboard = {
  inventory: InventoryOverview
  specials: SpecialsBoard
}

/* -------------------------------------------------------------------------- */
/* Session / app shell                                                         */
/* -------------------------------------------------------------------------- */

export type SessionUser = {
  displayName: string
  initials: string
  venue: string
}

export type ServiceContext = {
  label: string
}

export type Session = {
  user: SessionUser
  service: ServiceContext
}
