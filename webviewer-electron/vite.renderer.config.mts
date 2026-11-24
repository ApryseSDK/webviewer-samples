import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    // Pre-bundle WebViewer at startup so Vite doesn't re-optimize and reload mid page load
    include: ['@pdftron/webviewer'],
  },
});
