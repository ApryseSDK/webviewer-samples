import { expect, test, type Locator, type Page } from '@playwright/test';
import type { WebViewerInstance } from '@pdftron/webviewer';

type StampCreationWindow = Window & {
  stampCreationMainInstance?: WebViewerInstance;
  stampCreationDesignerInstance?: WebViewerInstance;
};

const getMainViewer = (page: Page): Locator => page.locator('#viewer');

const getDesignerPortal = (page: Page): Locator => page.locator('#stamp-designer-portal');

const gotoSampleApp = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page).toHaveTitle('React Sample');
};

const waitForWebViewerReady = async (page: Page): Promise<void> => {
  const viewer = getMainViewer(page);
  await expect(viewer.getByRole('main', { name: 'Document Content' })).toBeVisible();
  await expect(viewer.getByRole('button', { name: 'Open stamp designer' })).toBeVisible();
  await expect(viewer.getByRole('button', { name: 'Show stamps panel' })).toBeVisible();
};

const openStampDesigner = async (page: Page): Promise<Locator> => {
  await getMainViewer(page).getByRole('button', { name: 'Open stamp designer' }).click();

  const portal = getDesignerPortal(page);
  await expect(portal).toHaveClass(/\bopen\b/);
  await expect(portal.getByRole('button', { name: 'Create stamp' })).toBeVisible();
  await expect(portal.getByRole('region', { name: 'Page 1' })).toBeVisible();
  // Drawing only works once the blank stamp document has loaded in the designer viewer.
  await expect.poll(() => page.evaluate(() => {
    const designer = (window as StampCreationWindow).stampCreationDesignerInstance;
    return designer?.Core.documentViewer.getPageCount() ?? 0;
  })).toBe(1);
  return portal;
};

const dragAcross = async (page: Page, target: Locator): Promise<void> => {
  const box = await target.boundingBox();
  if (!box) {
    throw new Error('Unable to locate the drawing area.');
  }

  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6, { steps: 10 });
  await page.mouse.up();
};

test('WebViewer assets are served as indication webviewer is installed successfully', async ({ page }) => {
  await gotoSampleApp(page);

  const webViewerCoreAsset = await page.request.get('/webviewer/core/webviewer-core.min.js');
  expect(webViewerCoreAsset.ok()).toBeTruthy();
});

test('renders document and stamp creation controls', async ({ page }) => {
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  const viewer = getMainViewer(page);
  const pageNumberInput = viewer.getByRole('textbox', { name: 'Page number input' });
  await expect(pageNumberInput).toHaveValue('1');
  await viewer.getByRole('button', { name: 'Next page' }).click();
  await expect(pageNumberInput).toHaveValue('2');

  // The designer portal stays hidden until it is opened from the header.
  await expect(getDesignerPortal(page)).not.toHaveClass(/\bopen\b/);
});

test('opens and closes the stamp designer', async ({ page }) => {
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  const portal = await openStampDesigner(page);
  await expect(portal.getByRole('button', { name: 'Rectangle' })).toHaveAttribute('aria-pressed', 'true');

  await portal.getByRole('button', { name: 'Close stamp designer' }).click();
  await expect(portal).not.toHaveClass(/\bopen\b/);
});

test('creates a stamp from a drawing and places it on the document', async ({ page }) => {
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  const portal = await openStampDesigner(page);
  await dragAcross(page, portal.getByRole('region', { name: 'Page 1' }));
  await portal.getByRole('button', { name: 'Create stamp' }).click();
  await expect(portal).not.toHaveClass(/\bopen\b/);

  // The new stamp is registered in the "My Stamps" category of the stamps panel.
  const viewer = getMainViewer(page);
  await expect(viewer.getByRole('button', { name: 'My Stamps' })).toBeVisible();
  await expect(viewer.getByRole('button', { name: /^Designed Stamp .+ 1$/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const main = (window as StampCreationWindow).stampCreationMainInstance;
    return main?.Core.documentViewer.getToolMode().name;
  })).toBe('AnnotationCreateRubberStamp');

  await viewer.getByRole('region', { name: 'Page 1' }).click();
  await expect.poll(() => page.evaluate(() => {
    const main = (window as StampCreationWindow).stampCreationMainInstance;
    return main?.Core.annotationManager.getAnnotationsList()
      .filter((annotation) => annotation.PageNumber === 1)
      .map((annotation) => annotation.Subject) ?? [];
  })).toContain('Stamp');
});
