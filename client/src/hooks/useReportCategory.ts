import { useQuery } from '@tanstack/react-query'
import { fetchCategoryReport, queryKeys } from '../services'

export function useReportCategory() {
  return useQuery({
    queryKey: queryKeys.reports.category,
    queryFn: fetchCategoryReport,
  })
}
