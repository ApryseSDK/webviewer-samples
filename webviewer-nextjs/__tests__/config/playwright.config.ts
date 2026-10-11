/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');
const defaultBaseURL = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: path.resolve(projectRoot, '__tests__/e2e'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: defaultBaseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run postinstall && node ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000',
      cwd: projectRoot,
      url: defaultBaseURL,
      reuseExistingServer: !process.env.CI,
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});