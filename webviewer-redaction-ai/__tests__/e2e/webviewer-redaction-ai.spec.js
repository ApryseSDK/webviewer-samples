// This file contains end-to-end tests for the AI PII redaction tool in WebViewer.
// It uses Playwright for testing the UI interactions and validating the functionality
// of the AI PII redaction tool.

import { test, expect } from '@playwright/test';
import { MOCK_DATA, registerApiRouteMocks } from '../../__mocks__/webviewer-redaction-ai.mock.js';

let mockCalls = null;

// Before each test, we set up the API route mocks to intercept and
// simulate backend responses for the AI PII redaction workflow.
// This allows us to test the UI interactions and logic without
// relying on actual backend services.
test.beforeEach(async ({ page }) => {
  mockCalls = await registerApiRouteMocks(page);
});

const normalizeMultilineText = (value) =>
  (value || '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line !== '')
    .join('\n');

// Validating that the AI PII redaction tool button exists in the DOM.
test('PII redaction tool button visibility', async ({ page }) => {
  // Go to the app page (adjust the URL if needed)
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Locate the AIPIIRedactionToolButton button in ModularHeader
  let component = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();
});

// Validate the diagnostics panel toggle button visibility.
test('Diagnostics panel toggle button visibility', async ({ page }) => {
  await page.goto('/client/index.html');

  const toggle = page.locator('button[data-element="diagnosticsPanelToggle"]');
  await toggle.waitFor({ state: 'visible' });
  await expect(toggle).toBeVisible();
});

// Test the diagnostics panel is rendering the expected results after clicking
// the AI PII redaction tool button and completing the mocked workflow.
test('Diagnostics panel renders the expected results', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Ensure full document text is loaded before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  // Ensure full document text length/size is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text.length || 0)
  ).toBeLessThanOrEqual(30000);

  // Ensure page count is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.pageCount || 0)
  ).toBeLessThanOrEqual(20);

  // Trigger analyzeDocumentForPII + applyRedactions through the UI button.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await pIIBtn.click();

  // Verify mocked endpoint workflow for send -> analyze -> get result.
  await expect.poll(() => mockCalls.sendText).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(1);
  await expect.poll(() => mockCalls.getResults).toBe(1);
  await expect.poll(() => normalizeMultilineText(mockCalls.sendTextPayload?.documentText)).toBe(
    normalizeMultilineText(MOCK_DATA.documentText)
  );

  // Assert that the diagnostics panel is visible after clicking the button and completing the mocked workflow.
  const panel = page.locator('div.ModularPanel[data-element="diagnosticsPanel"]');
  await panel.waitFor({ state: 'visible' });
  await expect(panel).toBeVisible();
});

// Applying AI PII redaction with mocked endpoint responses.
test('Perform AI PII redaction for document text size and page count within limits', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Ensure full document text is loaded before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  // Ensure full document text length/size is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text.length || 0)
  ).toBeLessThanOrEqual(30000);

  // Ensure page count is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.pageCount || 0)
  ).toBeLessThanOrEqual(20);

  // Trigger analyzeDocumentForPII + applyRedactions through the UI button.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await pIIBtn.click();

  // Verify mocked endpoint workflow for send -> analyze -> get result.
  await expect.poll(() => mockCalls.sendText).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(1);
  await expect.poll(() => mockCalls.getResults).toBe(1);
  await expect.poll(() => normalizeMultilineText(mockCalls.sendTextPayload?.documentText)).toBe(
    normalizeMultilineText(MOCK_DATA.documentText)
  );

  // Complete the redaction flow and assert it closes cleanly.
  const redactAllBtn = page.locator('button[data-element="redactAllMarkedButton"]');
  await expect(redactAllBtn).toBeVisible();
  await redactAllBtn.click();

  // Confirm the apply redaction modal and ensure it disappears after confirming.
  const applyRedactionBtn = page.locator('button[data-element="WarningModalSignButton"]');
  await expect(applyRedactionBtn).toBeVisible();
  await applyRedactionBtn.click();
  await expect(applyRedactionBtn).toBeHidden();

  // Ensure mocked analysis text is the value used by the UI workflow.
  await expect.poll(() => page.evaluate(() => globalThis.aiAnalysisResult?.analysis)).toBe(MOCK_DATA.analysisText);
});

// Expect an alert when analysis completes but /api/get-results returns no PII findings.
test('Expect an alert when loaded document has no identifiable PII', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Wait until document wrapper is initialized before replacing the loaded text.
  await expect.poll(() => page.evaluate(() => Boolean(globalThis.loadedDocument))).toBe(true);

  const noPIIText = 'Quarterly operations summary for warehouse inventory and packaging materials.';
  await page.evaluate((text) => {
    globalThis.loadedDocument.text = text;
    globalThis.loadedDocument.pageCount = 1;
  }, noPIIText);

  let getResultsCalls = 0;
  await page.unroute('**/api/get-results');
  await page.route('**/api/get-results', async (route) => {
    getResultsCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'No analysis results found.'
      })
    });
  });

  // Trigger analyzeDocumentForPII through the UI button and verify the alert content.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  const alertPromise = page.waitForEvent('dialog');
  await pIIBtn.click();
  const alertDialog = await alertPromise;
  expect(alertDialog.message()).toBe('No PII result found.');
  await alertDialog.accept();

  // Ensure the no-PII document text was submitted and the flow reached /api/get-results.
  await expect.poll(() => mockCalls.sendText).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(1);
  await expect.poll(() => getResultsCalls).toBe(1);
  await expect.poll(() => normalizeMultilineText(mockCalls.sendTextPayload?.documentText)).toBe(noPIIText);
});

