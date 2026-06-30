import type { CreateMenuItemInput, MenuItem, UpdateMenuItemInput } from '@umgccapstone/contracts'
import type { RecommendationAvailability } from '../types'
import { apiClient } from './apiClient'

export async function fetchRecommendationAvailability(): Promise<RecommendationAvailability[]> {
  return apiClient.get<RecommendationAvailability[]>('/menu/availability')
}

// Every menu item with live, server-computed availability (T-8 "regular menu"
// section). GET /menu/availability returns all statuses with `status` on each DTO
// so the client filters ARCHIVED; the Menu Builder shows ACTIVE items only.
// Shares the endpoint with `fetchRecommendationAvailability` above, which is the
// dashboard's narrower projection (T-6C) — kept separate, not consolidated here.
export async function fetchMenuItems(): Promise<MenuItem[]> {
  return (await apiClient.get<MenuItem[]>('/menu/availability')) ?? []
}

// Create a menu item (T-8 "Add Dish"). Body validated server-side with the same
// `createMenuItemInputSchema` the form validates against (shared contract).
export async function createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
  return apiClient.post<MenuItem>('/menu-items', input)
}

// Partial-update a menu item (T-72). Body validated server-side with
// `updateMenuItemInputSchema` (status, isSpecial, name, ingredients — all
// optional). Backs both the "Make special" toggle and archive below.
export async function updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<MenuItem> {
  return apiClient.patch<MenuItem>(`/menu-items/${id}`, input)
}

// Remove a dish from the Current menu (T-72). Soft-archive only — no hard delete
// (ADR 0002): set status to ARCHIVED so the dish drops out of the menu but its
// history (and any recommendations that produced it) is preserved.
export async function archiveMenuItem(id: string): Promise<MenuItem> {
  return updateMenuItem(id, { status: 'ARCHIVED' })
}
