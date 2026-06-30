import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateMenuItemInput, MenuItem, UpdateMenuItemInput } from '@umgccapstone/contracts'
import {
  archiveMenuItem,
  createMenuItem,
  fetchMenuItems,
  fetchRecommendationAvailability,
  invalidateAfterWrite,
  queryKeys,
  updateMenuItem,
} from '../services'
import { useToast } from '../components/Toaster'
import { messageFor } from '../utils/apiError'

export function useRecommendationAvailability() {
  return useQuery({
    queryKey: queryKeys.menu.availability,
    queryFn: fetchRecommendationAvailability,
  })
}

// Menu items with live availability (T-8 "regular menu" section). Returns every
// item; the Menu Builder filters to ACTIVE for display.
export function useMenuItems() {
  return useQuery({
    queryKey: queryKeys.menu.items,
    queryFn: fetchMenuItems,
  })
}

// Create-menu-item mutation (T-8 "Add Dish"). On success refreshes the regular
// menu + availability via the ADR-0004 map and toasts; field errors stay inline
// on the form (the modal maps ApiError.field).
export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<MenuItem, unknown, CreateMenuItemInput>({
    mutationFn: (input) => createMenuItem(input),
    onSuccess: async () => {
      await invalidateAfterWrite(queryClient, 'menuItem.write')
      toast.success('Dish added')
    },
    onError: (error) => toast.error(messageFor(error)),
  })
}

// Update-menu-item mutation (T-72). Currently drives the "Make special" toggle
// from the Current-menu kebab; refreshes the menu + availability via the same
// `menuItem.write` map and confirms the new state with a toast.
export function useUpdateMenuItem() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<MenuItem, unknown, { id: string; input: UpdateMenuItemInput }>({
    mutationFn: ({ id, input }) => updateMenuItem(id, input),
    onSuccess: async (updated) => {
      await invalidateAfterWrite(queryClient, 'menuItem.write')
      toast.success(updated.isSpecial ? 'Added to specials' : 'Removed from specials')
    },
    onError: (error) => toast.error(messageFor(error)),
  })
}

// Archive-menu-item mutation (T-72 "Delete"). Soft-archives the dish, then
// refreshes the regular menu + availability via the same ADR-0004 map as create
// (`menuItem.write`) and toasts. Errors surface as a toast.
export function useArchiveMenuItem() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<MenuItem, unknown, string>({
    mutationFn: (id) => archiveMenuItem(id),
    onSuccess: async () => {
      await invalidateAfterWrite(queryClient, 'menuItem.write')
      toast.success('Dish removed')
    },
    onError: (error) => toast.error(messageFor(error)),
  })
}
