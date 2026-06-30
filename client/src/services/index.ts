export { appConfig } from './config'
export type { AppConfig } from './config'
export {
  fetchDashboardHeader,
  fetchTodayDashboard,
  fetchDashboardSummary,
  fetchDashboardAlerts,
  fetchRecommendationPreviews,
} from './dashboard'
export {
  fetchRecommendationAvailability,
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  archiveMenuItem,
} from './menu'
export {
  fetchRecommendations,
  generateRecommendations,
  updateRecommendationStatus,
} from './recommendations'
export type { RecommendationScope } from './recommendations'
export {
  fetchInventory,
  fetchAllInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from './inventory'
export type { InventoryPage } from './inventory'
export { fetchSuppliers, createSupplier, updateSupplier, fetchSupplierDeliveries, fetchRecentDeliveries } from './suppliers'
export { queryKeys } from './queryKeys'
export { apiClient, setAuthHandlers } from './apiClient'
export { firebaseAuth, isFirebaseConfigured } from './firebase'
export { writeInvalidationMap, invalidateAfterWrite } from './invalidation'
export type { WriteKey } from './invalidation'
export { checkBackendHealth, logBackendHealth } from './health'
export type { HealthStatus } from './health'
export { fetchCategoryReport } from './reports'
