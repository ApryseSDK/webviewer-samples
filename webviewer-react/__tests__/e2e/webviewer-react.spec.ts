import { expect, test, type Page } from '@playwright/test';
import { invalidLicenseBaseURL } from '../config/playwright.config';

const gotoSampleApp = async (page: Page, url: string = ''): Promise<void> => {
  await page.goto(`${url}/`);
  await expect(page.getByText('React sample')).toBeVisible();
};

const waitForWebViewerReady = async (page: Page): Promise<void> => {
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

test('verifies rectangle annotation in the loaded document', async ({ page }) => {
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  await expect.poll(async () => {
    return page.evaluate(() => {
      const dynamicWindow = window as Window & {
        getInstance?: (element: Element) => {
          Core?: {
            annotationManager?: {
              getAnnotationsList: () => Array<{ Subject?: string; PageNumber?: number }>;
            };
          };
        };
      };
      const viewerHost = document.querySelector('.webviewer');
      if (!viewerHost || typeof dynamicWindow.getInstance !== 'function') {
        return null;
      }

      const instance = dynamicWindow.getInstance(viewerHost);
      if (!instance?.Core?.annotationManager) {
        return null;
      }

      const annotations = instance.Core.annotationManager.getAnnotationsList();

      return annotations.some((annotation: { Subject?: string; PageNumber?: number }) => {
        return annotation.Subject === 'Rectangle' && annotation.PageNumber === 1;
      });
    });
  }).toBe(true);
});

test('shows license error dialog for invalid key @invalid-license', async ({ page }) => {
  const invalidLicenseError = page.waitForEvent('pageerror', {
    predicate: (error: Error) => {
      return error.message.includes('Invalid license key. Please check your key and try again.');
    },
  });
  
  await gotoSampleApp(page, invalidLicenseBaseURL);

  const pageError = await invalidLicenseError;
  expect(pageError.message).toContain('Error code: 401');
});
