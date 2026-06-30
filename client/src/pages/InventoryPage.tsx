import { useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import type { InventoryItem } from '@umgccapstone/contracts'
import { useDashboardSummary, useSuppliers } from '../hooks'
import { fetchAllInventory } from '../services'
import { buildInventoryCsv, downloadCsv, inventoryCsvFilename } from '../utils/inventoryCsv'
import StatCard from '../components/StatCard'
import StatCardSkeleton from '../components/StatCardSkeleton'
import InventoryDataGrid from '../components/InventoryDataGrid'
import InventoryFormModal from '../components/InventoryFormModal'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import { useToast } from '../components/Toaster'
import { ErrorState } from '../components/states'

type ModalState = { mode: 'add' } | { mode: 'edit'; item: InventoryItem } | null

const METRIC_CARD_COUNT = 4

// T-7A — Inventory page: KPI cards from GET /api/dashboard/summary + the T-7B
// data grid. Cards render the server summary (ADR 0004), never recomputed.
// Cards = the four the 0.3.0+ contract backs (no "SKU count"; "<48h" → T-12U).

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Honest relative time from the server's `lastUpdatedAt` (null when no items).
function lastUpdatedLabel(iso: string | null): string | null {
  if (!iso) return null
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString()
}

function InventoryPage() {
  const { data: summary, isPending, isError, refetch } = useDashboardSummary()
  const { data: suppliers } = useSuppliers()
  const toast = useToast()

  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // T-7S — CSV export. Pulls the full inventory (paged behind the scenes), not
  // just the grid's current page, then builds + downloads the file. Suppliers are
  // already cached by useSuppliers above and reused to resolve names/cadence.
  async function handleExport() {
    setIsExporting(true)
    try {
      const items = await fetchAllInventory()
      downloadCsv(inventoryCsvFilename(), buildInventoryCsv(items, suppliers ?? []))
      toast.success(
        items.length > 0
          ? `Exported ${items.length} item${items.length === 1 ? '' : 's'} to CSV.`
          : 'No inventory items to export yet — add items to populate the file.',
      )
    } catch {
      toast.error('Could not export inventory. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const updated = summary ? lastUpdatedLabel(summary.lastUpdatedAt) : null
  const subline = summary
    ? `${summary.totalItems} items tracked${updated ? ` · Updated ${updated}` : ''}`
    : 'Loading inventory…'

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" component="h1">
            Inventory items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subline}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button variant="contained" onClick={() => setModal({ mode: 'add' })}>
            + Add Item
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }} aria-label="Inventory metrics">
        {isPending ? (
          <Box role="status" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box component="span" sx={visuallyHidden}>
              Loading metrics…
            </Box>
            {Array.from({ length: METRIC_CARD_COUNT }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </Box>
        ) : isError ? (
          <ErrorState
            title="Couldn't load metrics"
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <StatCard label="Total items" value={String(summary.totalItems)} />
            <StatCard
              label="Expiring soon"
              value={String(summary.expiringSoonCount)}
              tone="warning"
              helper="within 7 days"
            />
            <StatCard label="At-risk value" value={money.format(summary.atRiskValue)} tone="danger" />
            <StatCard label="Below par" value={String(summary.lowStockCount)} tone="warning" />
          </Box>
        )}
      </Box>

      <InventoryDataGrid
        onEdit={(item) => setModal({ mode: 'edit', item })}
        onDelete={(item) => setDeleteTarget(item)}
      />

      {modal?.mode === 'add' ? (
        <InventoryFormModal
          open
          mode="add"
          suppliers={suppliers ?? []}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal?.mode === 'edit' ? (
        <InventoryFormModal
          open
          mode="edit"
          item={modal.item}
          suppliers={suppliers ?? []}
          onClose={() => setModal(null)}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}

export default InventoryPage
