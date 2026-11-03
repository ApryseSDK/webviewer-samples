// @ts-check
const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '../',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: 1,
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
    cwd: path.resolve(__dirname, '../../..'),
    url: 'http://localhost:3000/client/index.html',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
