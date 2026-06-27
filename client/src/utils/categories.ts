import type { Category } from '@umgccapstone/contracts'

// Display labels for the inventory `Category` enum. Single source of truth shared
// by the inventory grid/form (T-7B/T-7C) and the reports category table (T-10B).
// Exhaustive `Record<Category, string>` so a new enum value forces an update here.
export const CATEGORY_LABELS: Record<Category, string> = {
  PRODUCE: 'Produce',
  MEAT: 'Meat',
  SEAFOOD: 'Seafood',
  DAIRY: 'Dairy',
  DRY_GOODS: 'Dry Goods',
  BEVERAGE: 'Beverage',
  FROZEN: 'Frozen',
  OTHER: 'Other',
}
