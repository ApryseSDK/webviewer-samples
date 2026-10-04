import { expect, test, type Page } from '@playwright/test';
import { invalidLicenseBaseURL } from '../config/playwright.config';

const gotoSampleApp = async (page: Page, url: string = ''): Promise<void> => {
  await page.goto(`${url}/`);
};

test('WebViewer assets are served as indication webviewer is installed successfully', async ({ page }) => {
  await gotoSampleApp(page);

  const webViewerCoreAsset = await page.request.get('/lib/webviewer/core/webviewer-core.min.js');
  expect(webViewerCoreAsset.ok()).toBeTruthy();
});

test('renders document and core viewer controls', async ({ page }) => {
  await gotoSampleApp(page);
  await expect(page.locator('#webviewer')).toBeVisible();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const dynamicWindow = window as Window & {
          getInstance?: (element: Element) => {
            Core?: {
              documentViewer?: {
                getDocument?: () => unknown;
                getPageCount?: () => number;
                getCurrentPage?: () => number;
                setCurrentPage?: (pageNumber: number) => void;
              };
            };
            UI?: {
              openElements?: (elements: string[]) => void;
              setZoomLevel?: (zoom: number) => void;
            };
          };
        };

        const viewerHost = document.querySelector('#webviewer');
        if (!viewerHost || typeof dynamicWindow.getInstance !== 'function') {
          return null;
        }

        const instance = dynamicWindow.getInstance(viewerHost);
        const documentViewer = instance?.Core?.documentViewer;
        if (!documentViewer?.getDocument?.()) {
          return null;
        }

        return {
          hasZoomControlApi: typeof instance?.UI?.setZoomLevel === 'function',
          hasPanelControlApi: typeof instance?.UI?.openElements === 'function',
          pageCount: documentViewer.getPageCount?.() ?? 0,
          currentPage: documentViewer.getCurrentPage?.() ?? 0,
        };
      });
    })
    .toMatchObject({
      hasZoomControlApi: true,
      hasPanelControlApi: true,
      currentPage: 1,
    });

  const pageCount = await page.evaluate(() => {
    const dynamicWindow = window as Window & {
      getInstance?: (element: Element) => {
        Core?: { documentViewer?: { getPageCount?: () => number } };
      };
    };
    const viewerHost = document.querySelector('#webviewer');
    if (!viewerHost || typeof dynamicWindow.getInstance !== 'function') {
      return 0;
    }
    return dynamicWindow.getInstance(viewerHost)?.Core?.documentViewer?.getPageCount?.() ?? 0;
  });
  expect(pageCount).toBeGreaterThan(1);

  await page.evaluate(() => {
    const dynamicWindow = window as Window & {
      getInstance?: (element: Element) => {
        Core?: { documentViewer?: { setCurrentPage?: (pageNumber: number) => void } };
      };
    };
    const viewerHost = document.querySelector('#webviewer');
    if (!viewerHost || typeof dynamicWindow.getInstance !== 'function') {
      return;
    }
    dynamicWindow.getInstance(viewerHost)?.Core?.documentViewer?.setCurrentPage?.(2);
  });

  await expect.poll(async () => {
    return page.evaluate(() => {
      const dynamicWindow = window as Window & {
        getInstance?: (element: Element) => {
          Core?: { documentViewer?: { getCurrentPage?: () => number } };
        };
      };
      const viewerHost = document.querySelector('#webviewer');
      if (!viewerHost || typeof dynamicWindow.getInstance !== 'function') {
        return null;
      }
      return dynamicWindow.getInstance(viewerHost)?.Core?.documentViewer?.getCurrentPage?.() ?? null;
    });
  }).toBe(2);
});

test('verifies rectangle annotation in the loaded document', async ({ page }) => {
  await gotoSampleApp(page);

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
