import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { _electron as electron, expect, test, type ElectronApplication, type Page } from '@playwright/test';
import { projectRoot } from '../config/playwright.config';

let electronApp: ElectronApplication;
let page: Page;
let userDataDir: string;

const launchSampleApp = async (): Promise<void> => {
  // Terminals inside Electron-based editors (e.g. VS Code) set this variable,
  // which would make Electron start as plain Node.js instead of an app.
  const { ELECTRON_RUN_AS_NODE: _runAsNode, ...env } = process.env;

  // WebViewer stores its trial start time in localStorage, which Electron persists in the
  // user data folder. A fresh folder per launch keeps an old trial from expiring the tests.
  userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webviewer-electron-e2e-'));

  electronApp = await electron.launch({
    args: [
      // Keeps the window hidden unless E2E_SHOW_WINDOW is set (useful for debugging).
      ...(env.E2E_SHOW_WINDOW ? [] : ['-r', path.join(projectRoot, '__tests__/config/hide-window.cjs')]),
      // Launches `main` from package.json (`.vite/build/main.cjs`).
      '.',
      `--user-data-dir=${userDataDir}`,
      ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
    ],
    cwd: projectRoot,
    env: env as Record<string, string>,
  });

  // The main process may also open DevTools, so wait for the sample's own window.
  page = await electronApp.firstWindow();
  if (page.url().startsWith('devtools://')) {
    page = await electronApp.waitForEvent('window', (window) => !window.url().startsWith('devtools://'));
  }
};

test.beforeEach(async () => {
  await launchSampleApp();
});

test.afterEach(async () => {
  await electronApp?.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});

test('WebViewer assets are bundled as indication webviewer is installed successfully', async () => {
  // `render.ts` loads WebViewer from `./lib/webviewer`, relative to the bundled `index.html`.
  const rendererDir = path.dirname(fileURLToPath(page.url()));
  expect(fs.existsSync(path.join(rendererDir, 'lib/webviewer/core/webviewer-core.min.js'))).toBeTruthy();
});

test('renders document and core viewer controls', async () => {
  await expect(page.getByRole('button', { name: 'Open File' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save File' })).toBeVisible();
  await expect(page.locator('#viewer')).toBeVisible();

  // WebViewer loads its UI and the remote sample document, which can take longer than the default timeout.
  await expect(page.getByRole('main', { name: 'Document Content' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Left Panel' })).toBeVisible();

  const pageNumberInput = page.getByRole('textbox', { name: 'Page number input' });
  await expect(pageNumberInput).toBeVisible();
  await expect(pageNumberInput).toHaveValue('1');
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(pageNumberInput).toHaveValue('2');
});

