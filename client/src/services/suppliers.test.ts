import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./apiClient', () => ({ apiClient: { get: vi.fn() } }))

import { fetchSuppliers } from './suppliers'
import { apiClient } from './apiClient'

const getMock = vi.mocked(apiClient.get)

afterEach(() => vi.clearAllMocks())

describe('fetchSuppliers', () => {
  it('requests the suppliers list', async () => {
    getMock.mockResolvedValue([{ id: 's1', name: 'Acme Produce' }] as never)

    await expect(fetchSuppliers()).resolves.toEqual([{ id: 's1', name: 'Acme Produce' }])
    expect(getMock).toHaveBeenCalledWith('/suppliers')
  })

  it('falls back to an empty array when the API returns nothing', async () => {
    getMock.mockResolvedValue(undefined as never)

    await expect(fetchSuppliers()).resolves.toEqual([])
  })
})
