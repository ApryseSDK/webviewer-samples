import createChatbot from './chatbot.js';
import functionMap from './config/ui/functionMap.js';
const customUIFile = './config/ui/custom.json';

WebViewer({
  path: 'lib',
  initialDoc: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/Report_2011.pdf',
  loadAsPDF: true,
  enableFilePicker: true, // Enable file picker to open files. In WebViewer -> menu icon -> Open File
  css: 'config/ui/styles.css',
  licenseKey: 'YOUR_LICENSE_KEY',
}, document.getElementById('viewer')
).then(instance => {
  const { documentViewer, Tools } = instance.Core;
  const { UI } = instance;

  // Import modular components configuration from JSON file
  importModularComponents(instance);

  // Set up text selection listener
  const tool = documentViewer.getTool(Tools.ToolNames.TEXT_SELECT);

  // Listen for text selectionComplete event
  // The user can select text in the document, to be added as context for the chatbot to be processed
  // The text selection can span multiple pages
  tool.addEventListener('selectionComplete', (startQuad, allQuads) => {
    let selectedText = '';
    Object.keys(allQuads).forEach(pageNum => {
      const text = documentViewer.getSelectedText(pageNum);
      selectedText += text + `\n<<PAGE_BREAK>> Page ${pageNum}\n`;
    });
    setSelectedText(selectedText);
  });

  // Listen for text deselection event
  documentViewer.addEventListener('textSelected', (quads, selectedText, pageNumber) => {
    selectedText.length === 0 ? setSelectedText(selectedText) : null;
  });

  // Track current document for switch detection
  let currentDocumentName = null;
  let documentLoadEventRegistered = false;

  // Debug function to check document state
  function debugDocumentState() {
    const doc = documentViewer.getDocument();

    // Check if document is loaded using WebViewer's proper method
    if (doc) {
      doc.getDocumentCompletePromise().then(() => {
        console.log('Document is fully loaded and ready');
      }).catch(err => {
        console.log('Document loading error:', err);
      });
    }
  }

  // Function to handle document loading (can be called from multiple sources)
  function handleDocumentLoaded(source = 'unknown') {

    debugDocumentState();

    // check if document is unavailable, then skip handler
    const doc = documentViewer.getDocument();
    if (!doc)
      return;

    const newDocumentName = doc.filename || 'unnamed_document';

    // Check if this is a new document (not just a reload)
    if (currentDocumentName && (currentDocumentName !== newDocumentName)) {

      // Update current document reference BEFORE any resets
      currentDocumentName = newDocumentName;

      const freshChatbot = createChatbot();
      window.chatbot = freshChatbot;

      window.conversationLog = [];

      // Now reset the entire chatbot panel with the fresh instance
      resetChatbotPanel(instance);

      return; // Exit early for document switch to avoid duplicate processing
    }

    // Update current document reference
    currentDocumentName = newDocumentName;

    // Initialize chatbot if not exists
    if (!window.chatbot) {
      const chatbot = createChatbot();
      window.chatbot = chatbot;
    }

    // Ensure panel is properly set up
    UI.closeElements(['askWebSDKPanel']);
    UI.openElements(['askWebSDKPanel']);
    UI.setPanelWidth('askWebSDKPanel', 600);

    // Always run contextual questions when history is empty (first load only, not after reset)
    if (window.chatbot.conversationHistory.length === 0)
      askQuestionByPrompt('DOCUMENT_CONTEXTUAL_QUESTIONS');
  }

  // Listen for document loaded event to initialize the chatbot panel
  documentViewer.addEventListener('documentLoaded', () => {
    handleDocumentLoaded('documentLoaded-event');
  });
  documentLoadEventRegistered = true;

  // Debug helper: Make debug function available globally
  window.debugDocumentState = debugDocumentState;
});

// Import modular components configuration from JSON file
const importModularComponents = async (instance) => {
  try {
    const response = await fetch(customUIFile);
    if (!response.ok)
      throw new Error(`Failed to import modular components configuration: ${response.statusText}`);

    let customUIConfig = JSON.stringify(await response.json());
    customUIConfig = customUIConfig.replaceAll("{{APP_SITE_NAME}}", APP_SITE_NAME);
    customUIConfig = customUIConfig.replaceAll("{{ASK_WEB_SDK_ICO}}", ASK_WEB_SDK_ICO);

    instance.UI.importModularComponents(JSON.parse(customUIConfig), functionMap);

  } catch (error) {
    throw new Error(`Failed to import modular components configuration: ${error.message}`);
  }
};

// Utility functions for document switching
function resetChatbotPanel(instance) {

  // Clear the array contents but keep the same reference
  if (window.questionsLIs)
    window.questionsLIs.length = 0;

  // Try to force a complete UI refresh by reimporting modular components
  importModularComponents(instance).then(() => {
    // Now reopen the panel with fresh state
    instance.UI.openElements(['askWebSDKPanel']);
    instance.UI.setPanelWidth('askWebSDKPanel', 600);

    // Wait for UI to settle and ensure questionsLIs is populated
    if (window.chatbot)
      // Generate contextual questions for the new document
      askQuestionByPrompt('DOCUMENT_CONTEXTUAL_QUESTIONS');

  }).catch(error => {
    console.error('Error reimporting modular components:', error);
    // Fallback to simple reopen if reimport fails
    instance.UI.openElements(['askWebSDKPanel']);
    instance.UI.setPanelWidth('askWebSDKPanel', 600);
  });
}