/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(configDir, '..', '..');
const defaultBaseURL = 'http://127.0.0.1:5173';
export const invalidLicenseBaseURL = 'http://127.0.0.1:5174';

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
      command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173',
      cwd: projectRoot,
      url: defaultBaseURL,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Vite server for the invalid license scenario.
      // This scenario will be used specifically in
      // case of passing invalid license to
      // "shows license error dialog for invalid key @invalid-license"
      // test in order to show the webviewer built-in
      // "Error Loading Document" dialog, and the test passing
      command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174',
      cwd: projectRoot,
      url: invalidLicenseBaseURL,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        VITE_DEMO_KEY: 'demo:12345',
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
