import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import type { MenuCategory, MenuItem, RecommendationStatus } from '@umgccapstone/contracts'
import type { RecommendationScope } from '../services'
import { MENU_CATEGORIES, MENU_CATEGORY_LABELS } from '../utils/menuCategories'
import {
  useAllInventory,
  useArchiveMenuItem,
  useGenerateRecommendations,
  useMenuItems,
  useRecommendations,
  useUpdateMenuItem,
  useUpdateRecommendationStatus,
} from '../hooks'
import RecommendationCard from '../components/RecommendationCard'
import MenuItemCard from '../components/MenuItemCard'
import MenuItemFormModal from '../components/MenuItemFormModal'
import { EmptyState, ErrorState, LoadingState } from '../components/states'

// Which recommendation statuses each filter view shows.
type RecFilter = 'active' | 'saved' | 'dismissed'
const REC_FILTERS: { key: RecFilter; label: string; statuses: RecommendationStatus[] }[] = [
  // Active = the AI-generated queue: PROPOSED only. Accepting a dish creates a
  // menu item, so it drops out of this list (it stays on the Current menu and in
  // recommendation history). Pairs with backend global dedup (#66) so Generate
  // won't re-suggest an already-accepted dish.
  { key: 'active', label: 'Active', statuses: ['PROPOSED'] },
  { key: 'saved', label: 'Saved', statuses: ['SAVED'] },
  { key: 'dismissed', label: 'Dismissed', statuses: ['DISMISSED'] },
]

const cardGrid = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
} as const

// Section heading style — Fraunces display, matching the redesign mockups.
const sectionTitleSx = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26 } as const

// Current menu groups dishes by category, each capped (soft cap) with a per-group
// "See all" toggle; newest dishes first within a category.
const MENU_CAP = 6

// Initial specials filter from the URL (?tab=saved|dismissed), so the dashboard
// preview's "Build" / "View all" links open the Saved tab directly.
function initialRecFilter(): RecFilter {
  const tab = new URLSearchParams(window.location.search).get('tab')
  return tab === 'saved' || tab === 'dismissed' ? tab : 'active'
}

