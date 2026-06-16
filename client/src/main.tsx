import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context'
import { logBackendHealth } from './services'
import { theme } from './styles/theme'

const queryClient = new QueryClient()

// Dev-only: log whether the frontend can reach the backend so connectivity is
// visible in the browser console without wiring a full data screen.
if (import.meta.env.DEV) {
  void logBackendHealth()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
