import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { invalidLicenseBaseURL } from '../config/playwright.config';

const initialDocumentURL = 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf';
const localSampleDocument = new URL(
  '../../../webviewer-document-merge/public/files/WebviewerDemoDoc.pdf',
  import.meta.url,
);

const useLocalSampleDocument = async (page: Page): Promise<void> => {
  await page.route(initialDocumentURL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/pdf',
      body: readFileSync(localSampleDocument),
    });
  });
};

const gotoSampleApp = async (page: Page, url: string = ''): Promise<void> => {
  await page.goto(`${url}/`);
  await expect(page.locator('#webviewer')).toBeVisible();
};

const waitForWebViewerReady = async (page: Page): Promise<void> => {
  await expect(page.getByRole('main', { name: 'Document Content' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Left Panel' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Page number input' })).toHaveValue('1');
};

test('WebViewer assets are served as indication webviewer is installed successfully', async ({ page }) => {
  await gotoSampleApp(page);

  const webViewerCoreAsset = await page.request.get('/lib/webviewer/core/webviewer-core.min.js');
  expect(webViewerCoreAsset.ok()).toBeTruthy();
});

test('renders document and core viewer controls', async ({ page }) => {
  await useLocalSampleDocument(page);
  await gotoSampleApp(page);
  await waitForWebViewerReady(page);

  const pageNumberInput = page.getByRole('textbox', { name: 'Page number input' });
  await expect(pageNumberInput).toBeVisible();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(pageNumberInput).toHaveValue('2');
});

test('verifies rectangle annotation in the loaded document', async ({ page }) => {
  await useLocalSampleDocument(page);
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
      const viewerHost = document.querySelector('#webviewer');
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
  }, {
    timeout: 10000,
  }).toBe(true);
});

test('falls back to demo mode warning for invalid key @invalid-license', async ({ page }) => {
  const demoModeWarning = page.waitForEvent('console', {
    predicate: (message) => {
      return (
        message.type() === 'warning' &&
        message.text().includes('WebViewer is currently running in demo mode')
      );
    },
  });

  await useLocalSampleDocument(page);
  await gotoSampleApp(page, invalidLicenseBaseURL);
  await waitForWebViewerReady(page);

  const warningMessage = await demoModeWarning;
  expect(warningMessage.text()).toContain('WebViewer is currently running in demo mode');
});
