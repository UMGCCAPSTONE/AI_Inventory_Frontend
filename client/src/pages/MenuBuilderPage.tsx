import { useState } from 'react'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import type { RecommendationStatus } from '@umgccapstone/contracts'
import {
  useAllInventory,
  useGenerateRecommendations,
  useMenuItems,
  useRecommendations,
  useUpdateRecommendationStatus,
} from '../hooks'
import RecommendationCard from '../components/RecommendationCard'
import MenuItemCard from '../components/MenuItemCard'
import MenuItemFormModal from '../components/MenuItemFormModal'
import { EmptyState, ErrorState, LoadingState } from '../components/states'

// Which recommendation statuses each filter view shows.
type RecFilter = 'active' | 'saved' | 'dismissed'
const REC_FILTERS: { key: RecFilter; label: string; statuses: RecommendationStatus[] }[] = [
  // Active = the working list: pending + just-accepted (accepted stays, marked).
  { key: 'active', label: 'Active', statuses: ['PROPOSED', 'ACCEPTED'] },
  { key: 'saved', label: 'Saved', statuses: ['SAVED'] },
  { key: 'dismissed', label: 'Dismissed', statuses: ['DISMISSED'] },
]

const cardGrid = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
} as const

// Menu Builder (T-8). AI-generated recommendations (specials) you generate then
// accept/dismiss/save, plus the current (regular) menu. Every section renders the
// four required UI states (ADR 0005); server-computed fields are shown as-is (ADR
// 0004). Saved/history recommendations are reachable via the filter.
function MenuBuilderPage() {
  const [recFilter, setRecFilter] = useState<RecFilter>('active')
  const [addDishOpen, setAddDishOpen] = useState(false)

  const generate = useGenerateRecommendations()
  const recommendations = useRecommendations()
  const statusMutation = useUpdateRecommendationStatus()
  const menuItems = useMenuItems()
  const inventory = useAllInventory()

  const allRecs = recommendations.data ?? []
  const activeMenu = (menuItems.data ?? []).filter((item) => item.status === 'ACTIVE')
  // Subtitle counts.
  const specialsCount = allRecs.filter(
    (r) => r.status === 'PROPOSED' || r.status === 'ACCEPTED',
  ).length

  const filterStatuses = REC_FILTERS.find((f) => f.key === recFilter)!.statuses
  const visibleRecs = allRecs.filter((r) => filterStatuses.includes(r.status))

  const generateButton = (
    <Button
      variant="contained"
      onClick={() => generate.mutate()}
      disabled={generate.isPending}
      startIcon={generate.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
    >
      {generate.isPending ? 'Generating…' : 'Generate recommendations'}
    </Button>
  )

  const emptyCopy: Record<RecFilter, { title: string; description: string }> = {
    active: {
      title: 'No recommendations yet',
      description: 'Generate AI specials from your at-risk stock to reduce waste.',
    },
    saved: { title: 'No saved specials', description: 'Save a recommendation to keep it here.' },
    dismissed: { title: 'No dismissed recommendations', description: 'Dismissed specials show here.' },
  }

  return (
    <Box
      component="section"
      aria-label="Menu Builder"
      sx={{ maxWidth: 1390, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Menu Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeMenu.length} menu {activeMenu.length === 1 ? 'item' : 'items'} ·{' '}
            {specialsCount} AI-suggested {specialsCount === 1 ? 'special' : 'specials'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => setAddDishOpen(true)}>
            + Add Dish
          </Button>
          {generateButton}
        </Stack>
      </Stack>

      {generate.isError ? (
        <Box sx={{ mt: 2 }}>
          <ErrorState
            description="Couldn't generate recommendations. Please try again."
            onRetry={() => generate.mutate()}
          />
        </Box>
      ) : null}

      <Box component="section" aria-label="AI recommendations" sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2">
          AI Suggested Specials
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Based on expiring inventory
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {REC_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              onClick={() => setRecFilter(f.key)}
              color={recFilter === f.key ? 'primary' : 'default'}
              variant={recFilter === f.key ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        {recommendations.isPending ? (
          <LoadingState label="Loading recommendations…" />
        ) : recommendations.isError ? (
          <ErrorState
            description="Couldn't load recommendations."
            onRetry={() => void recommendations.refetch()}
          />
        ) : visibleRecs.length === 0 ? (
          <EmptyState
            title={emptyCopy[recFilter].title}
            description={emptyCopy[recFilter].description}
            action={recFilter === 'active' ? generateButton : undefined}
          />
        ) : (
          <Box sx={cardGrid}>
            {visibleRecs.map((rec, index) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                tone={index}
                pending={statusMutation.isPending && statusMutation.variables?.id === rec.id}
                onAction={(status) => statusMutation.mutate({ id: rec.id, status })}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box component="section" aria-label="Current menu" sx={{ mt: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Current menu
        </Typography>
        {menuItems.isPending ? (
          <LoadingState label="Loading menu…" />
        ) : menuItems.isError ? (
          <ErrorState description="Couldn't load the menu." onRetry={() => void menuItems.refetch()} />
        ) : activeMenu.length === 0 ? (
          <EmptyState
            title="No menu items yet"
            description="Accepted recommendations and saved dishes appear here."
          />
        ) : (
          <Box sx={cardGrid}>
            {activeMenu.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </Box>
        )}
      </Box>

      <MenuItemFormModal
        open={addDishOpen}
        onClose={() => setAddDishOpen(false)}
        inventoryItems={inventory.data ?? []}
      />
    </Box>
  )
}

export default MenuBuilderPage
