import { expect, test, type Page } from '@playwright/test';
import type { WebViewerInstance } from '@pdftron/webviewer';

const gotoSampleApp = async (page: Page, url: string = ''): Promise<void> => {
  await page.goto(`${url}/`);
  await expect(page).toHaveTitle('TypeScript Sample');
  await expect(page.getByText('TypeScript Sample', { exact: true })).toBeVisible();
};

const waitForWebViewerReady = async (page: Page): Promise<void> => {
  await expect(page.getByRole('main', { name: 'Document Content' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Left Panel' })).toBeVisible();
};

test('WebViewer assets are served as indication webviewer is installed successfully', async ({ page }) => {
  await gotoSampleApp(page);

  const webViewerCoreAsset = await page.request.get('/lib/core/webviewer-core.min.js');
  expect(webViewerCoreAsset.ok()).toBeTruthy();
});

test('renders document and core viewer controls', async ({ page }) => {
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  const pageNumberInput = page.getByRole('textbox', { name: 'Page number input' });
  await expect(pageNumberInput).toBeVisible();
  await expect(pageNumberInput).toHaveValue('1');
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(pageNumberInput).toHaveValue('2');
});

test('loads the initial document into the WebViewer instance', async ({ page }) => {
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  await expect.poll(() => page.evaluate(() => {
    const getInstance = (window as { getInstance?: (element: Element) => WebViewerInstance | undefined }).getInstance;
    const viewerHost = document.getElementById('viewer');
    if (!viewerHost || typeof getInstance !== 'function') {
      return 0;
    }

    const documentViewer = getInstance(viewerHost)?.Core?.documentViewer;
    if (!documentViewer?.getDocument()) {
      return 0;
    }

    return documentViewer.getPageCount();
  })).toBeGreaterThan(1);
});

test('shows license error dialog for invalid license key', async ({ page }) => {
  // The license key is hardcoded in src/index.ts, so swap it in the served app bundle
  // (WebViewer's own static assets under /lib are left untouched).
  await page.route(
    (url) => url.pathname.endsWith('.js') && !url.pathname.startsWith('/lib/'),
    async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace('Insert commercial license key here after purchase', 'demo:12345');
      await route.fulfill({ response, body });
    },
  );

  await gotoSampleApp(page);

  await expect(page.getByText('Invalid license key. Please check your key and try again.').first()).toBeVisible();
  await expect(page.getByText('Error code: 401').first()).toBeVisible();
});
