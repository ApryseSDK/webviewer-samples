import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'node __tests__/e2e/config/test-server.js',
    url: 'http://localhost:3000/client/index.html',
    reuseExistingServer: !process.env.CI,
    cwd: process.cwd(),
  },
});
