import { appConfig } from '../services/config'
import { sessionMock } from '../mocks/session.mock'
import type { Session } from '../types/contracts'
import { useAsyncResource, type AsyncResource } from './useAsyncResource'

/**
 * Seam: returns the mock session while `enableMocks` is on, otherwise resolves
 * empty (signed-out). T-5 replaces this body with the Firebase auth session.
 */
async function fetchSession(): Promise<Session | null> {
  if (appConfig.enableMocks) return sessionMock
  return null
}

export function useSession(): AsyncResource<Session> {
  return useAsyncResource(fetchSession, [])
}
