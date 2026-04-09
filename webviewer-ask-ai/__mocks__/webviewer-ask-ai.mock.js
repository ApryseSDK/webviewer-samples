// This file provides mock implementations for the webviewer-ask-ai module,
// allowing developers to test and develop features without relying on actual
// API calls.

export const MOCK_RESPONSE = {
  DOCUMENT_QUESTION: 'In 2011, Rosneft undertook several social responsibility initiatives, including: 1. Support for education by providing RUB 141 million to higher education institutions and extending loans totaling RUB 3.6 million to 97 workers for educational courses. 2. Charity efforts focused on socio-economic projects, healthcare, education, culture, and sports, with a total spending of RUB 2.9 billion on charity. 3. Maintenance of social infrastructure, with spending of RUB 1.0 billion aimed at optimizing facilities for employees and communities [14][15].',
  SELECTED_TEXT_SUMMARY: 'The Tuapse license area covers 12,000 square km in the Black Sea and has geological similarities to the West-Kuban Trough, a historic oil production region in Russia [6]. The Tuapse Block has undergone comprehensive 2D seismic work, with the most promising areas also analyzed using 3D seismic technology [6]. Current data indicates the presence of 20 promising structures with an estimated 8.9 billion barrels of recoverable oil resources [6].',
  DOCUMENT_CONTEXTUAL_QUESTIONS: '• What strategic partnerships did Rosneft establish in 2011 for offshore exploration?\n• How did Rosneft\'s resource base change in 2011 compared to previous years?\n• What social responsibility initiatives did Rosneft undertake in 2011?'
};

// Registers a Playwright route interceptor that mocks all /api/chat POST requests,
// preventing real network calls to the AI backend during tests.
export const registerApiChatMock = async (page) => {
  await page.route('/api/chat', async (route) => {
    const requestBody = JSON.parse(route.request().postData() || '{}');
    const { promptType } = requestBody;

    let response;
    switch (promptType) {
      case 'DOCUMENT_CONTEXTUAL_QUESTIONS':
        response = MOCK_RESPONSE.DOCUMENT_CONTEXTUAL_QUESTIONS;
        break;
      case 'DOCUMENT_QUESTION':
        response = MOCK_RESPONSE.DOCUMENT_QUESTION;
        break;
      case 'SELECTED_TEXT_SUMMARY':
        response = MOCK_RESPONSE.SELECTED_TEXT_SUMMARY;
        break;
      default:
        response = '';
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ response }),
    });
  });
};