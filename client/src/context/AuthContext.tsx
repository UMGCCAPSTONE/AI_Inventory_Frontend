import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { firebaseAuth, isFirebaseConfigured } from '../services/firebase'
import { setAuthHandlers } from '../services/apiClient'

type AuthContextValue = {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!firebaseAuth) return

    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  // Read Firebase's live currentUser, not React's `user` state: currentUser is
  // set the moment auth resolves, before the state update re-renders the tree.
  // Closing over `user` state left a window where the dashboard's first requests
  // fired before the token-bearing handler re-registered — they went out with no
  // Bearer token, the API 401'd, and onUnauthorized signed the user back out.
  const getIdToken = useCallback(async () => {
    return firebaseAuth?.currentUser ? firebaseAuth.currentUser.getIdToken() : null
  }, [])

  const signOut = useCallback(async () => {
    if (!firebaseAuth) return
    await firebaseSignOut(firebaseAuth)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseAuth) {
      throw new Error('Firebase is not configured.')
    }
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
  }, [])

  // Lets apiClient (a plain module, outside React) attach the current bearer
  // token and react to 401s by clearing the session (shared ADR 0003).
  useEffect(() => {
    setAuthHandlers({ getIdToken, onUnauthorized: signOut })
  }, [getIdToken, signOut])

  const value: AuthContextValue = {
    user,
    loading,
    isConfigured: isFirebaseConfigured,
    signInWithGoogle,
    signOut,
    getIdToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is tightly coupled to AuthProvider's context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
