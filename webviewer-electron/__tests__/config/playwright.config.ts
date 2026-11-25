import path from 'node:path';
import { defineConfig } from '@playwright/test';

// This project is CommonJS (Electron's main bundle is `main.cjs`), so Playwright
// loads this config as CommonJS and `__dirname` is available.
export const projectRoot = path.resolve(__dirname, '../..');
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: path.resolve(__dirname, '../e2e'),
  // Builds the Electron app once before the tests launch it.
  globalSetup: path.resolve(__dirname, './global-setup.ts'),
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: 1,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
  },
});
