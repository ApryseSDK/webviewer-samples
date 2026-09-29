/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const configDir = __dirname;
const projectRoot = path.resolve(configDir, '..', '..');
const defaultBaseURL = 'http://127.0.0.1:4200';
export const invalidLicenseBaseURL = 'http://127.0.0.1:4201';

export default defineConfig({
  testDir: path.resolve(configDir, '../e2e'),
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
      command: 'node ./node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4200',
      cwd: projectRoot,
      url: defaultBaseURL,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Separate dev server for invalid license scenario.
      command: 'node ./node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4201',
      cwd: projectRoot,
      url: invalidLicenseBaseURL,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        NG_APP_DEMO_KEY: 'demo:12345',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
