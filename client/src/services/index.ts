export { appConfig } from './config'
export type { AppConfig } from './config'
export {
  fetchDashboardHeader,
  fetchTodayDashboard,
  fetchDashboardSummary,
  fetchDashboardAlerts,
} from './dashboard'
export {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from './inventory'
export type { InventoryPage } from './inventory'
export { fetchSuppliers, createSupplier, updateSupplier } from './suppliers'
export { queryKeys } from './queryKeys'
export { apiClient, setAuthHandlers } from './apiClient'
export { firebaseAuth, isFirebaseConfigured } from './firebase'
export { writeInvalidationMap, invalidateAfterWrite } from './invalidation'
export type { WriteKey } from './invalidation'
export { checkBackendHealth, logBackendHealth } from './health'
export type { HealthStatus } from './health'
