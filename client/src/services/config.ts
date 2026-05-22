const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const appConfig = Object.freeze({
  apiBaseUrl: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : undefined,
})

export type AppConfig = typeof appConfig
