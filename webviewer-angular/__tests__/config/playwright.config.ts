/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const configDir = __dirname;
const projectRoot = path.resolve(configDir, '..', '..');
const defaultPort = 4200;
const invalidLicensePort = 4201;
const getBaseURL = (port: number) => `http://127.0.0.1:${port}`;
const defaultBaseURL = getBaseURL(defaultPort);
export const invalidLicenseBaseURL = getBaseURL(invalidLicensePort);
const angularCliPath = './node_modules/@angular/cli/bin/ng.js';
const baseEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
);

const createWebServer = (port: number, env?: Record<string, string>) => ({
  command: `node ${angularCliPath} serve --host 127.0.0.1 --port ${port}`,
  cwd: projectRoot,
  url: getBaseURL(port),
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
  webServer: [defaultPort, invalidLicensePort].map((port) =>
    createWebServer(
      port,
      port === invalidLicensePort
        ? {
            ...baseEnv,
            NG_APP_DEMO_KEY: 'demo:12345',
          }
        : undefined,
    ),
  ),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
