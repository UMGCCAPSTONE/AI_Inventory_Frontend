import { menuCategorySchema, type MenuCategory } from '@umgccapstone/contracts'

// Display labels + canonical order for the MenuCategory enum (contract 0.9.0).
// Plural to match the Menu Builder's category group headers / chips. Shared by
// the Add Dish form and the current-menu grouping so they stay in sync.
export const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  APPETIZER: 'Appetizers',
  MAIN: 'Mains',
  SIDE: 'Sides',
  DESSERT: 'Desserts',
  DRINK: 'Drinks',
}

// Enum values in display order.
export const MENU_CATEGORIES = menuCategorySchema.options
