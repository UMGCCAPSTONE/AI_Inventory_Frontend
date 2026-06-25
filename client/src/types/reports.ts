import type { Category } from '@umgccapstone/contracts'

export type CategorySummaryRow = {
  category: Category
  itemCount: number
  totalValue: number
  lowStockCount: number
}
