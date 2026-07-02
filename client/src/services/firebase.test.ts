import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// firebase.ts reads import.meta.env at module load, so each case stubs the env
// first and then dynamically imports a fresh copy of the module.
vi.mock('firebase/app', () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => ({})),
}))
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ fake: 'auth' })),
}))

function stubFirebaseConfig() {
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-key')
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
  vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')
}

describe('isFirebaseConfigured — VITE_AUTH_DISABLED toggle (backend ADR 0016)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is configured when all VITE_FIREBASE_* are set and the flag is absent', async () => {
    stubFirebaseConfig()

    const { isFirebaseConfigured, firebaseAuth } = await import('./firebase')

    expect(isFirebaseConfigured).toBe(true)
    expect(firebaseAuth).not.toBeNull()
  })

  it("VITE_AUTH_DISABLED='true' is authoritative: login-less even with full Firebase config", async () => {
    stubFirebaseConfig()
    vi.stubEnv('VITE_AUTH_DISABLED', 'true')

    const { isFirebaseConfigured, firebaseAuth } = await import('./firebase')

    expect(isFirebaseConfigured).toBe(false)
    expect(firebaseAuth).toBeNull()
  })

  it('only exactly "true" disables auth — other values leave the config in charge', async () => {
    stubFirebaseConfig()
    vi.stubEnv('VITE_AUTH_DISABLED', 'false')

    const { isFirebaseConfigured } = await import('./firebase')

    expect(isFirebaseConfigured).toBe(true)
  })

  it('stays login-less when Firebase config is missing, regardless of the flag', async () => {
    vi.stubEnv('VITE_AUTH_DISABLED', 'false')

    const { isFirebaseConfigured, firebaseAuth } = await import('./firebase')

    expect(isFirebaseConfigured).toBe(false)
    expect(firebaseAuth).toBeNull()
  })
})
