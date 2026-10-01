/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const configDir = __dirname;
const projectRoot = path.resolve(configDir, '..', '..');
const defaultBaseURL = 'http://127.0.0.1:4200';
export const invalidLicenseBaseURL = 'http://127.0.0.1:4201';
const angularCliPath = './node_modules/@angular/cli/bin/ng.js';
const processEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => typeof value === 'string'),
) as Record<string, string>;

const createWebServer = (port: number, url: string, env?: Record<string, string>) => ({
  command: `node ${angularCliPath} serve --host 127.0.0.1 --port ${port}`,
  cwd: projectRoot,
  url,
  reuseExistingServer: !process.env.CI,
  ...(env ? { env } : {}),
});

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
    createWebServer(4200, defaultBaseURL),
    // Separate dev server for invalid license scenario.
    createWebServer(4201, invalidLicenseBaseURL, {
      ...processEnv,
      NG_APP_DEMO_KEY: 'demo:12345',
    }),
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
