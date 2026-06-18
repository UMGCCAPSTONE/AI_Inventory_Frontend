import { ApiError } from '../types/api'

// Control appConfig.apiBaseUrl per test. checkBackendHealth reads it at call
// time, so mutating this object between tests is enough.
const { mockConfig } = vi.hoisted(() => ({
  mockConfig: { apiBaseUrl: 'http://localhost:3000/api' as string | undefined },
}))

vi.mock('./config', () => ({ appConfig: mockConfig }))

import { checkBackendHealth } from './health'

function jsonResponse(body: unknown, init?: { ok?: boolean; status?: number }): Response {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => body,
  } as Response
}

describe('checkBackendHealth', () => {
  beforeEach(() => {
    mockConfig.apiBaseUrl = 'http://localhost:3000/api'
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('probes the server root (/health), not the /api base, and unwraps the envelope', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ data: { status: 'ok' } }))

    const result = await checkBackendHealth()

    // Regression guard: the original bug hit /api/health (404). The health
    // endpoint lives at the origin root, outside the /api base.
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/health')
    expect(result).toEqual({ status: 'ok' })
  })

  it('throws CONFIG_ERROR without fetching when no API base URL is set', async () => {
    mockConfig.apiBaseUrl = undefined
    const fetchMock = vi.mocked(fetch)

    const error = await checkBackendHealth().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('CONFIG_ERROR')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws HEALTH_CHECK_FAILED with the status on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(null, { ok: false, status: 503 }))

    const error = await checkBackendHealth().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('HEALTH_CHECK_FAILED')
    expect((error as ApiError).status).toBe(503)
  })
})