// Menu Builder (T-8). AI-generated recommendations (specials) you generate then
// accept/dismiss/save, plus the current (regular) menu. Every section renders the
// four required UI states (ADR 0005); server-computed fields are shown as-is (ADR
// 0004). Saved/history recommendations are reachable via the filter.
function MenuBuilderPage() {
  const [recFilter, setRecFilter] = useState<RecFilter>(initialRecFilter)
  const [addDishOpen, setAddDishOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<MenuItem | null>(null)
  const [menuSearch, setMenuSearch] = useState('')
  // Selected category chips (empty = show all); categories expanded past the cap.
  const [selectedCats, setSelectedCats] = useState<Set<MenuCategory>>(new Set())
  const [expandedCats, setExpandedCats] = useState<Set<MenuCategory>>(new Set())
  // Which inventory the generator draws from (#66): at-risk stock or everything.
  const [scope, setScope] = useState<RecommendationScope>('at-risk')

  const generate = useGenerateRecommendations()
  const recommendations = useRecommendations()
  const statusMutation = useUpdateRecommendationStatus()
  const menuItems = useMenuItems()
  const inventory = useAllInventory()
  const archiveMenuItem = useArchiveMenuItem()
  const updateMenuItem = useUpdateMenuItem()

  function confirmRemove() {
    if (!removeTarget) return
    archiveMenuItem.mutate(removeTarget.id, {
      onSuccess: () => setRemoveTarget(null),
    })
  }

  function toggleInSet<T>(setState: Dispatch<SetStateAction<Set<T>>>, value: T) {
    setState((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const allRecs = recommendations.data ?? []
  const activeMenu = (menuItems.data ?? []).filter((item) => item.status === 'ACTIVE')
  const menuQuery = menuSearch.trim().toLowerCase()
  const searchedMenu = menuQuery
    ? activeMenu.filter((item) => item.name.toLowerCase().includes(menuQuery))
    : activeMenu
  // Category chip counts come from the full menu (stable, not search-narrowed).
  const countByCategory = new Map<MenuCategory, number>()
  for (const item of activeMenu) {
    countByCategory.set(item.category, (countByCategory.get(item.category) ?? 0) + 1)
  }
  const presentCategories = MENU_CATEGORIES.filter((c) => countByCategory.has(c))
  const categoriesToShow = selectedCats.size
    ? presentCategories.filter((c) => selectedCats.has(c))
    : presentCategories
  // Grouped dishes (newest-first within a category); drop empty groups (e.g. under search).
  const menuGroups = categoriesToShow
    .map((category) => ({
      category,
      dishes: searchedMenu
        .filter((d) => d.category === category)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }))
    .filter((g) => g.dishes.length > 0)
  // Subtitle count: the AI-generated queue (PROPOSED). Accepted dishes are now
  // menu items and are counted as such, not double-counted as specials.
  const specialsCount = allRecs.filter((r) => r.status === 'PROPOSED').length

  const filterStatuses = REC_FILTERS.find((f) => f.key === recFilter)!.statuses
  const visibleRecs = allRecs.filter((r) => filterStatuses.includes(r.status))

  const generateButton = (
    <Button
      variant="contained"
      onClick={() => generate.mutate(scope)}
      disabled={generate.isPending}
      startIcon={generate.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
    >
      {generate.isPending ? 'Generating…' : 'Generate recommendations'}
    </Button>
  )

  const scopeToggle = (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={scope}
      onChange={(_, next: RecommendationScope | null) => {
        if (next) setScope(next)
      }}
      aria-label="Generate from"
    >
      <ToggleButton value="at-risk">At-risk stock</ToggleButton>
      <ToggleButton value="full">Full inventory</ToggleButton>
    </ToggleButtonGroup>
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
      sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Box>
          <Typography variant="h3" component="h1">
            Menu Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeMenu.length} menu {activeMenu.length === 1 ? 'item' : 'items'} ·{' '}
            {specialsCount} AI-suggested {specialsCount === 1 ? 'special' : 'specials'}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
        >
          {scopeToggle}
          {generateButton}
          <Button variant="outlined" onClick={() => setAddDishOpen(true)}>
            + Add Dish
          </Button>
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
        <Typography component="h2" sx={sectionTitleSx}>
          AI Suggested Specials
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Top picks based on expiring inventory
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
        <Typography component="h2" sx={{ ...sectionTitleSx }}>
          Current menu
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Grouped by category — choose categories to filter; up to {MENU_CAP} dishes shown per group.
        </Typography>
        {menuItems.isPending ? (
          <LoadingState label="Loading menu…" />
        ) : menuItems.isError ? (
          <ErrorState description="Couldn't load the menu." onRetry={() => void menuItems.refetch()} />
        ) : activeMenu.length === 0 ? (
          <EmptyState
            title="No menu items yet"
            description="Accepted recommendations appear here. Add a dish or accept an AI special to get started."
          />
        ) : (
          <>
            <TextField
              placeholder="Search dishes…"
              size="small"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              slotProps={{ htmlInput: { 'aria-label': 'Search dishes' } }}
              sx={{ mt: 2, mb: 2, maxWidth: 380, display: 'block' }}
            />
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
              aria-label="Category filters"
            >
              {presentCategories.map((c) => {
                const selected = selectedCats.has(c)
                return (
                  <Chip
                    key={c}
                    label={`${MENU_CATEGORY_LABELS[c]} ${countByCategory.get(c)}`}
                    onClick={() => toggleInSet(setSelectedCats, c)}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                  />
                )
              })}
              {selectedCats.size ? (
                <Chip label="Clear" variant="outlined" onClick={() => setSelectedCats(new Set())} />
              ) : null}
            </Stack>

            {menuGroups.length === 0 ? (
              <EmptyState
                title="No dishes match your search"
                description="Try a different name or clear the search."
              />
            ) : (
              <Stack spacing={4}>
                {menuGroups.map(({ category, dishes }) => {
                  const expanded = expandedCats.has(category)
                  const shown = expanded ? dishes : dishes.slice(0, MENU_CAP)
                  return (
                    <Box key={category} component="section" aria-label={MENU_CATEGORY_LABELS[category]}>
                      <Typography component="h3" sx={{ fontWeight: 600, fontSize: 18, mb: 1.5 }}>
                        {MENU_CATEGORY_LABELS[category]}{' '}
                        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                          · {dishes.length}
                        </Box>
                      </Typography>
                      <Box sx={cardGrid}>
                        {shown.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            onRemove={() => setRemoveTarget(item)}
                            onToggleSpecial={() =>
                              updateMenuItem.mutate({
                                id: item.id,
                                input: { isSpecial: !item.isSpecial },
                              })
                            }
                            busy={
                              (archiveMenuItem.isPending && archiveMenuItem.variables === item.id) ||
                              (updateMenuItem.isPending && updateMenuItem.variables?.id === item.id)
                            }
                          />
                        ))}
                      </Box>
                      {dishes.length > MENU_CAP ? (
                        <Box sx={{ mt: 1.5 }}>
                          <Button onClick={() => toggleInSet(setExpandedCats, category)}>
                            {expanded ? 'See less' : `See all ${dishes.length}`}
                          </Button>
                        </Box>
                      ) : null}
                    </Box>
                  )
                })}
              </Stack>
            )}
          </>
        )}
      </Box>

      <MenuItemFormModal
        open={addDishOpen}
        onClose={() => setAddDishOpen(false)}
        inventoryItems={inventory.data ?? []}
      />

      {/* Delete (soft-archive) confirmation. Archive is reversible, so a simple
          confirm is enough — no type-to-confirm (unlike inventory delete). */}
      <Dialog
        open={removeTarget !== null}
        onClose={() => (archiveMenuItem.isPending ? undefined : setRemoveTarget(null))}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete dish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove <strong>{removeTarget?.name}</strong> from the Current menu? It will be archived
            and can be brought back later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)} disabled={archiveMenuItem.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmRemove}
            disabled={archiveMenuItem.isPending}
          >
            {archiveMenuItem.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MenuBuilderPage
