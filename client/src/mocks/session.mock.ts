import type { Session } from '../types/contracts'

/**
 * Mock fixture for the signed-in session shown in the app header. Relocated out
 * of `App.tsx` so no fake user data is baked into the shell. Served by
 * `useSession()` only when `appConfig.enableMocks` is true; auth wiring lands in
 * T-5.
 */
export const sessionMock: Session = {
  user: {
    displayName: 'Chef Marco - Tavola',
    initials: 'CM',
    venue: 'Tavola',
  },
  service: {
    label: 'Dinner - Tue',
  },
}
