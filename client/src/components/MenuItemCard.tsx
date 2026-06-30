import { useState } from 'react'
import { Box, Card, CardContent, Chip, IconButton, Menu, MenuItem as MuiMenuItem, Stack, Typography } from '@mui/material'
import type { MenuItem } from '@umgccapstone/contracts'

type MenuItemCardProps = {
  item: MenuItem
  // When provided, the kebab (⋮) menu exposes a Delete action (T-72). The parent
  // owns the confirm dialog + archive mutation; this stays presentational.
  onRemove?: () => void
  // When provided, the kebab toggles the dish's Special status. The parent owns
  // the update mutation; the label reflects the current `item.isSpecial`.
  onToggleSpecial?: () => void
  // True while a mutation for this item is in flight — disables the kebab.
  busy?: boolean
}

const money = (value: number): string => `$${value.toFixed(2)}`

// One dish on the regular menu (T-8). Presentational — server-computed fields are
// rendered as-is (ADR 0004): availability + pricing (added to MenuItem in contract
// 0.8.0). A kebab (⋮) menu (T-72) exposes per-dish actions: make/remove special
// and delete (soft-archive); parents wire the callbacks.
function MenuItemCard({ item, onRemove, onToggleSpecial, busy = false }: MenuItemCardProps) {
  const {
    name,
    ingredients,
    isAvailable,
    isSpecial,
    limitingIngredientId,
    foodCost,
    suggestedPrice,
    margin,
  } = item
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = anchorEl !== null
  const hasActions = Boolean(onRemove || onToggleSpecial)

  const ingredientList = ingredients.map((line) => line.name).join(' · ')
  const limitingName =
    limitingIngredientId === null
      ? null
      : (ingredients.find((line) => line.inventoryItemId === limitingIngredientId)?.name ?? null)

  const closeMenu = () => setAnchorEl(null)
  const runAction = (action: () => void) => {
    closeMenu()
    action()
  }

  return (
    <Card component="article" aria-label={name} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h3">
            {name}
          </Typography>
          {hasActions ? (
            <>
              <IconButton
                size="small"
                aria-label={`Actions for ${name}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                disabled={busy}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ mt: -0.5, mr: -0.5 }}
              >
                <Box component="span" aria-hidden sx={{ fontSize: 22, lineHeight: 1 }}>
                  ⋮
                </Box>
              </IconButton>
              <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu}>
                {onToggleSpecial ? (
                  <MuiMenuItem onClick={() => runAction(onToggleSpecial)}>
                    {isSpecial ? 'Remove from specials' : 'Make special'}
                  </MuiMenuItem>
                ) : null}
                {onRemove ? (
                  <MuiMenuItem onClick={() => runAction(onRemove)} sx={{ color: 'error.main' }}>
                    Delete
                  </MuiMenuItem>
                ) : null}
              </Menu>
            </>
          ) : null}
        </Stack>
        {ingredientList ? (
          <Typography variant="body2" color="text.secondary">
            {ingredientList}
          </Typography>
        ) : null}

        <Box sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              size="small"
              label={isAvailable ? 'Available' : 'Unavailable'}
              color={isAvailable ? 'success' : 'default'}
            />
            {isSpecial ? <Chip size="small" color="warning" label="Special" /> : null}
          </Stack>
          {!isAvailable && limitingName ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Limited by {limitingName}
            </Typography>
          ) : null}
        </Box>

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
      </CardContent>
    </Card>
  )
}

export default MenuItemCard
