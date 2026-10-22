import { expect, test, type Page } from '@playwright/test';

const invalidLicenseKey = 'demo:12345';

const gotoSampleApp = async (page: Page): Promise<void> => {
  await page.goto('/');
};

const waitForWebViewerReady = async (page: Page): Promise<void> => {
  await expect(page.locator('#webviewer')).toBeVisible();
  await expect(page.getByRole('main', { name: 'Document Content' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Left Panel' })).toBeVisible();
};

test('WebViewer assets are served as indication webviewer is installed successfully', async ({ page }) => {
  await gotoSampleApp(page);

  const webViewerCoreAsset = await page.request.get('/lib/webviewer/core/webviewer-core.min.js');
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

test('shows license error for invalid key @invalid-license', async ({ page }) => {
  // Nuxt serializes the public runtime config into the server-rendered HTML,
  // and the component reads the license key from it via useRuntimeConfig().
  // Rewriting that value in the response makes WebViewer initialize with an
  // invalid key, without needing a second dev server on a different license.
  await page.route('**/', async (route) => {
    const response = await route.fetch();
    const body = await response.text();

    await route.fulfill({
      response,
      body: body.replace(/demoKey:"[^"]*"/, `demoKey:"${invalidLicenseKey}"`),
    });
  });

  const invalidLicenseError = page.waitForEvent('pageerror', {
    predicate: (error: Error) => {
      return error.message.includes('Invalid license key. Please check your key and try again.');
    },
  });

  await gotoSampleApp(page);

  const pageError = await invalidLicenseError;
  expect(pageError.message).toContain('Error code: 401');
});
