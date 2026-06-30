import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { MenuItem } from '@umgccapstone/contracts'

type MenuItemCardProps = {
  item: MenuItem
}

const money = (value: number): string => `$${value.toFixed(2)}`

// One dish on the regular menu (T-8). Presentational, read-only — the regular
// menu has no actions (unlike recommendation cards). Renders server-computed
// fields as-is (ADR 0004): availability + pricing (pricing added to MenuItem in
// contract 0.8.0). Ingredients are shown as a one-line subtitle.
function MenuItemCard({ item }: MenuItemCardProps) {
  const { name, ingredients, isAvailable, limitingIngredientId, foodCost, suggestedPrice, margin } =
    item

  const ingredientList = ingredients.map((line) => line.name).join(' · ')
  const limitingName =
    limitingIngredientId === null
      ? null
      : (ingredients.find((line) => line.inventoryItemId === limitingIngredientId)?.name ?? null)

  return (
    <Card component="article" aria-label={name} variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h3">
          {name}
        </Typography>
        {ingredientList ? (
          <Typography variant="body2" color="text.secondary">
            {ingredientList}
          </Typography>
        ) : null}

        <Box sx={{ mt: 1 }}>
          <Chip
            size="small"
            label={isAvailable ? 'Available' : 'Unavailable'}
            color={isAvailable ? 'success' : 'default'}
          />
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
