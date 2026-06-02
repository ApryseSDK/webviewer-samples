// Send the loaded document text to the server, to be
// analyzed for personal information identification (PII)
const parseServerResponse = async (response) => {
  const responseData = await response.json();
  if (!response.ok) {
    return {
      error: responseData.error || responseData.details || `Server error: ${response.status} ${response.statusText}`,
      success: false,
    };
  }

  return responseData;
};

const sendTextToServer = async () => {
  try {
    const response = await fetch('/api/send-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText: globalThis.loadedDocument?.text ?? '',
        pageCount: globalThis.loadedDocument?.pageCount ?? 0
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error sending document text to server:', error);
    throw error;
  }
}

// Analyze the loaded document text for personal information identification (PII)
const analyzeDocument = async () => {
  try {
    const response = await fetch('/api/analyze-pii', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await parseServerResponse(response);
  } catch (error) {
    console.error('Error analyzing document for PII:', error);
    return {
      error: error.message || 'Failed to analyze document for PII.',
      success: false,
    };
  }
}

// Receive analysis result from the server
const getAnalysisResult = async () => {
  try {
    const response = await fetch('/api/get-results', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await parseServerResponse(response);
  } catch (error) {
    console.error('Error getting analysis result:', error);
    return {
      error: error.message || 'Failed to retrieve analysis results.',
      success: false,
    };
  }
}

const analyzeDocumentForPII = async () => {
  try {
    // Clear any existing AI-generated redactions before applying new ones
    clearAIRedactions();

    // Show WebViewer loading spinner
    WebViewer.getInstance().UI.openElements('loadingModal');

    // Step 1: Send document text to server
    globalThis.aiAnalysisResult = await sendTextToServer();
    if (!globalThis.aiAnalysisResult.success) {
      alert(globalThis.aiAnalysisResult.error);
      return false;
    }

    // Step 2: Analyze document for PII
    globalThis.aiAnalysisResult = await analyzeDocument();
    if (!globalThis.aiAnalysisResult.success)
      return false;

    // Step 3: Get analysis result from server
    globalThis.aiAnalysisResult = await getAnalysisResult();
    if (!globalThis.aiAnalysisResult.success) {
      alert('No PII result found.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to analyze document:', error);
    return false;
  }
  finally {
    // Hide WebViewer loading spinner
    WebViewer.getInstance().UI.closeElements('loadingModal');
  }
}

// Function to clear all AI-generated redaction annotations
const clearAIRedactions = () => {
  const { annotationManager, Annotations } = WebViewer.getInstance().Core;
  // Get all redaction annotations with 'AI Redaction' Author
  const redactionList = annotationManager.getAnnotationsList().filter(
    annot => annot instanceof Annotations.RedactionAnnotation && annot.Author === 'AI Redaction'
  );

  // Delete each matching redaction annotation
  redactionList.forEach(redaction => {
    annotationManager.deleteAnnotation(redaction, true);
  });
}

export { analyzeDocumentForPII };