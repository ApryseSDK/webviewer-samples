// Playwright configuration for E2E tests
// See https://playwright.dev/docs/test-configuration

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export default defineConfig({
  testDir: '../',
  fullyParallel: true,
  // Run serially: loading many WebViewer instances concurrently slows document
  // loading enough to exceed the default expect timeouts.
  workers: 1,
  // 'list' prints each test and its result to the console; 'html' keeps the full report.
  reporter: [['list'], ['html']],
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:4040/',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm start -- --no-open',
    cwd: projectRoot,
    url: 'http://localhost:4040/client/index.html',
    reuseExistingServer: true,
  },
});