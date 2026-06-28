import type { RecommendationAvailability } from '../types'
import { apiClient } from './apiClient'

export async function fetchRecommendationAvailability(): Promise<RecommendationAvailability[]> {
  return apiClient.get<RecommendationAvailability[]>('/menu/availability')
}
