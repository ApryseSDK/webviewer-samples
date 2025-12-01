// Browser-compatible chatbot client
class ChatbotClient {

  // Initialize chat interface for the WebViewer panel
  initialize = () => {

    // You can expand this to integrate with the WebViewer Ask panel UI
    window.chatbot = this; // Make chatbot available globally for testing
  };

  async sendMessage(promptLine, message) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          promptType: promptLine
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.response;
    } catch (error) {
      throw error;
    }
  }

  getAllText = async (promptType, createBubble) => {
    //Combine into single container for all bubble responses
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

            this.sendMessage(promptType, completeText).then(response => {
              let responseText = this.responseText(response);
              responseText = this.formatText(promptType, responseText);
              createBubble(responseText, 'system');
            }).catch(error => {
              createBubble(`Error: ${error.message}`, 'system');
            });
          }
        } catch (error) {
          pageTexts[i - 1] = `<<PAGE_BREAK>> Page ${i}\n[Error loading page content]`;
          loadedPages++;

          // Still proceed if all pages are processed (even with errors)
          if (loadedPages === pageCount) {
            const completeText = pageTexts.join('\n\n');

            this.sendMessage(promptType, completeText).then(response => {
              let responseText = this.responseText(response);
              responseText = this.formatText(promptType, responseText);
              createBubble(responseText, 'system');
            }).catch(error => {
              createBubble(`Error: ${error.message}`, 'system');
            });
          }
        }
      }
    });
  };

  // Function to extract text from OpenAI response via LangChain
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

  formatText = (promptType, text) => {
    let matches = text.match(/\[\d+(?:\s*,\s*\d+)+\]/g);
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

    switch (promptType) {
      case 'DOCUMENT_SUMMARY':
      case 'SELECTED_TEXT_SUMMARY':
      case 'DOCUMENT_QUESTION':
        matches = text.match(/\[\d+\][.]/g);
        break;
      case 'DOCUMENT_KEYWORDS':
        matches = text.match(/\[\d+\]/g);
        break;
      default:
        break;
    }

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
          if (promptType === 'DOCUMENT_KEYWORDS')
            text = text.replaceAll(match, `${pageLink}`);
          else
            text = text.replaceAll(match, `${pageLink}.<br/>`);
        }
      });
    }

    if (promptType === 'DOCUMENT_KEYWORDS') {
      let lines = text.split(/•\s*/).filter(Boolean);
      text = lines.map(line => `• ${line.trim()}`).join('<br/>');
    }

    return text;
  }
}

// Export for use in other modules
export default function createChatbot() {
  return new ChatbotClient();
}