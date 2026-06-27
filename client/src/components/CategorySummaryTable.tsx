import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import type { CategorySummaryRow, Category } from '@umgccapstone/contracts'
import { EmptyState, ErrorState } from './states'
import { useReportCategory } from '../hooks'
import { CATEGORY_LABELS } from '../utils/categories'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const columns: GridColDef<CategorySummaryRow>[] = [
  {
    field: 'category',
    headerName: 'Category',
    flex: 1,
    minWidth: 120,
    valueFormatter: (value: string) => CATEGORY_LABELS[value as Category] ?? value,
  },
  {
    field: 'itemCount',
    headerName: 'Item count',
    type: 'number',
    width: 130,
  },
  {
    field: 'totalValue',
    headerName: 'Total value',
    type: 'number',
    width: 140,
    valueFormatter: (value: number) => money.format(value),
  },
  {
    field: 'lowStockCount',
    headerName: 'Low stock',
    type: 'number',
    width: 120,
  },
]

// T-10B — Category summary table. Reads GET /api/reports/category; all values
// are server-computed (ADR 0004). Refreshes automatically after inventory
// writes via the invalidation map in services/invalidation.ts.
function CategorySummaryTable() {
  const { data, isPending, isError, refetch } = useReportCategory()

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load category report"
        description="Check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!isPending && data?.length === 0) {
    return (
      <EmptyState
        title="No category data yet"
        description="Add inventory items to see a breakdown by category."
      />
    )
  }

  return (
    <Box aria-label="Category summary table">
      <DataGrid
        rows={data ?? []}
        columns={columns}
        getRowId={(row) => row.category}
        loading={isPending}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </Box>
  )
}

export default CategorySummaryTable
