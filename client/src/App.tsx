import './App.css'
import DashboardHeader from './components/DashboardHeader'
import TodayDashboard from './components/TodayDashboard'
import { useSession } from './hooks'

// Static UI config: primary navigation targets (real routes land in feature
// tickets). Not backend data, so it stays inline.
const navItems = ['Today', 'Inventory', 'Menu', 'Suppliers', 'Reports']

function App() {
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

        <AccountArea />
      </header>

      <main>
        <DashboardHeader />
        <TodayDashboard />
      </main>
    </>
  )
}

function AccountArea() {
  const session = useSession()

  // Neutral placeholders for the loading/error/empty (signed-out) states so the
  // shell never shows fake user data. Auth wiring lands in T-5.
  if (session.status !== 'success') {
    return (
      <div className="account-area">
        <button className="user-chip" type="button">
          <span className="avatar" aria-hidden="true">
            —
          </span>
          <span>{session.status === 'loading' ? 'Loading...' : 'Sign in'}</span>
        </button>
      </div>
    )
  }

  const { user, service } = session.data
  return (
    <div className="account-area">
      <button className="service-pill" type="button">
        <span>Service</span>
        <strong>{service.label}</strong>
      </button>
      <button className="user-chip" type="button">
        <span className="avatar" aria-hidden="true">
          {user.initials}
        </span>
        <span>{user.displayName}</span>
      </button>
    </div>
  )
}

export default App
