import { describe, expect, it } from 'vitest'
import { ApiError } from './api'

describe('ApiError', () => {
  it('is an Error carrying the envelope code/field and HTTP status', () => {
    const err = new ApiError({ code: 'VALIDATION', message: 'Name is required', field: 'name' }, 400)

    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiError')
    expect(err.message).toBe('Name is required')
    expect(err.code).toBe('VALIDATION')
    expect(err.field).toBe('name')
    expect(err.status).toBe(400)
  })

  it('leaves field and status undefined when not provided', () => {
    const err = new ApiError({ code: 'UNKNOWN_ERROR', message: 'boom' })

    expect(err.field).toBeUndefined()
    expect(err.status).toBeUndefined()
  })
})
