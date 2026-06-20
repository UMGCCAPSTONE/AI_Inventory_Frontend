import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import type { InventoryItem } from '@umgccapstone/contracts'
import { useDeleteInventoryItem } from '../hooks'
import { ApiError } from '../types/api'

// Delete confirmation (T-7C). Requires the user to type the item name (US-INV-5)
// so a delete is always deliberate. If the backend answers 409 ITEM_IN_USE, the
// item is referenced by a live dish: we keep the row and surface the conflict
// message (the referencing dishes) instead of closing.

type ConfirmDeleteDialogProps = {
  open: boolean
  item: InventoryItem | null
  onClose: () => void
}

function ConfirmDeleteDialog({ open, item, onClose }: ConfirmDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(open)
  const deleteMutation = useDeleteInventoryItem()

  // Clear the typed name + any prior conflict on each open transition. Adjusting
  // state during render (not in an effect) avoids a cascading re-render.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setConfirmText('')
      setConflictMessage(null)
    }
  }

  if (!item) return null

  const nameMatches = confirmText.trim() === item.name

  function handleDelete() {
    if (!item) return
    setConflictMessage(null)
    deleteMutation.mutate(item.id, {
      onSuccess: onClose,
      onError: (error) => {
        if (error instanceof ApiError && error.code === 'ITEM_IN_USE') {
          setConflictMessage(error.message)
        } else if (error instanceof ApiError) {
          setConflictMessage(error.message)
        } else {
          setConflictMessage('Could not delete this item. Please try again.')
        }
      },
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete item</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This permanently removes <strong>{item.name}</strong>. Type the item name to confirm.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          label="Item name"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          sx={{ mt: 2 }}
        />
        {conflictMessage ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {conflictMessage}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={!nameMatches || deleteMutation.isPending}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeleteDialog
