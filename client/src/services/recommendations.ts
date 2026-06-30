import type { Recommendation, RecommendationStatus } from '@umgccapstone/contracts'
import { apiClient } from './apiClient'

// Recommendations service (T-8, Menu/Recommendation API). The recommendation DTO
// carries a content snapshot (name, explanation, ingredientsUsed) plus live,
// server-computed fields (isAvailable, limitingIngredientId, foodCost,
// suggestedPrice, margin) and a derived `kind` (EXISTING/NEW) — the frontend
// renders them as-is and never recomputes (ADR 0004).

// List all recommendations (newest first). The Menu Builder filters to PROPOSED
// for its active list; other statuses back the (stretch) history view.
export async function fetchRecommendations(): Promise<Recommendation[]> {
  return (await apiClient.get<Recommendation[]>('/recommendations')) ?? []
}

// Which inventory the generator may draw from (issue #66). 'at-risk' (default)
// focuses on expiring/low stock for waste reduction; 'full' opens up the whole
// in-stock inventory (still prioritising at-risk). Sent as a query param; the
// backend defaults to 'at-risk' if omitted. Typed locally until the 0.9.0
// contract (which exports RecommendationScope) is published to the frontend.
export type RecommendationScope = 'at-risk' | 'full'

// Generate a fresh set of recommendations (US-MENU-1). The engine reads current
// stock + the saved menu server-side; `scope` chooses the ingredient pool.
// Returns the newly generated PROPOSED set.
export async function generateRecommendations(
  scope: RecommendationScope = 'at-risk',
): Promise<Recommendation[]> {
  return (
    (await apiClient.post<Recommendation[]>(`/recommendations/generate?scope=${scope}`)) ?? []
  )
}

// Accept / dismiss / save a recommendation (US-MENU-3/4/5). Status transition per
// ADR 0002; ACCEPTED is valid only for NEW recommendations (the server rejects it
// with 409 for EXISTING ones — the dish is already on the menu, ADR 0014).
export async function updateRecommendationStatus(
  id: string,
  status: RecommendationStatus,
): Promise<Recommendation> {
  return apiClient.patch<Recommendation>(`/recommendations/${id}`, { status })
}
