import { defineConfig, devices } from '@playwright/test';

function fileUrlToPath(url: URL): string {
  const pathname = decodeURIComponent(url.pathname);
  return /^\/[A-Za-z]:\//.test(pathname) ? pathname.slice(1) : pathname;
}

const configDirUrl = new URL('.', import.meta.url);
const projectRoot = fileUrlToPath(new URL('../..', configDirUrl));
const defaultBaseURL = 'http://127.0.0.1:3000';
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
  // WebViewer downloads and initializes its WASM core on first paint, which
  // takes longer than the Playwright default.
  timeout: 120_000,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: defaultBaseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      // Copy the WebViewer assets into /public before serving, the same way
      // "npm run dev" does, then start Nuxt on a fixed host and port.
      command: [
        'npm run copy-webviewer',
        'node ./node_modules/nuxt/bin/nuxt.mjs dev --no-tui --host 127.0.0.1 --port 3000',
      ].join(' && '),
      cwd: projectRoot,
      url: defaultBaseURL,
      reuseExistingServer: !isCI,
      // A cold Nuxt dev build (modules, types, bundle, Nitro) runs well past
      // the 60s Playwright allows by default.
      timeout: 300_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
