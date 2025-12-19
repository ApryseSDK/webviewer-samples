// Browser-compatible chatbot client
class ChatbotClient {
  constructor() {
    this.conversationHistory = [];
  }

  // Initialize chat interface for the WebViewer panel
  initialize = () => {
    // You can expand this to integrate with the WebViewer panel UI
    window.chatbot = this; // Make chatbot available globally for testing
  };

  async sendMessage(promptLine, message, options = {}) {
    try {
      // For document-level operations, optionally use empty history to prevent token overflow
      const historyToSend = options.useEmptyHistory ? [] : this.conversationHistory;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          promptType: promptLine,
          history: historyToSend
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update conversation history only if not explicitly disabled
      if (!options.skipHistoryUpdate) {
        this.conversationHistory.push(
          { role: 'human', content: `${promptLine}: ${message.substring(0, 100)}...` }, // Truncate long messages in history
          { role: 'assistant', content: data.response }
        );
      }

      return data.response;
    } catch (error) {
      throw error;
    }
  }

  //Combine into single container for all bubble responses
  getAllText = async (promptType, createBubble) => {
    const doc = window.WebViewer.getInstance().Core.documentViewer.getDocument();
    doc.getDocumentCompletePromise().then(async () => {

      const pageCount = doc.getPageCount();
      const pageTexts = new Array(pageCount);
      let loadedPages = 0;

      // Load all pages and store them in correct order
      for (let i = 1; i <= pageCount; i++) {
        try {
          const text = await doc.loadPageText(i);
          // Store with page break BEFORE the content
          pageTexts[i - 1] = `<<PAGE_BREAK>> Page ${i}\n${text}`;
          loadedPages++;

          // When all pages are loaded, combine and send
          if (loadedPages === pageCount) {
            const completeText = pageTexts.join('\n\n');

            // Use empty history for document-level operations to prevent token overflow
            this.sendMessage(promptType, completeText, {
              useEmptyHistory: true,
              skipHistoryUpdate: false // Still update history but with truncated content
            }).then(response => {
              let responseText = this.responseText(response);
              responseText = this.formatText(promptType, responseText);
              createBubble(responseText, 'assistant');
            }).catch(error => {
              createBubble(`Error: ${error.message}`, 'assistant');
            });
          }
        } catch (error) {
          pageTexts[i - 1] = `<<PAGE_BREAK>> Page ${i}\n[Error loading page content]`;
          loadedPages++;

          // Still proceed if all pages are processed (even with errors)
          if (loadedPages === pageCount) {
            const completeText = pageTexts.join('\n\n');

            this.sendMessage(promptType, completeText, {
              useEmptyHistory: true,
              skipHistoryUpdate: false
            }).then(response => {
              let responseText = this.responseText(response);
              responseText = this.formatText(promptType, responseText);
              createBubble(responseText, 'assistant');
            }).catch(error => {
              createBubble(`Error: ${error.message}`, 'assistant');
            });
          }
        }
      }
    });
  };

  // Extract text from OpenAI response via LangChain
  responseText = (response) => {
    // Primary: Server should send clean string content
    if (typeof response === 'string') {
      return response;
    }

    // Fallback: if server still sends complex object, extract properly
    if (typeof response === 'object' && response !== null) {

      // Standard LangChain approach: use .content property directly
      if (response.content !== undefined) {
        return response.content;
      }

      // Fallback for serialized LangChain objects
      if (response.kwargs && response.kwargs.content) {
        return response.kwargs.content;
      }

      return JSON.stringify(response);
    }

    return 'No response received';
  };

  // Format text to include cited page links
  // and page breaks based on prompt type
  formatText = (promptType, text) => {
    switch (promptType) {
      case 'DOCUMENT_SUMMARY':
      case 'SELECTED_TEXT_SUMMARY':
      case 'DOCUMENT_QUESTION':
        // Add page breaks to page citation ends with period
        text = text.replace(/(\d+\])\./g, '$1.<br/><br/>');
        break;
      case 'DOCUMENT_KEYWORDS':
        // Format bullet points with line breaks
        let lines = text.split(/•\s*/).filter(Boolean);
        text = lines.map(line => `• ${line.trim()}`).join('<br/>');
        break;
      default:
        break;
    }

    // Separate citations group on form [1, 2, 3] to individual [1][2][3]
    text = this.separateGroupedCitations(text, /\[\d+(?:\s*,\s*\d+)+\]/g);

    // Separate citations range on form [1-3] to individual [1][2][3]
    text = this.separateGroupedCitations(text, /\[\d+(?:\s*-\s*\d+)+\]/g);

    let matches = text.match(/\[\d+\]/g);
    if (matches && matches.length > 0) {
      // Element duplicate matches
      matches = [...new Set(matches)];

      let pageNumber = 1;
      // match to be turned into link
      matches.forEach(match => {
        pageNumber = match.match(/\d+/)[0];
        if (pageNumber > 0 &&
          pageNumber <= window.WebViewer.getInstance().Core.documentViewer.getDocument().getPageCount()) {
          const pageLink = `<a href="#" style="color:blue;" onclick="window.WebViewer.getInstance().Core.documentViewer.setCurrentPage(${pageNumber}, true);">[${pageNumber}]</a>`;
          text = text.replaceAll(match, `${pageLink}`);
        }
      });
    }

    return text;
  }

  // Helper to separate grouped citations on form [1, 2, 3] or [1-3] into individual [1][2][3]
  separateGroupedCitations = (text, pattern) => {
    let matches = text.match(pattern);
    if (matches && matches.length > 0) {
      let formattedMatchNumbers = '';
      matches.forEach(match => {
        let matchNumbers = match.match(/\d+/g);
        matchNumbers.forEach(matchNumber => {
          formattedMatchNumbers += `[${matchNumber}]`;
        });

        text = text.replaceAll(match, formattedMatchNumbers);
        formattedMatchNumbers = '';
      });
    }

    return text;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

// Export for use in other modules
export default function createChatbot() {
  return new ChatbotClient();
}