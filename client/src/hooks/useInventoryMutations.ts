import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateInventoryItemInput,
  InventoryItem,
  UpdateInventoryItemInput,
} from '@umgccapstone/contracts'
import {
  createInventoryItem,
  deleteInventoryItem,
  invalidateAfterWrite,
  updateInventoryItem,
} from '../services'
import { useToast } from '../components/Toaster'

// Inventory write mutations (T-7C). Every success funnels through the central
// write->invalidate map (ADR 0004) so the grid, metric cards, and dashboard
// refresh from the server (which recomputes derived fields — ADR 0004), never
// from a client-side patch. Field-level error handling stays at the call site:
// the form maps ApiError.field to an inline message, the delete dialog branches
// on the ITEM_IN_USE code. Generic success feedback is the shared toast.

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<InventoryItem, unknown, CreateInventoryItemInput>({
    mutationFn: (input) => createInventoryItem(input),
    onSuccess: async () => {
      await invalidateAfterWrite(queryClient, 'inventory.write')
      toast.success('Item added')
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<InventoryItem, unknown, { id: string; input: UpdateInventoryItemInput }>({
    mutationFn: ({ id, input }) => updateInventoryItem(id, input),
    onSuccess: async () => {
      await invalidateAfterWrite(queryClient, 'inventory.write')
      toast.success('Item updated')
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<void, unknown, string>({
    mutationFn: (id) => deleteInventoryItem(id),
    onSuccess: async () => {
      await invalidateAfterWrite(queryClient, 'inventory.write')
      toast.success('Item deleted')
    },
  })
}
