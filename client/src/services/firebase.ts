import { getApps, initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim()
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim()

// Frontend half of the AUTH_DISABLED toggle (backend ADR 0016): the deploy
// passes the single AUTH_DISABLED value in as VITE_AUTH_DISABLED, and exactly
// 'true' is authoritative — the login wall comes down even though the
// VITE_FIREBASE_* config is present, matching the backend, which passes every
// request through. Any other value leaves the Firebase config in charge.
const authDisabled = import.meta.env.VITE_AUTH_DISABLED?.trim() === 'true'

const hasFirebaseConfig = Boolean(apiKey && authDomain && projectId && appId) && !authDisabled

// Auth is optional (shared ADR 0003): without VITE_FIREBASE_* vars the app
// runs unauthenticated — apiClient sends requests with no Bearer token and
// AuthContext reports isConfigured: false.
export const isFirebaseConfigured = hasFirebaseConfig

export const firebaseAuth: Auth | null = hasFirebaseConfig
  ? getAuth(
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({ apiKey, authDomain, projectId, appId }),
    )
  : null
