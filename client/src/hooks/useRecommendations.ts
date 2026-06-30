import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Recommendation, RecommendationStatus } from '@umgccapstone/contracts'
import {
  fetchRecommendations,
  generateRecommendations,
  invalidateAfterWrite,
  queryKeys,
  updateRecommendationStatus,
} from '../services'
import { useToast } from '../components/Toaster'
import { messageFor } from '../utils/apiError'

// Past-tense label for the success toast, keyed by the transition. PROPOSED is
// never sent by the UI (it's the initial state), so it never surfaces here.
const STATUS_VERB: Record<RecommendationStatus, string> = {
  PROPOSED: 'updated',
  ACCEPTED: 'accepted',
  DISMISSED: 'dismissed',
  SAVED: 'saved',
}

// Recommendations list query (T-8). The Menu Builder filters the result to
// PROPOSED for its active list; the raw list is cached so a (stretch) history
// view can reuse it.
export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations.list,
    queryFn: fetchRecommendations,
  })
}

// Generate-recommendations mutation (US-MENU-1). On success, refresh the list and
// the Dashboard preview via the ADR-0004 invalidation map. Generation can be slow
// and can fail (AI upstream); the caller drives loading/error UI off this hook.
export function useGenerateRecommendations() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<Recommendation[], unknown, void>({
    mutationFn: () => generateRecommendations(),
    onSuccess: async (recommendations) => {
      await invalidateAfterWrite(queryClient, 'recommendation.generate')
      toast.success(`Generated ${recommendations.length} recommendations`)
    },
  })
}

// Accept/dismiss/save mutation (US-MENU-3/4/5). One hook for all three status
// transitions; the card passes the target status. Success feedback is the shared
// toast; the central map refreshes the list, Dashboard preview, and (on accept,
// which creates a menu item) the regular menu + availability.
export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation<Recommendation, unknown, { id: string; status: RecommendationStatus }>({
    mutationFn: ({ id, status }) => updateRecommendationStatus(id, status),
    onSuccess: async (recommendation) => {
      await invalidateAfterWrite(queryClient, 'recommendation.status')
      toast.success(`Recommendation ${STATUS_VERB[recommendation.status]}`)
    },
    onError: (error) => toast.error(messageFor(error)),
  })
}
