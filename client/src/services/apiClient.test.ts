import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Control the base URL without depending on env files.
vi.mock('./config', () => ({ appConfig: { apiBaseUrl: 'http://api.test' } }))

import { appConfig } from './config'
import { apiClient, setAuthHandlers } from './apiClient'
import { ApiError } from '../types/api'

function res(body: unknown, { ok = true, status = 200 } = {}) {
  return { ok, status, json: async () => body }
}

const fetchMock = vi.fn()

beforeEach(() => {
  ;(appConfig as { apiBaseUrl?: string }).apiBaseUrl = 'http://api.test'
  setAuthHandlers({ getIdToken: async () => null, onUnauthorized: vi.fn() })
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiClient', () => {
  it('get() unwraps the { data } envelope', async () => {
    fetchMock.mockResolvedValue(res({ data: { id: '1' } }))
    await expect(apiClient.get('/x')).resolves.toEqual({ id: '1' })
  })

  it('list() keeps the { data, meta } envelope for pagination', async () => {
    fetchMock.mockResolvedValue(res({ data: [1, 2], meta: { total: 5 } }))
    await expect(apiClient.list('/x')).resolves.toEqual({ data: [1, 2], meta: { total: 5 } })
  })

  it('throws a typed ApiError built from an { error } body', async () => {
    fetchMock.mockResolvedValue(
      res({ error: { code: 'BAD', message: 'nope', field: 'name' } }, { ok: false, status: 400 }),
    )
    await expect(apiClient.get('/x')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'BAD',
      field: 'name',
      status: 400,
    })
  })

  it('throws UNKNOWN_ERROR on a non-ok response with no error body', async () => {
    fetchMock.mockResolvedValue(res(null, { ok: false, status: 500 }))
    await expect(apiClient.get('/x')).rejects.toMatchObject({ code: 'UNKNOWN_ERROR', status: 500 })
  })

  it('invokes onUnauthorized on a 401', async () => {
    const onUnauthorized = vi.fn()
    setAuthHandlers({ getIdToken: async () => null, onUnauthorized })
    fetchMock.mockResolvedValue(
      res({ error: { code: 'UNAUTHENTICATED', message: 'no' } }, { ok: false, status: 401 }),
    )
    await expect(apiClient.get('/x')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('throws CONFIG_ERROR (and never fetches) when no base URL is configured', async () => {
    ;(appConfig as { apiBaseUrl?: string }).apiBaseUrl = undefined
    await expect(apiClient.get('/x')).rejects.toMatchObject({ code: 'CONFIG_ERROR' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('attaches the Firebase bearer token when one is available', async () => {
    setAuthHandlers({ getIdToken: async () => 'tok123', onUnauthorized: vi.fn() })
    fetchMock.mockResolvedValue(res({ data: {} }))
    await apiClient.get('/x')
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer tok123')
  })
})
