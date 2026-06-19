import { useState } from 'react'
import { useAuth } from '../context'

function LoginPage() {
  const { signInWithGoogle, isConfigured } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      setError('Sign-in failed. Please try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <div className="brand-copy">
            <span className="brand-name">Mise</span>
            <span className="brand-tagline">smart kitchen inventory</span>
          </div>
        </div>

        <h1 className="login-heading">Welcome back.</h1>
        <p className="login-subheading">Sign in to manage your kitchen inventory.</p>

        {!isConfigured && (
          <p className="login-notice" role="status">
            Authentication is not configured in this environment.
          </p>
        )}

        {error !== null && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="sign-in-button"
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn || !isConfigured}
          aria-busy={isSigningIn}
        >
          {isSigningIn ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}

export default LoginPage
