import type { CategorySummaryRow } from '@umgccapstone/contracts'
import { apiClient } from './apiClient'

export async function fetchCategoryReport(): Promise<CategorySummaryRow[]> {
  return (await apiClient.get<CategorySummaryRow[]>('/reports/category')) ?? []
}
