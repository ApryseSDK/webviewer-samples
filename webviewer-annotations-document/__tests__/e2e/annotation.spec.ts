import { test, expect } from '@playwright/test';

test.describe('WebViewer Annotations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client/index.html');
    await page.waitForSelector('#viewer');
    // Wait for WebViewer UI elements to be visible
    await page.locator('button[aria-label="Save Annotations"]').waitFor({ state: 'visible' });
  });

  test('should load PDF document in viewer', async ({ page }) => {
    // Check if the viewer container exists
    const viewerElement = await page.locator('#viewer');
    await expect(viewerElement).toBeVisible();

    // Check if WebViewer is initialized
    const webViewer = page.locator('apryse-webviewer');
    await expect(webViewer).toBeVisible();
  });

  test('should display save button in header', async ({ page }) => {
    // Wait for the save button to appear using aria-label
    const saveButton = page.locator('button[aria-label="Save Annotations"]');
    await expect(saveButton).toBeVisible();
  });

  test('should save annotations when save button is clicked', async ({ page }) => {
    // Click the save button
    const saveButton = page.locator('button[aria-label="Save Annotations"]');

    // Set up listener for the alert
    const dialogPromise = page.waitForEvent('dialog');

    await saveButton.click();

    // Wait for and handle the dialog
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Annotations saved');
    await dialog.accept();
  });

  test('should have annotation tools available', async ({ page }) => {
    // Check if annotation tools are present in the UI
    const annotateButton = page.locator('button[aria-label="Annotate"]');
    const shapesButton = page.locator('button[aria-label="Shapes"]');

    await expect(annotateButton).toBeVisible();
    await expect(shapesButton).toBeVisible();
  });
});
