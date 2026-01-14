// Browser-compatible chatbot client
class ChatbotClient {
  constructor() {
    this.conversationHistory = [];
    this.options = {
      useEmptyHistory: false, // Keep document context from history
      conversationHistoryMaxTokens: 8000, // Increased limit for document questions - allows room for both history and document content
      skipHistoryUpdate: false // Update conversation history
    };
  }

  // Initialize chat interface for the WebViewer panel
  initialize = () => {
    // You can expand this to integrate with the WebViewer panel UI
    window.chatbot = this; // Make chatbot available globally for testing
  };

  // Trim conversation history to fit within token limit
  async trimHistoryForTokenLimit(history, maxTokens) {
    let tokenCount = 0;
    const trimmedHistory = [];

    for (let i = history.length - 1; i >= 0; i--) {
      const message = history[i];
      let messageTokenCount;

      try {
        // Use simple character-based estimation for token counting
        messageTokenCount = Math.ceil(message.content.length / 4);
      } catch (error) {
        // Fallback to estimation
        messageTokenCount = Math.ceil(message.content.length / 4);
      }

      if (tokenCount + messageTokenCount <= maxTokens) {
        trimmedHistory.unshift(message);
        tokenCount += messageTokenCount;
      } else {
        break;
      }
    }

    return trimmedHistory;
  }

