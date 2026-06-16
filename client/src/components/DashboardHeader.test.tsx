import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardHeader from './DashboardHeader'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  )
}

describe('DashboardHeader', () => {
  it('renders without crashing', () => {
    render(<DashboardHeader />, { wrapper })

    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toBeInTheDocument()
  })
})
