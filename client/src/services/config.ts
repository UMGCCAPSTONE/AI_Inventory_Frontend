const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

const mocksFlag = import.meta.env.VITE_ENABLE_MOCKS?.trim().toLowerCase()

/**
 * Serve mock fixtures instead of empty data until the backend is wired.
 * Explicit `VITE_ENABLE_MOCKS` wins; otherwise default to dev-only (on while
 * running `vite`, off in the production build) so the deployed app never ships
 * fake data. See ADR 0006.
 */
const enableMocks =
  mocksFlag === 'true' || mocksFlag === '1'
    ? true
    : mocksFlag === 'false' || mocksFlag === '0'
      ? false
      : import.meta.env.DEV

export const appConfig = Object.freeze({
  apiBaseUrl: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : undefined,
  enableMocks,
})

export type AppConfig = typeof appConfig
