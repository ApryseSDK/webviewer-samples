import { expect, test, type Locator, type Page } from '@playwright/test';

const getViewer = (page: Page): Locator => page.locator('#viewer');

const getToolbar = (page: Page): Locator => page.locator('#tools');

const getFirstPage = (page: Page): Locator => getViewer(page).getByRole('region', { name: 'Page 1' });

const gotoSampleApp = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page).toHaveTitle('React Sample');
};

const waitForDocumentLoaded = async (page: Page): Promise<void> => {
  const documentLoaded = page.waitForEvent('console', (message) => message.text() === 'document loaded');
  await gotoSampleApp(page);
  await documentLoaded;
  await expect(getFirstPage(page)).toBeVisible();
};

const getPageWidth = async (page: Page): Promise<number> => {
  const box = await getFirstPage(page).boundingBox();
  return box?.width ?? 0;
};

test('WebViewer assets are served as indication webviewer is installed successfully', async ({ page }) => {
  await gotoSampleApp(page);

  const webViewerCoreAsset = await page.request.get('/webviewer/webviewer-core.min.js');
  expect(webViewerCoreAsset.ok()).toBeTruthy();
});

test('renders the demo document and the custom toolbar', async ({ page }) => {
  await waitForDocumentLoaded(page);

  await expect(getViewer(page).getByRole('region', { name: /^Page \d+$/ }).first()).toBeVisible();
  const toolbar = getToolbar(page);
  await expect(toolbar.getByRole('button', { name: 'Switch to edit mode' })).toBeVisible();
  await expect(toolbar.getByRole('button', { name: 'Create Redaction' })).toBeVisible();
  await expect(toolbar.getByRole('button', { name: 'Apply Redactions' })).toBeVisible();
});

test('zooms the document in and out from the toolbar', async ({ page }) => {
  await waitForDocumentLoaded(page);

  // The first two toolbar buttons are zoom out and zoom in.
  const zoomOutButton = getToolbar(page).getByRole('button').nth(0);
  const zoomInButton = getToolbar(page).getByRole('button').nth(1);
  const initialWidth = await getPageWidth(page);

  await zoomInButton.click();
  await expect.poll(() => getPageWidth(page)).toBeGreaterThan(initialWidth);

  await zoomOutButton.click();
  await expect.poll(() => getPageWidth(page)).toBeCloseTo(initialWidth, 0);
});

test('searches the document text and lists the results', async ({ page }) => {
  await waitForDocumentLoaded(page);

  // The search button is the last button in the toolbar.
  await getToolbar(page).getByRole('button').last().click();
  const searchContainer = page.locator('#search-container');
  await expect(searchContainer).toBeVisible();

  const searchInput = searchContainer.getByPlaceholder('Search');
  await searchInput.fill('PDF');
  await searchInput.press('Enter');

  const results = searchContainer.locator('.search-result');
  await expect(results.first()).toBeVisible();
  await expect(results.first().locator('.search-value')).toHaveText(/pdf/i);

  await searchContainer.getByRole('button', { name: 'Clear Search' }).click();
  await expect(results).toHaveCount(0);
  await expect(searchInput).toHaveValue('');
});
