import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

import {
  createSupplier,
  fetchRecentDeliveries,
  fetchSupplierDeliveries,
  fetchSuppliers,
  updateSupplier,
} from './suppliers'
import { apiClient } from './apiClient'
import { ApiError } from '../types/api'

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

describe('fetchSupplierDeliveries', () => {
  it('GETs delivery history from /suppliers/:id/deliveries', async () => {
    const deliveries = [{ id: 'd1', supplierId: 's1', deliveryDate: '2026-06-01', items: [], totalAmount: 0 }]
    getMock.mockResolvedValue(deliveries as never)

    await expect(fetchSupplierDeliveries('s1')).resolves.toEqual(deliveries)
    expect(getMock).toHaveBeenCalledWith('/suppliers/s1/deliveries')
  })

  it('falls back to an empty array when the API returns nothing', async () => {
    getMock.mockResolvedValue(undefined as never)

    await expect(fetchSupplierDeliveries('s1')).resolves.toEqual([])
  })

  it('degrades a 404 to an empty array (endpoint not yet live, T-72)', async () => {
    getMock.mockRejectedValue(new ApiError({ code: 'NOT_FOUND', message: 'Not found' }, 404))

    await expect(fetchSupplierDeliveries('s1')).resolves.toEqual([])
  })

  it('re-throws non-404 errors so the UI can show an error state', async () => {
    const serverError = new ApiError({ code: 'SERVER_ERROR', message: 'Boom' }, 500)
    getMock.mockRejectedValue(serverError)

    await expect(fetchSupplierDeliveries('s1')).rejects.toBe(serverError)
  })
})

describe('fetchRecentDeliveries', () => {
  it('GETs cross-supplier deliveries from /deliveries/recent', async () => {
    const deliveries = [
      { id: 'd1', supplierId: 's1', supplierName: 'Acme', deliveryDate: '2026-06-01', items: [], totalAmount: 0 },
    ]
    getMock.mockResolvedValue(deliveries as never)

    await expect(fetchRecentDeliveries()).resolves.toEqual(deliveries)
    expect(getMock).toHaveBeenCalledWith('/deliveries/recent')
  })

  it('degrades a 404 to an empty array (endpoint not yet live, T-72)', async () => {
    getMock.mockRejectedValue(new ApiError({ code: 'NOT_FOUND', message: 'Not found' }, 404))

    await expect(fetchRecentDeliveries()).resolves.toEqual([])
  })

  it('re-throws non-404 errors so the UI can show an error state', async () => {
    const serverError = new ApiError({ code: 'SERVER_ERROR', message: 'Boom' }, 500)
    getMock.mockRejectedValue(serverError)

    await expect(fetchRecentDeliveries()).rejects.toBe(serverError)
  })
})
