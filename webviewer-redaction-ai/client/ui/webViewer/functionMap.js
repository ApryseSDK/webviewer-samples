import { analyzeDocumentForPII } from '../../document/analyzer.js';
import { applyRedactions } from '../../redaction.js';

const webViewerFunctionMap = {
  'diagnosticsPanelRender': () => {
    return globalThis.diagnosticsPanel.render();
  },
  'AIPIIRedactionClick': async () => {
    if (globalThis.systemPromptExposed)
      globalThis.diagnosticsPanel.display(`System Prompt:\n\n${globalThis.systemPrompt}`, 'human');

    const analysisSucceeded = await analyzeDocumentForPII();
    if (!analysisSucceeded || !globalThis.aiAnalysisResult) {
      globalThis.diagnosticsPanel.display('Status: Failure', 'system');
      globalThis.diagnosticsPanel.display('Response:', 'system');
      globalThis.diagnosticsPanel.display('Unable to analyze document for PII.', 'system');
      if (globalThis.aiAnalysisResult?.error)
        globalThis.diagnosticsPanel.display(`Error: ${globalThis.aiAnalysisResult.error}`, 'system');
      return;
    }

    globalThis.diagnosticsPanel.display(`Status: ${globalThis.aiAnalysisResult.success ? 'Success' : 'Failure'}`, 'system');
    globalThis.diagnosticsPanel.display('Response:', 'system');
    if (globalThis.aiAnalysisResult.success) {
      globalThis.diagnosticsPanel.display(globalThis.aiAnalysisResult.analysis, 'system');
      await applyRedactions();
    }
    else
      globalThis.diagnosticsPanel.display(globalThis.aiAnalysisResult.error, 'system');
  },
};

export default webViewerFunctionMap;