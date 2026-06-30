import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useRecommendationPreviews, useRecommendationAvailability } from '../hooks'
import type { RecommendationAvailability } from '../types'
import { EmptyState, ErrorState, LoadingState } from './states'

// Dashboard "AI Recommendations" panel (T-6C). Shows the saved-recommendation
// preview (SAVED-only, ADR 0008) restyled to the redesign (docs/mockups/). Each
// card links into the Menu Builder to build the dish.
export default function RecommendationPreviewSection() {
  const navigate = useNavigate()
  const content = useRecommendationPreviews()
  const availability = useRecommendationAvailability()

  const previews = content.data ?? []
  const availabilityById = new Map<string, RecommendationAvailability>(
    (availability.data ?? []).map((a) => [a.id, a]),
  )

  return (
    <Paper
      component="section"
      variant="outlined"
      aria-label="AI recommendation preview"
      sx={{ p: 3, boxShadow: 'var(--shadow)', height: '100%' }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 2 }}>
        <Typography component="h2" sx={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22 }}>
          AI Recommendations
        </Typography>
        {!content.isPending && !content.isError && previews.length > 0 ? (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {previews.length} saved
          </Typography>
        ) : null}
      </Stack>

      {content.isPending ? (
        <LoadingState label="Loading recommendations…" />
      ) : content.isError ? (
        <ErrorState
          title="Couldn't load recommendations"
          description="Check your connection and try again."
          onRetry={() => void content.refetch()}
        />
      ) : previews.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="Saved AI specials appear here once you save them from the Menu Builder."
        />
      ) : (
        <Stack spacing={1.5}>
          {previews.slice(0, 3).map((rec) => {
            const avail = availabilityById.get(rec.id)
            return (
              <Box
                key={rec.id}
                sx={{
                  border: '1px solid var(--hairline)',
                  borderRadius: 2,
                  bgcolor: 'var(--surface-2)',
                  p: 2,
                }}
              >
                <Typography component="h3" sx={{ fontWeight: 600, fontSize: 16 }}>
                  {rec.name}
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.5 }}>
                  {rec.summary}
                </Typography>
                {avail != null ? (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Box
                      component="span"
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        px: 1.25,
                        py: 0.4,
                        borderRadius: 999,
                        bgcolor: avail.isAvailable ? 'var(--sage-soft)' : 'var(--amber-soft)',
                        color: avail.isAvailable ? 'var(--sage)' : '#7c5a12',
                      }}
                    >
                      {avail.isAvailable ? 'Available' : 'Not available'}
                    </Box>
                    {!avail.isAvailable && avail.limitingIngredient != null ? (
                      <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                        {avail.limitingIngredient}
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}
                <Button
                  onClick={() => navigate('/menu')}
                  sx={{
                    mt: 1,
                    px: 0,
                    minWidth: 'auto',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'primary.main',
                  }}
                >
                  Build {rec.name} →
                </Button>
              </Box>
            )
          })}
        </Stack>
      )}
    </Paper>
  )
}
