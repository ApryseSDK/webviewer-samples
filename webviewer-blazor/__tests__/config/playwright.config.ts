/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..');
// Use a port that differs from the launch profile (5000/5001) so a running `npm start`
// server, which redirects to HTTPS with a self-signed certificate, is never reused.
const defaultBaseURL = 'http://127.0.0.1:5080';
const isCI = Boolean(process.env.CI);

const buildReporter = (): ReporterDescription[] => {
  const primaryReporter: ReporterDescription = isCI ? ['github'] : ['list'];
  const htmlReporter: ReporterDescription = ['html', { open: 'never' }];
  return [primaryReporter, htmlReporter];
};

// Serve over plain HTTP so the tests do not depend on a trusted ASP.NET Core dev certificate.
const buildWebServerCommand = () => [
  'npm run postinstall',
  `dotnet run --no-launch-profile --urls ${defaultBaseURL}`,
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
      // The first run restores and compiles the .NET project.
      timeout: 300_000,
      env: {
        // Static web assets (e.g. _framework/blazor.server.js) are only served by `dotnet run` in Development.
        ASPNETCORE_ENVIRONMENT: 'Development',
      },
    }
  ],
  projects: [
    createDesktopProject('chromium', 'Desktop Chrome'),
  ],
});
