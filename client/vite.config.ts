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
      // Without inlining, @mui/material's .mjs files are loaded by Node's
      // native ESM resolver, which can't follow react-transition-group's
      // CJS-style directory re-export and throws on render (e.g. Alert).
      deps: {
        inline: [/@mui\/material/],
      },
    },
  },
})
