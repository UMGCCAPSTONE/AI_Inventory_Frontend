import './App.css'
import { useAuth } from './context'
import DashboardHeader from './components/DashboardHeader'
import TodayDashboard from './components/TodayDashboard'
import { LoginPage } from './pages'

const navItems = ['Today', 'Inventory', 'Menu', 'Suppliers', 'Reports']

function App() {
  const { user, loading, isConfigured, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-label="Checking authentication">
        <p className="auth-loading-text">Loading…</p>
      </div>
    )
  }

  if (isConfigured && !user) {
    return <LoginPage />
  }

  const avatarInitial =
    user?.displayName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    null

  const displayName = user?.displayName ?? user?.email ?? null

  return (
    <>
      <header className="app-header" aria-label="Primary">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <div className="brand-copy">
            <span className="brand-name">Mise</span>
            <span className="brand-tagline">smart kitchen inventory</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              className={item === 'Today' ? 'nav-link active' : 'nav-link'}
              href={`#${item.toLowerCase()}`}
              key={item}
              aria-current={item === 'Today' ? 'page' : undefined}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="account-area">
          <button className="service-pill" type="button">
            <span>Service</span>
            <strong>Not set</strong>
          </button>
          {user ? (
            <button
              className="user-chip"
              type="button"
              onClick={signOut}
              aria-label={`Signed in as ${displayName ?? 'user'}. Click to sign out.`}
            >
              <span className="avatar" aria-hidden="true">
                {avatarInitial}
              </span>
              <span>{displayName}</span>
            </button>
          ) : (
            <button
              className="user-chip"
              type="button"
              onClick={isConfigured ? signInWithGoogle : undefined}
              disabled={!isConfigured}
            >
              <span className="avatar" aria-hidden="true" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </header>

      <main>
        <DashboardHeader />
        <TodayDashboard />
      </main>
    </>
  )
}

export default App
