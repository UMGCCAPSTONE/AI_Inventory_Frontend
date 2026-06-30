import { useState } from 'react'
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { RecommendationStatus } from '@umgccapstone/contracts'
import { EmptyState, ErrorState, LoadingState } from './states'
import FadedChip, { type FadedColor } from './FadedChip'
import { useRecommendations } from '../hooks'

// Past recommendations the chef has acted on (US-REP-3). PROPOSED items are still
// pending in the Menu Builder's active list, so history shows only ACTIONED
// statuses (accepted / dismissed / saved).
const ACTIONED: readonly RecommendationStatus[] = ['ACCEPTED', 'SAVED', 'DISMISSED']
const ACTIONED_SET: ReadonlySet<RecommendationStatus> = new Set(ACTIONED)

const PAGE_SIZE = 10

type SortKey = 'newest' | 'oldest' | 'status' | 'name'

const STATUS_LABELS: Record<RecommendationStatus, string> = {
  PROPOSED: 'Proposed',
  ACCEPTED: 'Accepted',
  DISMISSED: 'Dismissed',
  SAVED: 'Saved',
}

const STATUS_COLORS: Record<RecommendationStatus, FadedColor> = {
  PROPOSED: 'default',
  ACCEPTED: 'success',
  DISMISSED: 'default',
  SAVED: 'info',
}

// Display/sort order for the "Status" sort: actioned-positively first.
const STATUS_RANK: Record<RecommendationStatus, number> = {
  ACCEPTED: 0,
  SAVED: 1,
  DISMISSED: 2,
  PROPOSED: 3,
}

function compare(
  sort: SortKey,
  a: { createdAt: string; name: string; status: RecommendationStatus },
  b: typeof a,
) {
  switch (sort) {
    case 'oldest':
      return a.createdAt.localeCompare(b.createdAt)
    case 'name':
      return a.name.localeCompare(b.name)
    case 'status':
      return STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.createdAt.localeCompare(a.createdAt)
    case 'newest':
    default:
      return b.createdAt.localeCompare(a.createdAt)
  }
}

// T-10C — Recommendation history. Reads GET /api/recommendations (server-computed;
// ADR 0004). Searchable by dish name, filterable by status chips, sortable, and
// paged at PAGE_SIZE rows. Refreshes automatically after a recommendation
// generate/status write — both invalidate queryKeys.recommendations.list.
function RecommendationHistoryList() {
  const { data, isPending, isError, refetch } = useRecommendations()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortKey>('newest')
  const [search, setSearch] = useState('')
  const [activeStatuses, setActiveStatuses] = useState<RecommendationStatus[]>([])

  if (isPending) return <LoadingState label="Loading recommendation history…" />
  if (isError)
    return (
      <ErrorState
        title="Couldn't load recommendation history"
        description="Check your connection and try again."
        onRetry={() => refetch()}
      />
    )

  const history = (data ?? []).filter((rec) => ACTIONED_SET.has(rec.status))
  if (history.length === 0)
    return (
      <EmptyState
        title="No recommendation history yet"
        description="Accepted, saved, and dismissed recommendations will appear here."
      />
    )

  const toggleStatus = (status: RecommendationStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
    setPage(1)
  }

  const query = search.trim().toLowerCase()
  const filtered = history.filter(
    (rec) =>
      (activeStatuses.length === 0 || activeStatuses.includes(rec.status)) &&
      (query === '' || rec.name.toLowerCase().includes(query)),
  )
  const sorted = [...filtered].sort((a, b) => compare(sort, a, b))

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(pageCount, 1))
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          sx={{ flex: 1, minWidth: 160 }}
        />
        <TextField
          select
          size="small"
          label="Sort"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as SortKey)
            setPage(1)
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="newest">Newest first</MenuItem>
          <MenuItem value="oldest">Oldest first</MenuItem>
          <MenuItem value="status">Status</MenuItem>
          <MenuItem value="name">Name (A–Z)</MenuItem>
        </TextField>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}>
        {ACTIONED.map((status) => {
          const active = activeStatuses.includes(status)
          return (
            <Chip
              key={status}
              label={STATUS_LABELS[status]}
              size="small"
              color={active ? STATUS_COLORS[status] : 'default'}
              variant={active ? 'filled' : 'outlined'}
              onClick={() => toggleStatus(status)}
            />
          )
        })}
      </Stack>

      {sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No recommendations match your filters.
        </Typography>
      ) : (
        <>
          <List disablePadding aria-label="Recommendation history">
            {pageItems.map((rec) => (
              <ListItem
                key={rec.id}
                disableGutters
                sx={{
                  display: 'flex',
                  gap: 1,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={rec.name}
                  secondary={`${new Date(rec.createdAt).toLocaleDateString()} · ${rec.source === 'AI' ? 'AI' : 'Fallback'}`}
                  sx={{ flex: 1, m: 0 }}
                />
                <FadedChip label={STATUS_LABELS[rec.status]} color={STATUS_COLORS[rec.status]} />
              </ListItem>
            ))}
          </List>

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
              <Pagination
                count={pageCount}
                page={safePage}
                onChange={(_, value) => setPage(value)}
                size="small"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default RecommendationHistoryList
