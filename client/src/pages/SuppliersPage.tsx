import { useState } from 'react'
import { Alert, Box, Button, Snackbar } from '@mui/material'
import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from '@umgccapstone/contracts'
import { ApiError } from '../types/api'
import SupplierDeliveryHistory from '../components/SupplierDeliveryHistory'
import SupplierDirectory from '../components/SupplierDirectory'
import SupplierForm from '../components/SupplierForm'
import { useCreateSupplier, useUpdateSupplier } from '../hooks'

// Suppliers page (T-9B). Wraps the T-9A directory with an "Add supplier" action
// and a create/edit modal, and surfaces success/error feedback via a Snackbar.
// First mutation screen in the app; a shared toast is a later refactor.

type Toast = { severity: 'success' | 'error'; message: string }

function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}

function SuppliersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [historySupplier, setHistorySupplier] = useState<Supplier | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const submitting = createSupplier.isPending || updateSupplier.isPending

  function openAdd() {
    setEditing(null)
    setSubmitError(null)
    setFormOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setSubmitError(null)
    setFormOpen(true)
  }

  async function handleSubmit(payload: CreateSupplierInput | UpdateSupplierInput) {
    setSubmitError(null)
    try {
      if (editing) {
        await updateSupplier.mutateAsync({ id: editing.id, input: payload })
        setToast({ severity: 'success', message: 'Supplier updated.' })
      } else {
        await createSupplier.mutateAsync(payload as CreateSupplierInput)
        setToast({ severity: 'success', message: 'Supplier added.' })
      }
      setFormOpen(false)
    } catch (error) {
      // Keep the form open so the user can correct and retry.
      setSubmitError(messageFor(error))
      setToast({ severity: 'error', message: messageFor(error) })
    }
  }

  return (
    <Box component="section" aria-label="Suppliers">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          maxWidth: 1390,
          mx: 'auto',
          px: { xs: 2, md: 4.5 },
          pt: 4,
        }}
      >
        <Button variant="contained" onClick={openAdd}>
          Add supplier
        </Button>
      </Box>

      <SupplierDirectory
        onEditSupplier={openEdit}
        onViewHistory={(s) => setHistorySupplier(s)}
      />

      <SupplierDeliveryHistory
        supplier={historySupplier}
        onClose={() => setHistorySupplier(null)}
      />

      <SupplierForm
        open={formOpen}
        mode={editing ? 'edit' : 'create'}
        initialValues={editing ?? undefined}
        submitting={submitting}
        errorMessage={submitError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {toast ? (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      ) : null}
    </Box>
  )
}

export default SuppliersPage
