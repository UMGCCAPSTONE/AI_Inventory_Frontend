import { useEffect } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createSupplierInputSchema,
  type CreateSupplierInput,
  type Supplier,
  type UpdateSupplierInput,
} from '@umgccapstone/contracts'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'

// Supplier add/edit form (T-9B). Validation rules come entirely from the shared
// `createSupplierInputSchema` (ADR 0003) — we never restate them here. Blank
// optional inputs are coerced to `undefined` at the field level (setValueAs) so
// an empty email reads as "absent", not an invalid address.

type SupplierFormProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Supplier
  submitting?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (payload: CreateSupplierInput | UpdateSupplierInput) => void
}

const blankValues: CreateSupplierInput = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  deliveryCadence: '',
}

const emptyToUndefined = (value: string) => (value.trim() === '' ? undefined : value)

// RHF's `register` puts its ref on whatever element it spreads onto; MUI needs
// that ref on the inner input via `inputRef`, so re-route it.
function bind({ ref, ...rest }: UseFormRegisterReturn) {
  return { ...rest, inputRef: ref }
}

function toFormValues(supplier?: Supplier): CreateSupplierInput {
  if (!supplier) return blankValues
  return {
    name: supplier.name,
    contactName: supplier.contactName ?? '',
    email: supplier.email ?? '',
    phone: supplier.phone ?? '',
    deliveryCadence: supplier.deliveryCadence ?? '',
  }
}

function SupplierForm({
  open,
  mode,
  initialValues,
  submitting = false,
  errorMessage,
  onClose,
  onSubmit,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<CreateSupplierInput>({
    resolver: zodResolver(createSupplierInputSchema),
    defaultValues: blankValues,
  })

  // Re-seed the fields whenever the dialog opens or the edited supplier changes.
  useEffect(() => {
    if (open) reset(toFormValues(initialValues))
  }, [open, initialValues, reset])

  const submit = handleSubmit((values) => {
    if (mode === 'edit') {
      if (Object.keys(dirtyFields).length === 0) return
      // Send only the fields the user actually changed (US-SUPP-3).
      // values[key] is undefined when the user cleared an optional field via setValueAs;
      // use '' so the key is present in the JSON body and the server overwrites the old value.
      const patch: UpdateSupplierInput = {}
      for (const key of Object.keys(dirtyFields) as (keyof CreateSupplierInput)[]) {
        patch[key] = values[key] ?? ''
      }
      onSubmit(patch)
      return
    }
    onSubmit(values)
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="supplier-form-title"
    >
      <DialogTitle id="supplier-form-title">
        {mode === 'edit' ? 'Edit supplier' : 'Add supplier'}
      </DialogTitle>
      <Box component="form" onSubmit={submit} noValidate>
        <DialogContent>
          {errorMessage ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          ) : null}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required
              autoFocus
              fullWidth
              {...bind(register('name'))}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              label="Contact name"
              fullWidth
              {...bind(register('contactName', { setValueAs: emptyToUndefined }))}
              error={Boolean(errors.contactName)}
              helperText={errors.contactName?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...bind(register('email', { setValueAs: emptyToUndefined }))}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <TextField
              label="Phone"
              fullWidth
              {...bind(register('phone', { setValueAs: emptyToUndefined }))}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
            />
            <TextField
              label="Delivery cadence"
              placeholder="e.g. Weekly (Tue)"
              fullWidth
              {...bind(register('deliveryCadence', { setValueAs: emptyToUndefined }))}
              error={Boolean(errors.deliveryCadence)}
              helperText={errors.deliveryCadence?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {mode === 'edit' ? 'Save changes' : 'Add supplier'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default SupplierForm
