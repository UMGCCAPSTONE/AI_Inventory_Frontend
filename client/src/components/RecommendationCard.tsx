import { useState } from 'react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import type { Recommendation, RecommendationStatus } from '@umgccapstone/contracts'
import { CARD_TINTS } from '../utils/cardTints'

type RecommendationCardProps = {
  recommendation: Recommendation
  // Fired when the user accepts/dismisses/saves. The page owns the mutation.
  onAction: (status: RecommendationStatus) => void
  // True while THIS card's action is in flight (page computes it per card).
  pending: boolean
  // Optional soft background tint, cycled by the page (the specials row in the
  // mockup alternates warm tints). Index into TINTS; omit for no tint.
  tone?: number
}

const money = (value: number): string => `$${value.toFixed(2)}`

// One AI menu recommendation (T-8B). Presentational: it renders the server-
// computed fields as-is (ADR 0004) and reports actions up via `onAction`. The
// available actions depend on (status, kind) per ADR 0014 — a NEW dish can be
// accepted (creates a menu item), an EXISTING one cannot (it's already on the
// menu; the server 409s), and an already-ACCEPTED card is shown non-actionable.
function RecommendationCard({ recommendation, onAction, pending, tone }: RecommendationCardProps) {
  const [recipeOpen, setRecipeOpen] = useState(false)

  const {
    name,
    explanation,
    source,
    kind,
    status,
    isAvailable,
    limitingIngredientId,
    ingredientsUsed,
    usesExpiringItems,
    foodCost,
    suggestedPrice,
    margin,
  } = recommendation

  // The limiting ingredient is one of the dish's own ingredients — resolve its
  // name locally from the snapshot (display lookup, not a recompute).
  const limitingName =
    limitingIngredientId === null
      ? null
      : (ingredientsUsed.find((line) => line.inventoryItemId === limitingIngredientId)?.name ??
        null)

  const isAccepted = status === 'ACCEPTED'
  const canAccept = status === 'PROPOSED' && kind === 'NEW'
  const canDismissOrSave = status === 'PROPOSED'
  // A saved rec can be un-saved — back to PROPOSED (the active queue + off the
  // dashboard preview). The contract allows the PROPOSED transition.
  const canUnsave = status === 'SAVED'
  const bgcolor = tone === undefined ? undefined : CARD_TINTS[tone % CARD_TINTS.length]

  return (
    <Card component="article" aria-label={name} variant="outlined" sx={{ height: '100%', bgcolor }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Typography variant="h6" component="h3">
            {name}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Chip
              size="small"
              label={kind === 'NEW' ? 'New dish idea' : 'On your menu'}
              color={kind === 'NEW' ? 'primary' : 'default'}
              variant="outlined"
            />
            {source === 'FALLBACK' ? (
              <Chip size="small" label="Fallback" color="warning" variant="outlined" />
            ) : null}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            size="small"
            label={isAvailable ? 'Available' : 'Unavailable'}
            color={isAvailable ? 'success' : 'default'}
          />
          {usesExpiringItems ? (
            <Chip size="small" label="Uses expiring items" color="warning" />
          ) : null}
        </Stack>
        {!isAvailable && limitingName ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Limited by {limitingName}
          </Typography>
        ) : null}

        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {explanation}
        </Typography>

        {/* Lead with the suggested price + margin (mockup); food cost is secondary. */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1.5, alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography variant="h5" component="p">
            {money(suggestedPrice)}
          </Typography>
          <Chip
            size="small"
            variant="outlined"
            color="success"
            label={`${Math.round(margin * 100)}% margin`}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" component="p">
          Food cost {money(foodCost)}
        </Typography>

        <Button
          size="small"
          onClick={() => setRecipeOpen((open) => !open)}
          aria-expanded={recipeOpen}
          sx={{ mt: 1, px: 0 }}
        >
          {recipeOpen ? 'Hide recipe' : 'View recipe'}
        </Button>
        <Collapse in={recipeOpen} unmountOnExit>
          <Divider sx={{ mb: 1 }} />
          <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
            {ingredientsUsed.map((line) => (
              <Typography key={line.id} component="li" variant="body2">
                {line.name} — {line.quantity} {line.unit}
              </Typography>
            ))}
          </Stack>
        </Collapse>
      </CardContent>

      <CardActions>
        {isAccepted ? (
          <Chip size="small" color="success" variant="outlined" label="Accepted" />
        ) : (
          <>
            {canAccept ? (
              <Button
                size="small"
                variant="contained"
                disabled={pending}
                onClick={() => onAction('ACCEPTED')}
              >
                Accept
              </Button>
            ) : null}
            {canDismissOrSave ? (
              <>
                <Button size="small" disabled={pending} onClick={() => onAction('DISMISSED')}>
                  Dismiss
                </Button>
                <Button size="small" disabled={pending} onClick={() => onAction('SAVED')}>
                  Save
                </Button>
              </>
            ) : null}
            {canUnsave ? (
              <>
                <Button size="small" disabled={pending} onClick={() => onAction('DISMISSED')}>
                  Dismiss
                </Button>
                <Button size="small" disabled={pending} onClick={() => onAction('PROPOSED')}>
                  Unsave
                </Button>
              </>
            ) : null}
          </>
        )}
      </CardActions>
    </Card>
  )
}

export default RecommendationCard
