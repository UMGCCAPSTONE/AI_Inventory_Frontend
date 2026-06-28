import { useQuery } from '@tanstack/react-query'
import { fetchRecommendationAvailability, queryKeys } from '../services'

export function useRecommendationAvailability() {
  return useQuery({
    queryKey: queryKeys.menu.availability,
    queryFn: fetchRecommendationAvailability,
  })
}
