const { test, expect } = require('@playwright/test');

test.describe('WebViewer Annotations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#viewer', { state: 'visible' });
  });

  test('should load webviewer with document', async ({ page }) => {
    const viewer = page.locator('#viewer');
    await expect(viewer).toBeVisible();
  });

  test('should have save button in toolbar', async ({ page }) => {
    // Wait for the save button to appear using aria-label
    const saveButton = page.locator('button[aria-label="Save Annotations"]');
    await expect(saveButton).toBeVisible();
  });

  test('should save annotations to server when clicking Save Annotations button', async ({ page }) => {
    const saveButton = page.locator('button[aria-label="Save Annotations"]');
    await expect(saveButton).toBeVisible();

    // Intercept network requests to verify the save endpoint is called
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/server/annotationHandler.js') &&
      response.url().includes('documentId=webviewer-demo-1') &&
      response.request().method() === 'POST' &&
      response.status() === 200
    );

    await saveButton.click();

    const response = await responsePromise;
    expect(response.url()).toContain('/server/annotationHandler.js');
    expect(response.url()).toContain('webviewer-demo-1');
    expect(response.status()).toBe(200);
  });
});
