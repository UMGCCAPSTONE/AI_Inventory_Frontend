import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import {
  categorySchema,
  createInventoryItemInputSchema,
  unitSchema,
  type Category,
  type CreateInventoryItemInput,
  type InventoryItem,
  type Unit,
} from '@umgccapstone/contracts'
import { useCreateInventoryItem, useUpdateInventoryItem } from '../hooks'
import { ApiError } from '../types/api'
import { CATEGORY_LABELS } from '../utils/categories'

// Shared add/edit form (T-7C). One MUI dialog, two modes. Validation comes
// straight from the contract Zod schema via zodResolver (ADR 0003) so the client
// can never submit a payload the backend rejects, and a server 400 with a
// `field` maps back onto that exact input. The supplier list is fetched from the
// API (T-14), never hardcoded.

type FormValues = CreateInventoryItemInput

const ADD_DEFAULTS = {
  name: '',
  category: 'PRODUCE' as Category,
  unit: 'each' as Unit,
  expirationDate: null,
}

type InventoryFormModalProps =
  | { open: boolean; mode: 'add'; onClose: () => void; suppliers: { id: string; name: string }[] }
  | {
      open: boolean
      mode: 'edit'
      item: InventoryItem
      onClose: () => void
      suppliers: { id: string; name: string }[]
    }

function InventoryFormModal(props: InventoryFormModalProps) {
  const { open, mode, onClose, suppliers } = props
  const item = mode === 'edit' ? props.item : null

  const createMutation = useCreateInventoryItem()
  const updateMutation = useUpdateInventoryItem()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createInventoryItemInputSchema),
    defaultValues: ADD_DEFAULTS,
  })

  // Re-seed the form whenever the dialog opens: pre-fill from the item in edit
  // mode (covers par level + supplier), reset to blanks in add mode.
  useEffect(() => {
    if (!open) return
    if (item) {
      reset({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        parLevel: item.parLevel,
        unitCost: item.unitCost,
        expirationDate: item.expirationDate,
        supplierId: item.supplierId,
      })
    } else {
      reset(ADD_DEFAULTS)
    }
  }, [open, item, reset])

  const onSubmit = handleSubmit((values) => {
    const handleError = (error: unknown) => {
      if (error instanceof ApiError && error.field) {
        setError(error.field as keyof FormValues, { type: 'server', message: error.message })
      } else if (error instanceof ApiError) {
        // Non-field errors are surfaced by the mutation toast; nothing inline.
      }
    }

    if (mode === 'add') {
      createMutation.mutate(values, { onSuccess: onClose, onError: handleError })
    } else if (item) {
      updateMutation.mutate(
        { id: item.id, input: values },
        { onSuccess: onClose, onError: handleError },
      )
    }
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle>{mode === 'add' ? 'Add item' : 'Edit item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Category"
                  required
                  fullWidth
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={Boolean(errors.category)}
                  helperText={errors.category?.message}
                >
                  {categorySchema.options.map((value) => (
                    <MenuItem key={value} value={value}>
                      {CATEGORY_LABELS[value]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Quantity"
                type="number"
                required
                fullWidth
                slotProps={{ htmlInput: { step: 'any', min: 0 } }}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity?.message}
                {...register('quantity', { valueAsNumber: true })}
              />
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Unit"
                    required
                    fullWidth
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={Boolean(errors.unit)}
                    helperText={errors.unit?.message}
                  >
                    {unitSchema.options.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Par level"
                type="number"
                required
                fullWidth
                slotProps={{ htmlInput: { step: 'any', min: 0 } }}
                error={Boolean(errors.parLevel)}
                helperText={errors.parLevel?.message}
                {...register('parLevel', { valueAsNumber: true })}
              />
              <TextField
                label="Unit cost"
                type="number"
                required
                fullWidth
                slotProps={{ htmlInput: { step: 'any', min: 0 } }}
                error={Boolean(errors.unitCost)}
                helperText={errors.unitCost?.message}
                {...register('unitCost', { valueAsNumber: true })}
              />
            </Stack>

            <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Expiry date"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={field.value ? String(field.value).slice(0, 10) : ''}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value ? new Date(event.target.value).toISOString() : null,
                    )
                  }
                  error={Boolean(errors.expirationDate)}
                  helperText={errors.expirationDate?.message ?? 'Leave blank for non-perishables'}
                />
              )}
            />

            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Supplier"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : event.target.value)
                  }
                >
                  <MenuItem value="">— None —</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {mode === 'add' ? 'Add item' : 'Save changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default InventoryFormModal
