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

// Generate a fresh set of recommendations (US-MENU-1). No body for MVP — the
// engine reads current at-risk stock and the saved menu server-side. Returns the
// newly generated PROPOSED set.
export async function generateRecommendations(): Promise<Recommendation[]> {
  return (await apiClient.post<Recommendation[]>('/recommendations/generate')) ?? []
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
