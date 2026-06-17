import { useEffect } from 'react'
import './App.css'
import DashboardHeader from './components/DashboardHeader'
import TodayDashboard from './components/TodayDashboard'
import { appConfig, checkBackendHealth } from './services'
import { ApiError } from './types/api'

const navItems = ['Today', 'Inventory', 'Menu', 'Suppliers', 'Reports']

function App() {
  // Dev convenience: probe the backend once on startup and log the result so
  // we can confirm the frontend is talking to the configured API.
  useEffect(() => {
    let cancelled = false

    const healthUrl = appConfig.apiBaseUrl
      ? `${new URL(appConfig.apiBaseUrl).origin}/health`
      : 'no API base URL configured'

    checkBackendHealth()
      .then((health) => {
        if (cancelled) return
        console.info(`[backend] connected to ${healthUrl}`, health)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const detail =
          error instanceof ApiError
            ? `${error.code}: ${error.message}`
            : String(error)
        console.error(`[backend] health check failed (${healthUrl}) — ${detail}`)
      })

    return () => {
      cancelled = true
    }
  }, [])

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
          <button className="user-chip" type="button">
            <span className="avatar" aria-hidden="true" />
            <span>Sign in</span>
          </button>
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
