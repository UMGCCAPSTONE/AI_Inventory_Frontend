import { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  createMenuItemInputSchema,
  unitSchema,
  type CreateMenuItemInput,
  type InventoryItem,
} from '@umgccapstone/contracts'
import { useCreateMenuItem } from '../hooks'
import { ApiError } from '../types/api'

type MenuItemFormModalProps = {
  open: boolean
  onClose: () => void
  // Inventory items to pick ingredients from (id/name/unit are what we use).
  inventoryItems: InventoryItem[]
}

const EMPTY_INGREDIENT = { inventoryItemId: '', name: '', quantity: 1, unit: 'each' as const }

const ADD_DEFAULTS: CreateMenuItemInput = {
  name: '',
  isSpecial: false,
  status: 'ACTIVE',
  ingredients: [EMPTY_INGREDIENT],
}

// Add-dish form (T-8). One MUI dialog; create-only for now (editing a dish is the
// parked T-8S "editable" bit). Validation comes from the contract Zod schema via
// zodResolver (ADR 0003) so the client can't submit a payload the backend rejects.
// Each ingredient row links to a real inventory item; picking one fills the line's
// name + default unit (the contract needs both).
function MenuItemFormModal({ open, onClose, inventoryItems }: MenuItemFormModalProps) {
  const createMutation = useCreateMenuItem()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateMenuItemInput>({
    resolver: zodResolver(createMenuItemInputSchema),
    defaultValues: ADD_DEFAULTS,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })

  useEffect(() => {
    if (open) reset(ADD_DEFAULTS)
  }, [open, reset])

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: onClose,
      onError: (error) => {
        if (error instanceof ApiError && error.field) {
          setError(error.field as keyof CreateMenuItemInput, {
            type: 'server',
            message: error.message,
          })
        }
        // Non-field errors surface via the mutation toast.
      },
    })
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle>Add dish</DialogTitle>
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
            <TextField label="Description" fullWidth multiline minRows={2} {...register('description')} />
            <Controller
              name="isSpecial"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Special"
                />
              )}
            />

            <Divider />
            <Typography variant="subtitle2">Ingredients</Typography>
            {typeof errors.ingredients?.message === 'string' ? (
              <Typography variant="body2" color="error">
                {errors.ingredients.message}
              </Typography>
            ) : null}

            {fields.map((row, index) => (
              <Stack key={row.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <Controller
                  name={`ingredients.${index}.inventoryItemId`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Ingredient"
                      required
                      sx={{ flex: 2 }}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        const item = inventoryItems.find((i) => i.id === e.target.value)
                        if (item) {
                          setValue(`ingredients.${index}.name`, item.name)
                          setValue(`ingredients.${index}.unit`, item.unit)
                        }
                      }}
                      error={Boolean(errors.ingredients?.[index]?.inventoryItemId)}
                    >
                      {inventoryItems.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <TextField
                  label="Qty"
                  type="number"
                  required
                  sx={{ flex: 1 }}
                  error={Boolean(errors.ingredients?.[index]?.quantity)}
                  {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                />
                <Controller
                  name={`ingredients.${index}.unit`}
                  control={control}
                  render={({ field }) => (
                    <TextField select label="Unit" sx={{ flex: 1 }} value={field.value ?? 'each'} onChange={field.onChange}>
                      {unitSchema.options.map((u) => (
                        <MenuItem key={u} value={u}>
                          {u}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <IconButton
                  aria-label="Remove ingredient"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  sx={{ mt: 1 }}
                >
                  ✕
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => append(EMPTY_INGREDIENT)} sx={{ alignSelf: 'flex-start' }}>
              + Add ingredient
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding…' : 'Add dish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default MenuItemFormModal
