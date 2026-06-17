import { useMemo, useState } from 'react'
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid'
import { Box, Button, Chip, Stack, TextField } from '@mui/material'
import {
  categorySchema,
  type Category,
  type InventoryItem,
  type InventoryListQuery,
  type InventorySort,
  type InventoryStatusFilter,
  type Supplier,
} from '@umgccapstone/contracts'
import { useDebounce, useInventory, useSuppliers } from '../hooks'
import { EmptyState, ErrorState } from './states'

// T-7B — Inventory DataGrid. Renders GET /api/inventory with server-side
// debounced search, category + status filters, sort, and pagination. Low-stock
// and expiring flags come straight from the server-computed DTO (ADR 0004); the
// grid never recomputes them. The "urgent" (<48h) filter is intentionally out
// of scope — see CONTEXT.md / T-12U (#38). T-7A mounts this; T-7C passes `onEdit`.

const CATEGORY_LABELS: Record<Category, string> = {
  PRODUCE: 'Produce',
  MEAT: 'Meat',
  SEAFOOD: 'Seafood',
  DAIRY: 'Dairy',
  DRY_GOODS: 'Dry Goods',
  BEVERAGE: 'Beverage',
  FROZEN: 'Frozen',
  OTHER: 'Other',
}

const STATUS_OPTIONS: { value: InventoryStatusFilter; label: string }[] = [
  { value: 'low_stock', label: 'Low stock' },
  { value: 'expiring_soon', label: 'Expiring soon' },
  { value: 'ok', label: 'OK' },
]

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const MS_PER_DAY = 24 * 60 * 60 * 1000

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / MS_PER_DAY)
}

type InventoryDataGridProps = {
  /** Wired by T-7C to open the edit flow for a row. */
  onEdit?: (item: InventoryItem) => void
}

function InventoryDataGrid({ onEdit }: InventoryDataGridProps) {
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState<Category | undefined>(undefined)
  const [status, setStatus] = useState<InventoryStatusFilter | undefined>(undefined)
  const [sort, setSort] = useState<InventorySort>('name')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const search = useDebounce(searchInput, 300)

  // Changing a filter or sort returns to the first page. Done in the event
  // handlers (not an effect) to avoid a cascading re-render.
  function changeSearch(next: string) {
    setSearchInput(next)
    setPage(1)
  }
  function changeCategory(next: Category | undefined) {
    setCategory(next)
    setPage(1)
  }
  function changeStatus(next: InventoryStatusFilter | undefined) {
    setStatus(next)
    setPage(1)
  }

  const query: InventoryListQuery = useMemo(
    () => ({ search: search || undefined, category, status, sort, order, page, pageSize }),
    [search, category, status, sort, order, page, pageSize],
  )

  const { data, isPending, isError, isFetching, refetch } = useInventory(query)
  const { data: suppliers } = useSuppliers()

  const supplierById = useMemo(() => {
    const map = new Map<string, Supplier>()
    for (const s of suppliers ?? []) map.set(s.id, s)
    return map
  }, [suppliers])

  const columns = useMemo<GridColDef<InventoryItem>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Item',
        flex: 1.5,
        minWidth: 180,
        renderCell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{row.name}</span>
            {row.isLowStock ? <Chip size="small" color="warning" label="Low stock" /> : null}
          </Box>
        ),
      },
      {
        field: 'stock',
        headerName: 'Stock',
        sortable: false,
        minWidth: 110,
        valueGetter: (_value, row) => `${row.quantity} ${row.unit}`,
      },
      {
        field: 'expirationDate',
        headerName: 'Expiry',
        minWidth: 120,
        renderCell: ({ row }) => {
          if (!row.expirationDate) return <Chip size="small" variant="outlined" label="—" />
          if (row.isExpiringSoon) {
            const days = daysUntil(row.expirationDate)
            return (
              <Chip size="small" color="warning" label={days <= 0 ? 'Expired' : `${days}d left`} />
            )
          }
          return <Chip size="small" color="success" variant="outlined" label="Stable" />
        },
      },
      {
        field: 'atRiskValue',
        headerName: 'At-risk',
        sortable: false,
        minWidth: 100,
        valueGetter: (_value, row) => (row.atRiskValue > 0 ? money.format(row.atRiskValue) : '—'),
      },
      {
        field: 'parReorder',
        headerName: 'Par / Reorder',
        sortable: false,
        minWidth: 150,
        valueGetter: (_value, row) => {
          const cadence = row.supplierId ? supplierById.get(row.supplierId)?.deliveryCadence : undefined
          return cadence ? `${row.parLevel} ${row.unit} · ${cadence}` : `${row.parLevel} ${row.unit}`
        },
      },
      {
        field: 'supplier',
        headerName: 'Supplier',
        sortable: false,
        minWidth: 140,
        valueGetter: (_value, row) =>
          (row.supplierId ? supplierById.get(row.supplierId)?.name : undefined) ?? '—',
      },
      {
        field: 'actions',
        headerName: '',
        sortable: false,
        width: 90,
        renderCell: ({ row }) => (
          <Button size="small" variant="outlined" onClick={() => onEdit?.(row)}>
            Edit
          </Button>
        ),
      },
    ],
    [supplierById, onEdit],
  )

  const sortModel: GridSortModel = [{ field: sort, sort: order }]

  function handleSortModelChange(model: GridSortModel) {
    const next = model[0]
    if (next) {
      setSort(next.field as InventorySort)
      setOrder(next.sort ?? 'asc')
    } else {
      setSort('name')
      setOrder('asc')
    }
    setPage(1)
  }

  function handlePaginationModelChange(model: GridPaginationModel) {
    setPage(model.page + 1)
    setPageSize(model.pageSize)
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load inventory"
        description="Check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <Stack spacing={2} aria-label="Inventory">
      <TextField
        label="Search items"
        size="small"
        value={searchInput}
        onChange={(e) => changeSearch(e.target.value)}
        sx={{ maxWidth: 320 }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} aria-label="Category filters">
        <Chip
          label="All"
          color={category === undefined ? 'primary' : 'default'}
          onClick={() => changeCategory(undefined)}
        />
        {categorySchema.options.map((value) => (
          <Chip
            key={value}
            label={CATEGORY_LABELS[value]}
            color={category === value ? 'primary' : 'default'}
            onClick={() => changeCategory(value)}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} aria-label="Status filters">
        <Chip
          label="All statuses"
          variant={status === undefined ? 'filled' : 'outlined'}
          onClick={() => changeStatus(undefined)}
        />
        {STATUS_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            variant={status === option.value ? 'filled' : 'outlined'}
            onClick={() => changeStatus(option.value)}
          />
        ))}
      </Box>

      <Box>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          getRowId={(row) => row.id}
          rowCount={data?.total ?? 0}
          loading={isPending || isFetching}
          autoHeight
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
          paginationMode="server"
          sortingMode="server"
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={handlePaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          pageSizeOptions={[10, 20, 50]}
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                title="No inventory items"
                description="Try clearing the search or filters."
              />
            ),
          }}
        />
      </Box>
    </Stack>
  )
}

export default InventoryDataGrid
