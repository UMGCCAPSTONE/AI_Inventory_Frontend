import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

import { createSupplier, fetchSuppliers, updateSupplier } from './suppliers'
import { apiClient } from './apiClient'

const getMock = vi.mocked(apiClient.get)
const postMock = vi.mocked(apiClient.post)
const patchMock = vi.mocked(apiClient.patch)

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

describe('createSupplier', () => {
  it('POSTs the new supplier payload to /suppliers', async () => {
    const created = { id: 's9', name: 'New Co' }
    postMock.mockResolvedValue(created as never)

    const input = { name: 'New Co', email: 'hi@new.test' }
    await expect(createSupplier(input)).resolves.toEqual(created)
    expect(postMock).toHaveBeenCalledWith('/suppliers', input)
  })
})

describe('updateSupplier', () => {
  it('PATCHes only the provided fields to /suppliers/:id', async () => {
    const updated = { id: 's1', name: 'Renamed' }
    patchMock.mockResolvedValue(updated as never)

    await expect(updateSupplier('s1', { name: 'Renamed' })).resolves.toEqual(updated)
    expect(patchMock).toHaveBeenCalledWith('/suppliers/s1', { name: 'Renamed' })
  })
})
