import { useRef } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import type { MenuItem } from '@umgccapstone/contracts'
import { useMenuItems } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from './states'

function initials(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

// Status for a special, from server-computed availability (ADR 0004). The
// "uses expiring stock" badge waits on `usesExpiringItems` on the MenuItem DTO
// (backend #66) and is intentionally omitted until then.
function dishStatus(item: MenuItem): { label: string; bg: string; color: string } {
  if (item.isAvailable) return { label: 'Ready to make', bg: 'var(--sage-soft)', color: 'var(--sage)' }
  const limiting = item.ingredients.find((l) => l.inventoryItemId === item.limitingIngredientId)?.name
  return {
    label: limiting ? `Limited by ${limiting}` : 'Low stock',
    bg: 'var(--amber-soft)',
    color: '#7c5a12',
  }
}

// Dashboard "Tonight's Specials" carousel. A horizontal strip of the dishes the
// chef has flagged as specials (MenuItem.isSpecial, set from the Menu Builder
// kebab). Server-computed availability drives the per-dish status.
export default function SpecialsCarousel() {
  const { data, isPending, isError, refetch } = useMenuItems()
  const trackRef = useRef<HTMLDivElement>(null)

  const specials = (data ?? []).filter((d) => d.status === 'ACTIVE' && d.isSpecial)

  const scrollBy = (direction: number) =>
    trackRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })

  return (
    <Box component="section" aria-label="Tonight's specials" sx={{ mt: 4 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, gap: 2 }}
      >
        <Box>
          <Typography component="h2" sx={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22 }}>
            Tonight's Specials
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
            Dishes you're featuring, with what you can plate right now.
          </Typography>
        </Box>
        {specials.length > 0 ? (
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="Previous specials" onClick={() => scrollBy(-1)} size="small"
              sx={{ border: '1px solid var(--hairline)' }}>
              <Box component="span" aria-hidden sx={{ fontSize: 18, lineHeight: 1 }}>←</Box>
            </IconButton>
            <IconButton aria-label="Next specials" onClick={() => scrollBy(1)} size="small"
              sx={{ border: '1px solid var(--hairline)' }}>
              <Box component="span" aria-hidden sx={{ fontSize: 18, lineHeight: 1 }}>→</Box>
            </IconButton>
          </Stack>
        ) : null}
      </Stack>

      {isPending ? (
        <LoadingState label="Loading specials…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load specials"
          description="Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : specials.length === 0 ? (
        <EmptyState
          title="No specials yet"
          description="Mark a dish as a special from the Menu Builder (the ⋮ menu) to feature it here."
        />
      ) : (
        <Box
          ref={trackRef}
          tabIndex={0}
          aria-label="Specials, scrollable"
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 1,
            scrollSnapType: 'x proximity',
            '&:focus-visible': { outline: '2px solid var(--terra)', outlineOffset: 3 },
          }}
        >
          {specials.map((item) => {
            const status = dishStatus(item)
            return (
              <Box
                key={item.id}
                sx={{
                  flex: '0 0 260px',
                  scrollSnapAlign: 'start',
                  border: '1px solid var(--hairline)',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 'var(--shadow)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: 72,
                    bgcolor: 'var(--surface-2)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'text.secondary', letterSpacing: '0.04em' }}>
                    {initials(item.name)}
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }} noWrap>
                    {item.ingredients.map((l) => l.name).join(' · ') || 'No ingredients listed'}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      mt: 1,
                      fontSize: 11.5,
                      fontWeight: 600,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: 999,
                      bgcolor: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
