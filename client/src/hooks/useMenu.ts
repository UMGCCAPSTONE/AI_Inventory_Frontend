import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateMenuItemInput, MenuItem } from '@umgccapstone/contracts'
import {
  createMenuItem,
  fetchMenuItems,
  fetchRecommendationAvailability,
  invalidateAfterWrite,
  queryKeys,
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