  async sendMessage(promptLine, message, options = {}) {
    try {
      // For document-level operations, use increased token limit to preserve conversation history
      // Adjust token limits based on prompt type to balance document content and history
      let maxHistoryTokens = options.conversationHistoryMaxTokens || 8000;

      // For document questions, we need more room for history since we're sending full document
      if (promptLine.includes('DOCUMENT_')) {
        maxHistoryTokens = Math.max(maxHistoryTokens, 8000); // Ensure minimum 8000 tokens for document questions
      }

      const historyToSend = options.useEmptyHistory ? [] : await this.trimHistoryForTokenLimit(this.conversationHistory, maxHistoryTokens);

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
        const beforeLength = this.conversationHistory.length;

        // For document queries, extract only the question part to avoid storing redundant document content
        let historyMessage = message;
        if (promptLine.includes('DOCUMENT_')) {
          // Extract question from document queries to avoid token waste
          const questionMatch = message.match(/(?:Human Question|Question): (.+?)\n\nDocument Content:/);
          if (questionMatch) {
            historyMessage = questionMatch[1];
          } else {
            // Fallback: use first 200 chars if pattern not found, avoiding full document

            historyMessage = message.length > 200 ? message.substring(0, 200) + '... [document content excluded from history]' : message;
          }
        }

        this.conversationHistory.push(
          { role: 'human', content: `${promptLine}: ${historyMessage}` },
          { role: 'assistant', content: data.response }
        );

      } else {
        // History update was skipped
      }
      return data.response;
    } catch (error) {
      throw error;
    }
  }

  //Combine into single container for all bubble responses
  getAllText = async (promptType, createBubble, questionText = null) => {
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

            // Modify message based on whether it's a contextual question or history question
            let messageToSend;
            if (questionText && promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') {
              // Prepend the question to the document content
              messageToSend = `Question: ${questionText}\n\nDocument Content:\n${completeText}`;
            } else if (questionText && promptType === 'DOCUMENT_HISTORY_QUESTION') {
              // For history questions, prepend the human question to document content
              messageToSend = `Human Question: ${questionText}\n\nDocument Content:\n${completeText}`;
            } else {
              // Use document content as-is for other prompt types
              messageToSend = completeText;
            }

            // Handle different document question types with appropriate history settings
            let sendOptions = { ...this.options };

            // For DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY, we want history but need to be careful about contamination
            // Use higher token limit to ensure history is preserved
            if (promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') {
              sendOptions.conversationHistoryMaxTokens = 10000; // Extra room for both document and history
            }

            // For contextual questions, preserve conversation history to allow reference to previous interactions
            this.sendMessage(promptType, messageToSend, sendOptions).then(response => {
              let responseText = this.responseText(response);
              responseText = formatResponse(promptType, responseText);
              createBubble(responseText, 'assistant');

              // Only call transferContextualQuestions for the DOCUMENT_CONTEXTUAL_QUESTIONS prompt type
              if (promptType === 'DOCUMENT_CONTEXTUAL_QUESTIONS') {
                window.chatbot.transferContextualQuestions(window.chatbot.conversationHistory[1].content);
              }
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

            // Modify message based on whether it's a contextual question or history question
            let messageToSend;
            if (questionText && promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') {
              // Prepend the question to the document content
              messageToSend = `Question: ${questionText}\n\nDocument Content:\n${completeText}`;
            } else if (questionText && promptType === 'DOCUMENT_HISTORY_QUESTION') {
              // For history questions, prepend the human question to document content
              messageToSend = `Human Question: ${questionText}\n\nDocument Content:\n${completeText}`;
            } else {
              // Use document content as-is for other prompt types
              messageToSend = completeText;
            }

            // Handle different document question types with appropriate history settings
            let sendOptions = { ...this.options };

            // For DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY, we want history but need to be careful about contamination
            // Use higher token limit to ensure history is preserved
            if (promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') {
              sendOptions.conversationHistoryMaxTokens = 10000; // Extra room for both document and history
            }

            // For contextual questions, preserve conversation history to allow reference to previous interactions
            this.sendMessage(promptType, messageToSend, sendOptions).then(response => {
              let responseText = this.responseText(response);
              responseText = formatResponse(promptType, responseText);
              createBubble(responseText, 'assistant');

              // Only call transferContextualQuestions for the DOCUMENT_CONTEXTUAL_QUESTIONS prompt type
              if (promptType === 'DOCUMENT_CONTEXTUAL_QUESTIONS') {
                window.chatbot.transferContextualQuestions(window.chatbot.conversationHistory[1].content);
              }
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

  // Transfer contextual questions to global variable for UI update
  transferContextualQuestions = async (questionsText) => {

    this.questionsContextuallySound = [];
    let lines = questionsText.split(/•\s*/).filter(Boolean);
    lines.forEach(line => {
      this.questionsContextuallySound.push(line.trim());
    });

    if (!window.questionsLIs || window.questionsLIs.length === 0) {

      this.transferContextualQuestions(questionsText);

      return;
    }

    //find all LIs with promptType 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY' (these are the contextual questions)
    let index = 0;
    let updatedCount = 0;
    window.questionsLIs.forEach((configAndLiTags, arrayIndex) => {

      if (configAndLiTags[0] && configAndLiTags[0].promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') {

        if (this.questionsContextuallySound[index] !== undefined) {

          let li = configAndLiTags[1];
          if (li) {
            li.innerText = this.questionsContextuallySound[index];
          } else {
            console.warn(`No UI element found for contextual question ${index + 1}`);
          }

          let configItem = configAndLiTags[0];
          if (configItem) {
            configItem.content = this.questionsContextuallySound[index];
          }

          updatedCount++;
        } else {
          console.warn(`Question ${index + 1} is undefined! Available questions:`, this.questionsContextuallySound);
        }

        index++;
      }
    });

    //Now window.questionsLIs should be updated where all its LIs will be added to a UL element
    if (window.questionsLIs.length > 0) {
      //Now select all LIs within the parent and move them all inside a UL element.
      const parentElement = window.questionsLIs[0][1].parentElement;
      if (parentElement) {
        const ulElement = document.createElement('ul');
        // Move all LIs inside the UL
        window.questionsLIs.forEach(configAndLiTags => {
          ulElement.appendChild(configAndLiTags[1]);
        });
        parentElement.appendChild(ulElement);
      }
    }
  };

  clearHistory() {
    const previousLength = this.conversationHistory.length;
    this.conversationHistory = [];
  }

  clearContextualQuestions() {
    // Reset the contextual questions array
    this.questionsContextuallySound = [];

    // Reset UI questions to defaults using promptType instead of content matching
    if (window.questionsLIs && window.questionsLIs.length > 0) {
      let defaultQuestions = ["Loading...", "Loading...", "Loading..."];// These are question placeholders
      let index = 0;

      window.questionsLIs.forEach(configAndLiTags => {
        if (configAndLiTags[0] && configAndLiTags[0].promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') {
          let li = configAndLiTags[1];
          if (li) {
            li.innerText = defaultQuestions[index] || `Question ${index + 1}`;
          }

          let configItem = configAndLiTags[0];
          if (configItem) {
            configItem.content = defaultQuestions[index] || `Question ${index + 1}`;
          }
          index++;
        }
      });
    }
  }

  resetForNewDocument() {
    // Clear conversation history
    this.clearHistory();

    // Clear contextual questions completely
    this.clearContextualQuestions();

    // Reset options to defaults
    this.options = {
      useEmptyHistory: false,
      conversationHistoryMaxTokens: 8000,
      skipHistoryUpdate: false
    };

    // Reset any document-specific state
    this.questionsContextuallySound = [];
  }
}

// Export for use in other modules
export default function createChatbot() {
  return new ChatbotClient();
}