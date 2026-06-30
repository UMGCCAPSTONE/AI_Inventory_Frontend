import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from '@umgccapstone/contracts'
import { ApiError } from '../types/api'
import { useCreateSupplier, useRecentDeliveries, useSuppliers, useUpdateSupplier } from '../hooks'
import RecentOrdersTable from '../components/RecentOrdersTable'
import SupplierCard from '../components/SupplierCard'
import SupplierDeliveryHistory from '../components/SupplierDeliveryHistory'
import SupplierForm from '../components/SupplierForm'
import SupplierSpendChart from '../components/SupplierSpendChart'
import UpcomingDeliveriesList from '../components/UpcomingDeliveriesList'
import { EmptyState, ErrorState, LoadingState } from '../components/states'

type TabValue = 'all' | 'active' | 'pending'
type Toast = { severity: 'success' | 'error'; message: string }

// Snapshot taken at module-load time so "this week" is stable per page session.
// Avoids calling Date.now() during component render (react-hooks/purity rule).
const MODULE_NOW = Date.now()
const ONE_WEEK_AGO = MODULE_NOW - 7 * 24 * 60 * 60 * 1000

function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}

function SuppliersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [historySupplier, setHistorySupplier] = useState<Supplier | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')

  const {
    data: suppliers = [],
    isPending: suppliersLoading,
    isError: suppliersError,
    refetch: refetchSuppliers,
  } = useSuppliers()

  const {
    data: recentDeliveries = [],
    isPending: deliveriesLoading,
    isError: deliveriesError,
    refetch: refetchDeliveries,
  } = useRecentDeliveries()

  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const submitting = createSupplier.isPending || updateSupplier.isPending

  const deliveriesThisWeek = useMemo(
    () =>
      recentDeliveries.filter((d) => {
        const t = new Date(d.deliveryDate).getTime()
        return t >= ONE_WEEK_AGO && t <= MODULE_NOW
      }).length,
    [recentDeliveries],
  )

  const filteredSuppliers = useMemo(() => {
    let list = suppliers
    if (search.trim()) {
      list = list.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()))
    }
    if (activeTab === 'active') {
      list = list.filter((s) => (s as Supplier & { status?: string }).status === 'ACTIVE')
    } else if (activeTab === 'pending') {
      list = list.filter((s) => (s as Supplier & { status?: string }).status === 'ORDER_DUE')
    }
    return list
  }, [suppliers, search, activeTab])

  function openAdd() {
    setEditing(null)
    setSubmitError(null)
    setFormOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setSubmitError(null)
    setFormOpen(true)
  }

  async function handleSubmit(payload: CreateSupplierInput | UpdateSupplierInput) {
    setSubmitError(null)
    try {
      if (editing) {
        await updateSupplier.mutateAsync({ id: editing.id, input: payload })
        setToast({ severity: 'success', message: 'Supplier updated.' })
      } else {
        await createSupplier.mutateAsync(payload as CreateSupplierInput)
        setToast({ severity: 'success', message: 'Supplier added.' })
      }
      setFormOpen(false)
    } catch (error) {
      // Keep the form open so the user can correct and retry.
      setSubmitError(messageFor(error))
      setToast({ severity: 'error', message: messageFor(error) })
    }
  }

  const statsLabel = suppliersLoading
    ? 'Loading…'
    : [
        `${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''}`,
        deliveriesThisWeek > 0
          ? `${deliveriesThisWeek} deliver${deliveriesThisWeek !== 1 ? 'ies' : 'y'} this week`
          : null,
      ]
        .filter(Boolean)
        .join(' · ')

  return (
    <Box
      component="section"
      aria-label="Suppliers"
      sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4.5 }, py: 4 }}
    >
      {/* Page header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" component="h1">
            Supplier network
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {statsLabel}
          </Typography>
        </Box>
        <Button variant="contained" onClick={openAdd} aria-label="Add supplier">
          + Add Supplier
        </Button>
      </Box>

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.7fr 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Left: supplier list + recent orders */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined" sx={{ overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            {/* Search bar + filter tabs */}
            <Box
              sx={{
                px: 3,
                pt: 2,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <TextField
                placeholder="Search suppliers…"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ maxWidth: 320 }}
                aria-label="Search suppliers"
              />
              <Tabs
                value={activeTab}
                onChange={(_, v: TabValue) => setActiveTab(v)}
                sx={{ minHeight: 36 }}
              >
                <Tab
                  value="all"
                  label={`All ${suppliers.length}`}
                  sx={{ minHeight: 36, py: 0, textTransform: 'none' }}
                />
                <Tab
                  value="active"
                  label="Active"
                  sx={{ minHeight: 36, py: 0, textTransform: 'none' }}
                />
                <Tab
                  value="pending"
                  label="Pending order"
                  sx={{ minHeight: 36, py: 0, textTransform: 'none' }}
                />
              </Tabs>
            </Box>

            {/* Supplier list body */}
            {suppliersLoading ? (
              <Box sx={{ p: 3 }}>
                <LoadingState label="Loading suppliers…" />
              </Box>
            ) : suppliersError ? (
              <Box sx={{ p: 3 }}>
                <ErrorState
                  description="We couldn't load the supplier directory. Check your connection and try again."
                  onRetry={() => refetchSuppliers()}
                />
              </Box>
            ) : filteredSuppliers.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <EmptyState
                  title={suppliers.length === 0 ? 'No suppliers yet' : 'No matching suppliers'}
                  description={
                    suppliers.length === 0
                      ? 'Suppliers you add will appear here with their contact details and delivery cadence.'
                      : 'Try adjusting your search or selecting a different filter.'
                  }
                />
              </Box>
            ) : (
              filteredSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  onView={() => setHistorySupplier(supplier)}
                  onEdit={() => openEdit(supplier)}
                />
              ))
            )}
          </Paper>

          {/* Recent Orders table */}
          <Paper variant="outlined" sx={{ p: 2.5, boxShadow: 'var(--shadow)' }}>
            <Typography
              variant="overline"
              sx={{ mb: 1.5, display: 'block', letterSpacing: 1.2, color: 'text.secondary' }}
            >
              Recent Orders
            </Typography>
            <RecentOrdersTable
              deliveries={recentDeliveries}
              suppliers={suppliers}
              isLoading={deliveriesLoading}
              isError={deliveriesError}
              onRetry={() => refetchDeliveries()}
            />
          </Paper>
        </Box>

        {/* Right sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, boxShadow: 'var(--shadow)' }}>
            <Typography
              variant="overline"
              sx={{ mb: 1.5, display: 'block', letterSpacing: 1.2, color: 'text.secondary' }}
            >
              Spend by Supplier
            </Typography>
            <SupplierSpendChart
              deliveries={recentDeliveries}
              suppliers={suppliers}
              isLoading={deliveriesLoading}
              isError={deliveriesError}
              onRetry={() => refetchDeliveries()}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, boxShadow: 'var(--shadow)' }}>
            <Typography
              variant="overline"
              sx={{ mb: 1.5, display: 'block', letterSpacing: 1.2, color: 'text.secondary' }}
            >
              Upcoming Deliveries
            </Typography>
            <UpcomingDeliveriesList deliveries={recentDeliveries} suppliers={suppliers} />
          </Paper>
        </Box>
      </Box>

      <SupplierDeliveryHistory
        supplier={historySupplier}
        onClose={() => setHistorySupplier(null)}
      />

      <SupplierForm
        open={formOpen}
        mode={editing ? 'edit' : 'create'}
        initialValues={editing ?? undefined}
        submitting={submitting}
        errorMessage={submitError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {toast ? (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      ) : null}
    </Box>
  )
}

export default SuppliersPage
