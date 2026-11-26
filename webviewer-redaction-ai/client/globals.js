// Globals for the app
let loadedDocument = null;
globalThis.loadedDocument = loadedDocument;
let aiAnalysisResult = null;
globalThis.aiAnalysisResult = aiAnalysisResult;
let diagnosticsPanel = null;
globalThis.diagnosticsPanel = diagnosticsPanel;
let llmModel = '';
globalThis.llmModel = llmModel;
let systemPrompt = '';
globalThis.systemPrompt = systemPrompt;

const files = [
  'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/sales-invoice-with-credit-cards.pdf',
  'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/ICR-Form-Handwriting.pdf',
  'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/employee-360-review.pdf',
  'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/section-508.pdf',
];
globalThis.files = files;