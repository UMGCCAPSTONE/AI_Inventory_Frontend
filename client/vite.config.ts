/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    server: {
      // Inline MUI (and its react-transition-group dep) so Vite's resolver — not
      // Node's ESM loader — follows their `.mjs` directory imports, which Node
      // otherwise rejects ("Directory import ... is not supported").
      deps: { inline: [/@mui\//, 'react-transition-group'] },
    },
  },
})
