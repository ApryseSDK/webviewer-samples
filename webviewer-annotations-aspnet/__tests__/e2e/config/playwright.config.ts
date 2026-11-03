import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..', '..', '..');
export const siteRoot = path.join(projectRoot, 'server', 'webviewer-annotations-asp-net-sample');
const port = 54218;
const baseURL = `http://localhost:${port}`;
const iisExpress = process.env.IISEXPRESS_PATH || String.raw`C:\Program Files (x86)\IIS Express\iisexpress.exe`;

export default defineConfig({
  testDir: path.resolve(__dirname, '..'),
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    // The site must be built first (Visual Studio or msbuild) so that /bin is populated.
    command: `"${iisExpress}" /path:"${siteRoot}" /port:${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
