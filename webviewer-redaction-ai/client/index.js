import DocumentManager from './document/manager.js';
import DiagnosticsPanel from './ui/diagnosticsPanel.js';
import webViewerFunctionMap from './ui/webViewer/functionMap.js';
const webViewerUIConfigFile = './ui/webViewer/config.json';

const instance = await WebViewer({
  path: 'lib',
  initialDoc: globalThis.files[0],
  fullAPI: true,
  loadAsPDF: true,
  enableFilePicker: true, // Enable file picker to open files. In WebViewer -> menu icon -> Open File
  enableRedaction: true,
  css: 'ui/styles.css',
  licenseKey: 'YOUR_LICENSE_KEY',
}, document.getElementById('viewer'));

const { documentViewer } = instance.Core;
const { UI } = instance;

// Import modular components configuration from JSON file
try {
  const response = await fetch(webViewerUIConfigFile);
  if (!response.ok)
    throw new Error(`Failed to import modular components configuration: ${response.statusText}`);

  let config = JSON.stringify(await response.json());
  WebViewer.getInstance().UI.importModularComponents(JSON.parse(config), webViewerFunctionMap);
} catch (error) {
  throw new Error(`Failed to import modular components configuration: ${error.message}`);
}

documentViewer.addEventListener('documentLoaded', async () => {
  // Switch to the Redact toolbar group
  UI.setToolbarGroup('toolbarGroup-Redact');

  // Set layout to Facing Continuous and fit mode
  // to Fit Page for better redaction experience
  UI.setLayoutMode(UI.LayoutMode.FacingContinuous);
  UI.setFitMode(UI.FitMode.FitPage);

  globalThis.diagnosticsPanel = new DiagnosticsPanel();
  globalThis.diagnosticsPanel.show();
  
  let result = await getServerConfig();
  globalThis.diagnosticsPanel.display(`LLM Model: ${globalThis.llmModel}`, 'system');
  if (!result.success)
    alert(result.error);

  // Retrieve LLM model name and system prompt from server
  async function getServerConfig() {
    const errorMessage = 'Failed to retrieve configuration from server.';
    try {
      const configResponse = await fetch('/api/config');
      const configData = await configResponse.json();
      globalThis.llmModel = configData.llmModel;
      globalThis.systemPrompt = configData.systemPrompt;
      globalThis.systemPromptExposed = Boolean(configData.systemPromptExposed);
      if (!configResponse.ok) {
        return {
          error: errorMessage,
          status: configResponse.status,
          success: false,
        };
      }
      
      return {
        status: configResponse.status,
        success: true
      };
    } catch (error) {
      return {
        error: errorMessage,
        details: error.message,
        status: 404,
        success: false
      };
    }
  }

  // Load document manager
  globalThis.loadedDocument = new DocumentManager(documentViewer);
  await globalThis.loadedDocument.initialize().then(async () => {
    globalThis.diagnosticsPanel.display(`Document: ${globalThis.loadedDocument?.fileName}`, 'system');
  }).catch(error => {
    console.error('Failed to initialize document manager:', error);
  });
});