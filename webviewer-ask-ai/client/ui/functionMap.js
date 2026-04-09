function handleSummarization(question) {
  // summarize entire document
  if (question.toLowerCase().includes('document') &&
    !containsAny(question, configData.KEYWORDS.area)) {
    chatbot.askQuestionByPrompt('DOCUMENT_SUMMARY');
  }
  // summarize selected text (clipboard) in document
  if (containsAny(question, configData.KEYWORDS.selection)) {
    if (clipboard && clipboard.trim() !== '')
      chatbot.summarizeTextByPrompt('SELECTED_TEXT_SUMMARY', clipboard);
    else
      chatbot.bubble('Please select text in the document first.', 'assistant');
  }

  if (!question.toLowerCase().includes('document')
    && !containsAny(question, configData.KEYWORDS.selection)) {
    chatbot.bubble('Please specify if you want to summarize the entire document or selected text.', 'assistant');
  }
}

const functionMap = {
  // Render the WebViewer chat panel
  'askWebSDKPanelRender': () => {

    if (!configData.KEYWORDS) {
      console.error('Failed to load keywords from config.');
      return;
    }

    if (!configData.ASSISTANT_MESSAGES) {
      console.error('Failed to load assistant messages from config.');
      return;
    }

    // The main container div
    globalThis.askWebSDKMainDiv = document.createElement('div');
    globalThis.askWebSDKMainDiv.id = 'askWebSDKMainDiv';
    globalThis.askWebSDKMainDiv.className = 'askWebSDKMainDivClass';

    //Top and Bottom container divs
    const askWebSDKQuestionDivTop = document.createElement('div');
    askWebSDKQuestionDivTop.id = 'askWebSDKQuestionDivTop';
    const askWebSDKQuestionDivBottom = document.createElement('div');
    askWebSDKQuestionDivBottom.id = 'askWebSDKQuestionDivBottom';

    // Header container div with document title
    let askWebSDKHeaderDiv = document.createElement('div');
    askWebSDKHeaderDiv.id = 'askWebSDKHeaderDiv';
    askWebSDKHeaderDiv.className = 'askWebSDKHeaderDivClass';
    askWebSDKHeaderDiv.innerText = `Document: ${loadedDocument.fileName}`;

    askWebSDKQuestionDivTop.appendChild(askWebSDKHeaderDiv);

    // Chatting container div with assistant and human messages
    globalThis.askWebSDKChattingDiv = document.createElement('div');
    globalThis.askWebSDKChattingDiv.id = 'askWebSDKChattingDiv';
    globalThis.askWebSDKChattingDiv.className = 'askWebSDKChattingDivClass';

    // Initial assistant messages
    configData.ASSISTANT_MESSAGES.forEach((message) => {
      let messageDiv = document.createElement('div');
      messageDiv.className = 'askWebSDKAssistantMessageClass';
      if (Array.isArray(message.content)) {
        message.content.forEach((contentItem) => {
          // Create different elements for info and question types
          globalThis.assistantContentDiv = (contentItem.type === 'info') ? document.createElement('div') : document.createElement('li');
          globalThis.assistantContentDiv.className = (contentItem.type === 'info') ? 'askWebSDKInfoMessageClass' : 'askWebSDKQuestionMessageClass';
          if (contentItem.type === 'question') {

            // Store question LIs for later updating with contextual questions
            let configAndLiTags = [];
            configAndLiTags.push(contentItem, globalThis.assistantContentDiv); // Stores type, content, promptType and the actual LI element
            questionsLIs.push(configAndLiTags);

            globalThis.assistantContentDiv.onmouseover = () => {
              globalThis.assistantContentDiv.className = 'askWebSDKQuestionMessageHoverClassOnMouseOver';
            };
            globalThis.assistantContentDiv.onmouseout = () => {
              globalThis.assistantContentDiv.className = 'askWebSDKQuestionMessageHoverClassOnMouseOut';
            };
            globalThis.assistantContentDiv.onclick = () => {
              chatbot.bubble(contentItem.content, 'human');
              // Pass question content for all question types, including contextual questions
              chatbot.askQuestionByPrompt(contentItem.promptType, contentItem.content);
              globalThis.assistantContentDiv.className = 'askWebSDKQuestionMessageHoverClassOnClick';
            };
          }
          globalThis.assistantContentDiv.innerText = contentItem.content;
          messageDiv.appendChild(globalThis.assistantContentDiv);
        });

      } else
        messageDiv.innerText = `${message.content}`;

      globalThis.askWebSDKChattingDiv.appendChild(messageDiv);
    });

    // maintain the chatbot panel conversation sequence
    if (conversationLog.length > 0) {
      conversationLog.forEach((chatMessage) => {
        let messageDiv = document.createElement('div');
        messageDiv.className = (chatMessage.role === 'assistant') ? 'askWebSDKAssistantMessageClass' : 'askWebSDKHumanMessageClass';
        messageDiv.innerHTML = chatMessage.content;
        globalThis.askWebSDKChattingDiv.appendChild(messageDiv);
      });
    }

    askWebSDKQuestionDivTop.appendChild(globalThis.askWebSDKChattingDiv);
    // Question input container div with input box and send button
    let askWebSDKQuestionDiv = document.createElement('div');
    askWebSDKQuestionDiv.id = 'askWebSDKQuestionDiv';
    askWebSDKQuestionDiv.className = 'askWebSDKQuestionDivClass';

    let askWebSDKQuestionInput = document.createElement('input');
    askWebSDKQuestionInput.id = 'askWebSDKQuestionInput';
    askWebSDKQuestionInput.className = 'askWebSDKQuestionInputClass';
    askWebSDKQuestionInput.type = 'text';
    askWebSDKQuestionInput.placeholder = 'Ask your question here...';
    askWebSDKQuestionInput.onkeydown = (event) => {
      if (event.key === 'Enter')
        askWebSDKQuestionButton.click();
    };

    let askWebSDKQuestionButton = document.createElement('button');
    askWebSDKQuestionButton.id = 'askWebSDKQuestionButton';
    askWebSDKQuestionButton.className = 'askWebSDKQuestionButtonClass';
    askWebSDKQuestionButton.innerText = 'Send';

    askWebSDKQuestionButton.onclick = () => {
      let question = askWebSDKQuestionInput.value.trim();
      if (question === '') {
        chatbot.bubble('Please ask a question first.', 'assistant');
        return;
      }

      chatbot.bubble(question, 'human');

      // Check if the question is a summarization request
      if (containsAny(question, configData.KEYWORDS.summarization)) {
        handleSummarization(question);
      }
      // Any other questions about the document
      else if (containsAny(question, configData.KEYWORDS.history)) {
        // Use document-aware flow for history questions
        chatbot.askQuestionByPrompt('DOCUMENT_HISTORY_QUESTION', question);
      } else {
        chatbot.summarizeTextByPrompt('DOCUMENT_QUESTION', question);
      }

      askWebSDKQuestionInput.value = ''; // Clear input box
    };

    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionInput);
    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionButton);
    askWebSDKQuestionDivBottom.appendChild(askWebSDKQuestionDiv);

    globalThis.askWebSDKMainDiv.appendChild(askWebSDKQuestionDivTop);
    globalThis.askWebSDKMainDiv.appendChild(askWebSDKQuestionDivBottom);

    return globalThis.askWebSDKMainDiv;
  },
  // Handle selected text (clipboard) summary popup click
  'askWebSDKPopupClick': () => {
    chatbot.bubble('Summarize the selected text.', 'human');
    chatbot.summarizeTextByPrompt('SELECTED_TEXT_SUMMARY', clipboard);
  },
};

export default functionMap;