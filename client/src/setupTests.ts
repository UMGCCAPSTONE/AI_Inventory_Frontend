import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement ResizeObserver, which MUI X DataGrid requires to
// measure its viewport (T-9A is the first ticket to use DataGrid).
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserver as unknown as typeof globalThis.ResizeObserver
}
