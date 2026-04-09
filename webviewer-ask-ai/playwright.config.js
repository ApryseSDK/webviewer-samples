// Playwright configuration for E2E tests
// See https://playwright.dev/docs/test-configuration

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '__tests__',
  fullyParallel: true,
  reporter: 'html',
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:4040/',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm start -- --no-open',
    url: 'http://localhost:4040/client/index.html',
    reuseExistingServer: true,
  },
});