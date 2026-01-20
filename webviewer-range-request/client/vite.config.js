// ES6 Compliant Syntax
// GitHub Copilot - Claude Sonnet 4.5 - December 22, 2025
// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