// Expect an alert when document text/pages values exceed limits.
test('Expect an alert when document text exceeds 30000 characters with page count above 20', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Wait until document wrapper is initialized before mutating fields.
  await expect.poll(() => page.evaluate(() => Boolean(globalThis.loadedDocument))).toBe(true);

  await page.evaluate(() => {
    globalThis.loadedDocument.text = 'A'.repeat(30001);
    globalThis.loadedDocument.pageCount = 21;
  });

  let sendTextCalls = 0;
  await page.unroute('**/api/send-text');
  await page.route('**/api/send-text', async (route) => {
    sendTextCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'Document text size exceeds 30000 characters limit.'
      })
    });
  });

  // Trigger analyzeDocumentForPII through the UI button and verify the alert content.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  const alertPromise = page.waitForEvent('dialog');
  await pIIBtn.click();
  const alertDialog = await alertPromise;
  expect(alertDialog.message()).toBe('Document text size exceeds 30000 characters limit.');
  await alertDialog.accept();

  // Ensure request flow stops at /api/send-text when request validation fails.
  await expect.poll(() => sendTextCalls).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(0);
  await expect.poll(() => mockCalls.getResults).toBe(0);
});

test('Diagnostics panel separates hidden config from OpenAI model failure', async ({ page }) => {
  await page.route('**/api/config', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        llmModel: 'gpt-3.5-turbo',
        systemPrompt: 'Not exposed by server configuration.'
      })
    });
  });

  await page.unroute('**/api/analyze-pii');
  await page.route('**/api/analyze-pii', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'OpenAI could not use model "gpt-3.5-turbo". The configured API key or project does not have access to this model.'
      })
    });
  });

  await page.goto('/client/index.html');
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await pIIBtn.click();

  const panel = page.locator('div.ModularPanel[data-element="diagnosticsPanel"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('LLM Model: gpt-3.5-turbo');
  await expect(panel).toContainText('Error: OpenAI could not use model "gpt-3.5-turbo". The configured API key or project does not have access to this model.');
});

// Diagnostics panel shows model-specific initialization error when LLM is unavailable at send-text stage.
test('Diagnostics panel shows OpenAI initialization error from send-text stage', async ({ page }) => {
  await page.unroute('**/api/send-text');
  await page.route('**/api/send-text', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'OpenAI API key is missing for model "gpt-4o-mini". Set OPENAI_API_KEY in the server .env file.'
      })
    });
  });

  await page.goto('/client/index.html');
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  const alertPromise = page.waitForEvent('dialog');
  await pIIBtn.click();
  const alertDialog = await alertPromise;
  expect(alertDialog.message()).toContain('OpenAI API key is missing for model "gpt-4o-mini"');
  await alertDialog.accept();

  // analyze-pii and get-results must not have been called.
  await expect.poll(() => mockCalls.analyzePII).toBe(0);
  await expect.poll(() => mockCalls.getResults).toBe(0);
});

// Diagnostics panel shows failure message when /api/get-results returns a 500 error.
test('Diagnostics panel shows error when get-results returns 500', async ({ page }) => {
  await page.unroute('**/api/get-results');
  await page.route('**/api/get-results', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'Failed to retrieve analysis results',
        details: 'Internal server error.'
      })
    });
  });

  await page.goto('/client/index.html');
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  const alertPromise = page.waitForEvent('dialog');
  await pIIBtn.click();

  // The flow should reach get-results and fail gracefully without crashing.
  await expect.poll(() => mockCalls.sendText).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(1);

  // Accept the 'No PII result found.' alert that fires when get-results fails.
  const alertDialog = await alertPromise;
  await alertDialog.accept();

  const panel = page.locator('div.ModularPanel[data-element="diagnosticsPanel"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Status: Failure');
  await expect(panel).toContainText('Failed to retrieve analysis results');
});

// Simulates user hiding and showing the diagnostics panel
// via clicking the toggle button in the header.
test('Hide/Show diagnostics panel', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Ensure full document text is loaded before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  // Ensure full document text length/size is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text.length || 0)
  ).toBeLessThanOrEqual(30000);

  // Ensure page count is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.pageCount || 0)
  ).toBeLessThanOrEqual(20);

  // Trigger analyzeDocumentForPII + applyRedactions through the UI button.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await pIIBtn.click();

  // Locate the toggle button and diagnostics panel
  const toggle = page.locator('button[data-element="diagnosticsPanelToggle"]');
  const panel = page.locator('div.ModularPanel[data-element="diagnosticsPanel"]');

  // Hide the diagnostics panel
  await toggle.click();
  await expect(panel).not.toBeVisible();

  // Show the diagnostics panel again
  await toggle.click();
  await expect(panel).toBeVisible();
});