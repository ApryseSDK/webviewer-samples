import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { siteRoot } from './config/playwright.config';

const DOCUMENT_ID = 'webviewer-demo-1';
const API_TEST_ID = 'e2e-api-test';
const xfdfFile = (id: string) => path.join(siteRoot, `${id}.xfdf`);
const backupFile = `${xfdfFile(DOCUMENT_ID)}.e2e-backup`;

const xfdfSample = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><fields /><annots /></xfdf>`;

// Runs in the browser; WebViewer.getInstance returns the instance created by the sample's index.js
const getAnnotationSubjects = (page: Page) =>
  page.evaluate(() => {
    const instance = (window as any).WebViewer.getInstance(document.getElementById('viewer'));
    return instance.Core.annotationManager.getAnnotationsList().map((annotation: any) => annotation.Subject);
  });

const waitForViewerReady = async (page: Page) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Save Annotations' })).toBeVisible();
  await expect(page.getByRole('main', { name: 'Document Content' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Page number input' })).toHaveValue('1');
};

test.beforeAll(() => {
  // The save test overwrites the sample's annotation file, so keep the original to restore it afterwards
  if (fs.existsSync(xfdfFile(DOCUMENT_ID))) {
    fs.renameSync(xfdfFile(DOCUMENT_ID), backupFile);
  }
});

test.afterAll(() => {
  fs.rmSync(xfdfFile(DOCUMENT_ID), { force: true });
  fs.rmSync(xfdfFile(API_TEST_ID), { force: true });
  if (fs.existsSync(backupFile)) {
    fs.renameSync(backupFile, xfdfFile(DOCUMENT_ID));
  }
});

test('serves WebViewer assets and renders the viewer with the save button', async ({ page, request }) => {
  const asset = await request.get('/Scripts/webviewer/lib/webviewer.min.js');
  expect(asset.ok()).toBeTruthy();

  await waitForViewerReady(page);
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByRole('textbox', { name: 'Page number input' })).toHaveValue('2');
});

test('annotation API returns 204 when nothing has been saved', async ({ request }) => {
  const response = await request.get('/api/annotation?id=does-not-exist');
  expect(response.status()).toBe(204);
});

test('annotation API stores and returns XFDF', async ({ request }) => {
  const saveResponse = await request.post(`/api/annotation?id=${API_TEST_ID}`, { data: xfdfSample });
  expect(saveResponse.ok()).toBeTruthy();

  const loadResponse = await request.get(`/api/annotation?id=${API_TEST_ID}`);
  expect(loadResponse.status()).toBe(200);
  expect(await loadResponse.text()).toBe(xfdfSample);
});

test('saved annotations are loaded after reloading the page', async ({ page }) => {
  await waitForViewerReady(page);

  await page.evaluate(() => {
    const instance = (window as any).WebViewer.getInstance(document.getElementById('viewer'));
    const { Annotations, annotationManager } = instance.Core;
    const rectangle = new Annotations.RectangleAnnotation({
      PageNumber: 1,
      X: 100,
      Y: 100,
      Width: 150,
      Height: 100,
    });
    annotationManager.addAnnotation(rectangle);
    annotationManager.redrawAnnotation(rectangle);
  });
  expect(await getAnnotationSubjects(page)).toContain('Rectangle');

  let dialogMessage = '';
  page.once('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Save Annotations' }).click();
  await expect.poll(() => dialogMessage).toBe('Annotations saved successfully.');

  await page.reload();
  await expect(page.getByRole('main', { name: 'Document Content' })).toBeVisible();
  await expect.poll(() => getAnnotationSubjects(page)).toContain('Rectangle');
});
