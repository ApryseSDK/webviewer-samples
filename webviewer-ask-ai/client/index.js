import createChatbot from './chatbot.js';
import functionMap from './config/ui/functionMap.js';
const customUIFile = './config/ui/custom.json';

WebViewer({
  path: 'lib',
  initialDoc: 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/Report_2011.pdf',
  fullAPI: true,
  loadAsPDF: true,
  enableFilePicker: true, // Enable file picker to open files. In WebViewer -> menu icon -> Open File
  css: 'config/ui/styles.css',
  licenseKey: 'YOUR_LICENSE_KEY',
}, document.getElementById('viewer')
).then(instance => {

  // Import modular components configuration from JSON file
  importModularComponents(instance);

  // Listen for text selection events
  // The user can select text in the document, to be added as context for the chatbot to be processed
  instance.Core.documentViewer.addEventListener('textSelected', (quads, selectedText) => {
      setSelectedText(selectedText);
  });

  // Listen for document loaded event to initialize the chatbot panel
  instance.Core.documentViewer.addEventListener('documentLoaded', () => {
    // Initialize chatbot
    const chatbot = createChatbot();
    window.chatbot = chatbot;
    // Clear the conversation on new document load
    window.conversationLog = [];

    instance.UI.closeElements(['askWebSDKPanel']);
    instance.UI.openElements(['askWebSDKPanel']);
    instance.UI.setPanelWidth('askWebSDKPanel', 600);
  });
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

    await instance.UI.importModularComponents(JSON.parse(customUIConfig), functionMap);
  } catch (error) {
    throw new Error(`Failed to import modular components configuration: ${error.message}`);
  }
};