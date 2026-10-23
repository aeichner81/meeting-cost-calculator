/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/meeting-cost-calculator/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // Only raw CSS is kept, so layout tests can read the stylesheet source.
    css: { include: /\.css\?raw$/ },
  },
})
