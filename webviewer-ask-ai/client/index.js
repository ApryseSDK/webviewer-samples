import Chatbot from './chatbot/chatbot.js';
import DocumentManager from './documentManager.js';
import functionMap from './ui/functionMap.js';
import { preloadConfig } from '../config/loader.js';
const customUIFile = './ui/custom.json';

// preload configuration
preloadConfig().then(() => {
}).catch(error => {
  console.error('Failed to preload configuration:', error);
});

WebViewer({
  path: 'libs/webviewer',
  initialDoc: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/Report_2011.pdf',
  loadAsPDF: true,
  enableFilePicker: true, // Enable file picker to open files. In WebViewer -> menu icon -> Open File
  css: 'ui/styles.css',
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
  // The user can select text in the document
  // to be added as context for the chatbot to be processed.
  // The text selection can span multiple pages
  tool.addEventListener('selectionComplete', (startQuad, allQuads) => {
    clipboard = '';
    Object.keys(allQuads).forEach(pageNum => {
      const text = documentViewer.getSelectedText(pageNum);
      clipboard += text + `\n<<PAGE_BREAK>> Page ${pageNum}\n`;
    });
  });

  // Listen for text deselection event
  documentViewer.addEventListener('textSelected', (quads, selectedText, pageNumber) => {
    clipboard = selectedText;
  });

  // Listen for document loaded event to initialize the chatbot panel
  // On switching documents, clear previous document's related data:
  // selected text (clipboard), chatbot panel contents, conversation log
  documentViewer.addEventListener('documentLoaded', async () => {
    // Clear selected text (clipboard)
    clipboard = '';
    // Clear the chatbot panel array of contents, but keep the same reference
    questionsLIs = [];
    // Clear chatbot panel conversation log
    conversationLog = [];

    // Load document manager
    loadedDocument = new DocumentManager(documentViewer);
    await loadedDocument.initialize().then(() => {
      // Once the loaded document manager is initialized, set up the chatbot panel
      // Ensure chatbot panel is properly set up
      UI.closeElements(['askWebSDKPanel']);
      UI.openElements(['askWebSDKPanel']);
      UI.setPanelWidth('askWebSDKPanel', 600);

      // Initialize chatbot
      chatbot = new Chatbot();

      // Always run contextual questions when history is empty
      if (chatbot.messagesHistory.length === 0)
        chatbot.askQuestionByPrompt('DOCUMENT_CONTEXTUAL_QUESTIONS');
    }).catch(error => {
      console.error('Failed to initialize document manager:', error);
      return;
    });
  })
});

// Import modular components configuration from JSON file
const importModularComponents = async (instance) => {
  try {
    const response = await fetch(customUIFile);
    if (!response.ok)
      throw new Error(`Failed to import modular components configuration: ${response.statusText}`);

    let customUIConfig = JSON.stringify(await response.json());
    customUIConfig = customUIConfig.replaceAll("{{APP_SITE_NAME}}", document.title);

    instance.UI.importModularComponents(JSON.parse(customUIConfig), functionMap);

  } catch (error) {
    throw new Error(`Failed to import modular components configuration: ${error.message}`);
  }
};