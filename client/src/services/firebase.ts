import { getApps, initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim()
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim()

const hasFirebaseConfig = Boolean(apiKey && authDomain && projectId && appId)

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
