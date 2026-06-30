import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Supplier } from '@umgccapstone/contracts'
import SupplierForm from './SupplierForm'

const supplier: Supplier = {
  id: 's1',
  name: 'Acme Produce',
  contactName: 'Jane Doe',
  email: 'jane@acme.test',
  phone: '555-0100',
  deliveryCadence: 'Weekly',
  totalSpend: 1250,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function textbox(name: string) {
  return screen.getByRole('textbox', { name }) as HTMLInputElement
}

describe('SupplierForm', () => {
  it('blocks submit and shows a validation error when the required name is empty', async () => {
    const onSubmit = vi.fn()
    render(<SupplierForm open mode="create" onClose={vi.fn()} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))

    expect(await screen.findByText(/at least 1 character/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a create payload with blank optionals normalized to undefined', async () => {
    const onSubmit = vi.fn()
    render(<SupplierForm open mode="create" onClose={vi.fn()} onSubmit={onSubmit} />)

    fireEvent.change(textbox('Name'), { target: { value: 'Acme Produce' } })
    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.name).toBe('Acme Produce')
    expect(payload.email).toBeUndefined()
    expect(payload.contactName).toBeUndefined()
  })

  it('does not submit an invalid email', async () => {
    const onSubmit = vi.fn()
    render(<SupplierForm open mode="create" onClose={vi.fn()} onSubmit={onSubmit} />)

    fireEvent.change(textbox('Name'), { target: { value: 'Acme' } })
    fireEvent.change(textbox('Email'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))

    await waitFor(() => expect(textbox('Email')).toHaveAttribute('aria-invalid', 'true'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('pre-fills the form from server data in edit mode', async () => {
    render(
      <SupplierForm open mode="edit" initialValues={supplier} onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await waitFor(() => expect(textbox('Name').value).toBe('Acme Produce'))
    expect(textbox('Contact name').value).toBe('Jane Doe')
    expect(textbox('Email').value).toBe('jane@acme.test')
  })

  it('sends only the changed fields on edit submit', async () => {
    const onSubmit = vi.fn()
    render(
      <SupplierForm
        open
        mode="edit"
        initialValues={supplier}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await waitFor(() => expect(textbox('Name').value).toBe('Acme Produce'))
    fireEvent.change(textbox('Name'), { target: { value: 'Acme Renamed' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Acme Renamed' })
  })
})
