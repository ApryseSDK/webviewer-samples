import { defineConfig, devices } from '@playwright/test';

function fileUrlToPath(url: URL): string {
  const pathname = decodeURIComponent(url.pathname);
  return /^\/[A-Za-z]:\//.test(pathname) ? pathname.slice(1) : pathname;
}

const configDirUrl = new URL('.', import.meta.url);
const projectRoot = fileUrlToPath(new URL('../..', configDirUrl));
const defaultBaseURL = 'http://127.0.0.1:5173';
export const invalidLicenseBaseURL = 'http://127.0.0.1:5174';
const env =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env ?? {};
const isCI = !!env.CI;

export default defineConfig({
  testDir: fileUrlToPath(new URL('../e2e', configDirUrl)),
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: defaultBaseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      cwd: projectRoot,
      url: defaultBaseURL,
      reuseExistingServer: !isCI,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174',
      cwd: projectRoot,
      url: invalidLicenseBaseURL,
      reuseExistingServer: !isCI,
      env: {
        ...env,
        VITE_DEMO_KEY: 'invalid-license-key',
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
