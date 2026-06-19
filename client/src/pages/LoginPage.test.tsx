import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from './LoginPage'

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../context', () => ({
  useAuth: mockUseAuth,
}))

function makeAuth(overrides: Partial<ReturnType<typeof mockUseAuth>> = {}) {
  return {
    user: null,
    loading: false,
    isConfigured: true,
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    getIdToken: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(makeAuth())
  })

  it('renders the sign-in heading and button', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })

  it('calls signInWithGoogle when the button is clicked', () => {
    const signInWithGoogle = vi.fn().mockResolvedValue(undefined)
    mockUseAuth.mockReturnValue(makeAuth({ signInWithGoogle }))

    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }))

    expect(signInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('shows an error alert when sign-in fails', async () => {
    const signInWithGoogle = vi.fn().mockRejectedValue(new Error('auth failed'))
    mockUseAuth.mockReturnValue(makeAuth({ signInWithGoogle }))

    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('disables the button when Firebase is not configured', () => {
    mockUseAuth.mockReturnValue(makeAuth({ isConfigured: false }))

    render(<LoginPage />)

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeDisabled()
  })
})
