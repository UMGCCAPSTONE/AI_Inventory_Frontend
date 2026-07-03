import { Box, Typography } from '@mui/material'
import { EmptyState, ErrorState, LoadingState } from './states'
import { useMenuItems } from '../hooks'
import { CHART_COLORS } from '../utils/chartColors'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const TOP_N = 5
const BAR_AREA = 150

// T-10S (folded into the T-10C round) — top ACTIVE dishes ranked by server-computed
// suggested price (ADR 0004; the client only sorts/displays). Ranking by margin is
// useless under the fixed 30% food-cost rule (every dish is 70%), so we rank by the
// metric that actually varies. Vertical bar chart: column height is each dish's
// price relative to the priciest, colored from the shared ramp.
function TopDishesByPrice() {
  const { data, isPending, isError, refetch } = useMenuItems()

  if (isPending) return <LoadingState label="Loading dish prices…" />
  if (isError)
    return (
      <ErrorState
        title="Couldn't load dish prices"
        description="Check your connection and try again."
        onRetry={() => refetch()}
      />
    )

  const dishes = (data ?? [])
    .filter((d) => d.status === 'ACTIVE')
    .sort((a, b) => b.suggestedPrice - a.suggestedPrice)
    .slice(0, TOP_N)

  if (dishes.length === 0)
    return (
      <EmptyState title="No dishes yet" description="Add dishes to the menu to see price rankings." />
    )

  const max = Math.max(...dishes.map((d) => d.suggestedPrice), 0.0001)

  return (
    <Box
      aria-label="Top dishes by suggested price"
      sx={{
        width: '100%',
        minWidth: 0,
        height: '100%',
        minHeight: BAR_AREA + 48,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        gap: { xs: 0.5, sm: 1 },
      }}
    >
      {dishes.map((dish, i) => (
        <Box
          key={dish.id}
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 80,
                height: `${(dish.suggestedPrice / max) * 100}%`,
                minHeight: 4,
                bgcolor: CHART_COLORS[i % CHART_COLORS.length],
                borderRadius: '4px 4px 0 0',
              }}
            />
          </Box>
          <Typography
            variant="caption"
            noWrap
            title={dish.name}
            sx={{ mt: 0.75, maxWidth: '100%', textAlign: 'center' }}
          >
            {dish.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {money.format(dish.suggestedPrice)}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default TopDishesByPrice
