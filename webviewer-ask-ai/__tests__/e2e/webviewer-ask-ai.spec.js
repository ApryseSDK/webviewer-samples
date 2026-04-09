// This file contains end-to-end tests for the WebViewer Ask AI sample application,
// using the Playwright testing framework.

import { test, expect } from '@playwright/test';
import { MOCK_RESPONSE, registerApiChatMock } from '../../__mocks__/webviewer-ask-ai.mock.js';

const question = 'What social responsibility initiatives did Rosneft undertake in 2011?';

// Register the API chat mock before each test
// to ensure consistent and predictable responses
// from the chatbot during testing.
test.beforeEach(async ({ page }) => {
  await registerApiChatMock(page);
});

// Validate the chatbot toggle button visibility.
test('Chatbot toggle button visibility', async ({ page }) => {
  await page.goto('/client/index.html');

  const toggle = page.locator('button[data-element="askWebSDKPanelToggle"]');
  await toggle.waitFor({ state: 'visible' });
  await expect(toggle).toBeVisible();
});

// Validate the chatbot panel visibility.
test('Chatbot panel visibility', async ({ page }) => {
  await page.goto('/client/index.html');

  const panel = page.locator('div.ModularPanel[data-element="askWebSDKPanel"]');
  await panel.waitFor({ state: 'visible' });
  await expect(panel).toBeVisible();
});

// Validate the summarizing selection button visibility.
test('Summarizing selection button visibility', async ({ page }) => {
  await page.goto('/client/index.html');
  await simulateDocumentTextSelection(page, {
    pageNumber: 2,
    start: { x: 56.69320848, y: 32.40185332 },
    end: { x: 105.11567193, y: 40.06439572 },
  });

  const popupButton = page.locator('button[data-element="askWebSDKButton"]');
  await popupButton.waitFor({ state: 'visible' });
  await expect(popupButton).toBeVisible();
});

// Simulates user asking free question within the chatbot panel
test('Ask free question', async ({ page }) => {
  await page.goto('/client/index.html');

  // Locate the question input field, enter a question, and submit it by pressing 'Enter'
  const questionInput = page.locator('#askWebSDKQuestionInput');
  await questionInput.fill(question);
  await questionInput.press('Enter');

  // Validate that the assistant's response contains the expected text from the mock response
  const assistantResponse = page.locator('.askWebSDKAssistantMessageClass').last();
  await expect(assistantResponse).toContainText(MOCK_RESPONSE.DOCUMENT_QUESTION);
});

// Simulates user selecting text on the document and asking the chatbot to summarize it
test('Summarize selected text', async ({ page }) => {
  await page.goto('/client/index.html');
  await simulateDocumentTextSelection(page, {
    pageNumber: 6,
    start: { x: 179.72459999999998, y: 536.4002 },
    end: { x: 141.165, y: 415.9352 },
  });

  // Click the "Summarize selection" button in the TextPopup
  const popupButton = page.locator('button[data-element="askWebSDKButton"]');
  await popupButton.waitFor({ state: 'visible' });
  await popupButton.click();

  // Validate that the assistant's response contains the expected text from the mock response
  const assistantResponse = page.locator('.askWebSDKAssistantMessageClass').last();
  await expect(assistantResponse).toContainText(MOCK_RESPONSE.SELECTED_TEXT_SUMMARY);
});

// Simulates user hiding and showing the chatbot panel
// via clicking the toggle button in the header.
// Chatbot panel should maintain the visibility of the conversation.
test('Hide/Show chatbot panel', async ({ page }) => {
  await page.goto('/client/index.html');

  // Locate the question input field, enter a question, and submit it by pressing 'Enter'
  const questionInput = page.locator('#askWebSDKQuestionInput');
  await questionInput.fill(question);
  await questionInput.press('Enter');

  // Locate the toggle button and chatbot panel
  const toggle = page.locator('button[data-element="askWebSDKPanelToggle"]');
  const panel = page.locator('div.ModularPanel[data-element="askWebSDKPanel"]');

  // Hide the chatbot panel
  await toggle.click();
  await expect(panel).not.toBeVisible();

  // Show the chatbot panel again
  await toggle.click();
  await expect(panel).toBeVisible();
});

// Helper function to select document text and trigger the TextPopup.
const simulateDocumentTextSelection = async (page, { pageNumber, start, end }) => {
  await page.locator('div.ModularPanel[data-element="askWebSDKPanel"]').waitFor({ state: 'visible' });

  await page.evaluate(({ pageNumber, start, end }) => {
    const instance = globalThis.WebViewer.getInstance();
    const core = instance.Core;
    const UI = instance.UI;
    const documentViewer = core.documentViewer;
    const textSelectTool = documentViewer.getTool(core.Tools.ToolNames.TEXT_SELECT);

    documentViewer.setCurrentPage(pageNumber);
    UI.setToolMode(core.Tools.ToolNames.TEXT_SELECT);
    textSelectTool.select({ pageNumber, ...start }, { pageNumber, ...end });
  }, { pageNumber, start, end });

  await page.waitForFunction(() => {
    const instance = globalThis.WebViewer.getInstance();
    const selectedText = instance?.Core?.documentViewer?.getSelectedText?.();
    return typeof selectedText === 'string' && selectedText.trim().length > 0;
  });

  await page.evaluate(() => {
    const instance = globalThis.WebViewer.getInstance();
    instance.UI.openElements(['textPopup']);
  });
};