import type { CategorySummaryRow } from '../types/reports'
import { apiClient } from './apiClient'

export async function fetchCategoryReport(): Promise<CategorySummaryRow[]> {
  return (await apiClient.get<CategorySummaryRow[]>('/reports/category')) ?? []
}
