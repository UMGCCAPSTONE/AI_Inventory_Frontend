import './App.css'
import { NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './context'
import { DashboardPage, InventoryPage, LoginPage, MenuBuilderPage, ReportsPage, SuppliersPage } from './pages'

const navItems = [
  { label: 'Today', to: '/' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Menu', to: '/menu' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Reports', to: '/reports' },
]

function ComingSoon() {
  return <p style={{ padding: 24 }}>Coming soon.</p>
}

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
    user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? null

  const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? null
  const displayName = firstName ? `Chef ${firstName}` : user?.email ?? null

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
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to={item.to}
              end={item.to === '/'}
              key={item.label}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="account-area">
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
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/menu" element={<MenuBuilderPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </main>
    </>
  )
}

export default App
