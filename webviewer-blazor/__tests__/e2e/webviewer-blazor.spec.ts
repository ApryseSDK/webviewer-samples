import { expect, test, type Page } from '@playwright/test';
import type { WebViewerInstance } from '@pdftron/webviewer';

const invalidLicenseKey = 'demo:12345';

const gotoSampleApp = async (page: Page): Promise<void> => {
  await page.goto('/webviewer');
  await expect(page.getByRole('heading', { name: 'WebViewer' })).toBeVisible();
};

const waitForWebViewerReady = async (page: Page): Promise<void> => {
  await expect(page.locator('#viewer')).toBeVisible();
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

test('loads the annotations in the sample document', async ({ page }) => {
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  await expect.poll(() => page.evaluate(() => {
    const getInstance = (window as { getInstance?: (element: Element) => WebViewerInstance | undefined }).getInstance;
    const viewerElement = document.getElementById('viewer');
    if (typeof getInstance !== 'function' || !viewerElement) {
      return 0;
    }

    const instance = getInstance(viewerElement);
    return instance?.Core?.annotationManager?.getAnnotationsList().length ?? 0;
  })).toBeGreaterThan(0);
});

test('shows license error for invalid key', async ({ page }) => {
  // The license key is read from .env by the server and passed to initWebViewer.
  // Rewriting the script response makes WebViewer initialize with an invalid key
  // without needing to change the .env file.
  await page.route('**/js/webviewerScripts.js', async (route) => {
    const response = await route.fetch();
    const body = await response.text();

    await route.fulfill({
      response,
      body: body.replace(/licenseKey:\s*licenseKey\s*\|\|\s*""/, `licenseKey: "${invalidLicenseKey}"`),
    });
  });

  await gotoSampleApp(page);

  await expect(page.getByText('Invalid license key. Please check your key and try again.').first()).toBeVisible();
  await expect(page.getByText('Error code: 401').first()).toBeVisible();
});
