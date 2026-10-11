/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');
const defaultBaseURL = 'http://127.0.0.1:3000';
const isCI = Boolean(process.env.CI);

const buildReporter = (): ReporterDescription[] => {
  const primaryReporter: ReporterDescription = isCI ? ['github'] : ['list'];
  const htmlReporter: ReporterDescription = ['html', { open: 'never' }];
  return [primaryReporter, htmlReporter];
};

const buildWebServerCommand = () => [
  'npm run postinstall',
  'node ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000',
].join(' && ');

const createDesktopProject = (name: string, deviceName: keyof typeof devices) => ({
  name,
  use: { ...devices[deviceName] },
});

export default defineConfig({
  testDir: path.resolve(projectRoot, '__tests__/e2e'),
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: isCI ? 1 : undefined,
  reporter: buildReporter(),
  use: {
    baseURL: defaultBaseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: buildWebServerCommand(),
      cwd: projectRoot,
      url: defaultBaseURL,
      reuseExistingServer: !isCI,
    }
  ],
  projects: [
    createDesktopProject('chromium', 'Desktop Chrome'),
  ],
});