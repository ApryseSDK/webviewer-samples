import { Spinner } from './spinjs/spin.js';
const spinner = new Spinner(spinOptions);

const functionMap = {
  // Render the WebViewer chat panel
  'askWebSDKPanelRender': () => {
    // The main container div
    window.askWebSDKMainDiv = document.createElement('div');
    window.askWebSDKMainDiv.id = 'askWebSDKMainDiv';
    window.askWebSDKMainDiv.className = 'askWebSDKMainDivClass';

    //Top and Bottom container divs
    const askWebSDKQuestionDivTop = document.createElement('div');
    askWebSDKQuestionDivTop.id = 'askWebSDKQuestionDivTop';
    const askWebSDKQuestionDivBottom = document.createElement('div');
    askWebSDKQuestionDivBottom.id = 'askWebSDKQuestionDivBottom';

    // Header container div with document title
    let askWebSDKHeaderDiv = document.createElement('div');
    askWebSDKHeaderDiv.id = 'askWebSDKHeaderDiv';
    askWebSDKHeaderDiv.className = 'askWebSDKHeaderDivClass';
    askWebSDKHeaderDiv.innerText = `Document: ${window.WebViewer.getInstance().Core.documentViewer.getDocument().getFilename()}`;

    askWebSDKQuestionDivTop.appendChild(askWebSDKHeaderDiv);

    // Chatting container div with assistant and human messages
    window.askWebSDKChattingDiv = document.createElement('div');
    window.askWebSDKChattingDiv.id = 'askWebSDKChattingDiv';
    window.askWebSDKChattingDiv.className = 'askWebSDKChattingDivClass';

    // Initial assistant messages
    window.assistantMessages.forEach((message) => {
      let messageDiv = document.createElement('div');
      messageDiv.className = 'askWebSDKAssistantMessageClass';
      if (Array.isArray(message.content)) {
        message.content.forEach((contentItem) => {
          // Create different elements for info and question types
          window.assistantContentDiv = (contentItem.type === 'info') ? document.createElement('div') : document.createElement('li');
          window.assistantContentDiv.className = (contentItem.type === 'info') ? 'askWebSDKInfoMessageClass' : 'askWebSDKQuestionMessageClass';
          if (contentItem.type === 'question') {

            // Store question LIs for later updating with contextual questions
            let configAndLiTags = [];
            configAndLiTags.push(contentItem); //Stores type, content, promptType
            configAndLiTags.push(window.assistantContentDiv); //Stores the actual LI element
            questionsLIs.push(configAndLiTags);

            window.assistantContentDiv.onmouseover = () => {
              window.assistantContentDiv.className = 'askWebSDKQuestionMessageHoverClassOnMouseOver';
            };
            window.assistantContentDiv.onmouseout = () => {
              window.assistantContentDiv.className = 'askWebSDKQuestionMessageHoverClassOnMouseOut';
            };
            window.assistantContentDiv.onclick = () => {
              createBubble(contentItem.content, 'human');
              // Pass question content for all question types, including contextual questions
              askQuestionByPrompt(contentItem.promptType, contentItem.content);
              window.assistantContentDiv.className = 'askWebSDKQuestionMessageHoverClassOnClick';
            };
          }
          window.assistantContentDiv.innerText = contentItem.content;
          messageDiv.appendChild(window.assistantContentDiv);
        });

      } else
        messageDiv.innerText = `${message.content}`;

      window.askWebSDKChattingDiv.appendChild(messageDiv);
    });

    // maintain the conversation sequence
    if (window.conversationLog.length > 0) {
      window.conversationLog.forEach((chatMessage) => {
        let messageDiv = document.createElement('div');
        messageDiv.className = (chatMessage.role === 'assistant') ? 'askWebSDKAssistantMessageClass' : 'askWebSDKHumanMessageClass';
        messageDiv.innerHTML = chatMessage.content;
        window.askWebSDKChattingDiv.appendChild(messageDiv);
      });
    }

    askWebSDKQuestionDivTop.appendChild(window.askWebSDKChattingDiv);
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
      if (event.key === 'Enter') {
        askWebSDKQuestionButton.click();
      }
    };

    let askWebSDKQuestionButton = document.createElement('button');
    askWebSDKQuestionButton.id = 'askWebSDKQuestionButton';
    askWebSDKQuestionButton.className = 'askWebSDKQuestionButtonClass';
    askWebSDKQuestionButton.innerText = 'Send';
    askWebSDKQuestionButton.onclick = () => {
      let question = askWebSDKQuestionInput.value.trim();
      if (question === '') {
        createBubble('Please ask a question first.', 'assistant');
        return;
      }

      createBubble(question, 'human');

      // Check if the question is a summarization request
      if (containsAny(question, window.keywords.summarization)) {
        // summarize entire document
        if (question.toLowerCase().includes('document') &&
          !containsAny(question, window.keywords.area)) {
          askQuestionByPrompt('DOCUMENT_SUMMARY');
        }
        // summarize selected text in document
        if (containsAny(question, window.keywords.selection)) {
          if (window.selectedText && window.selectedText.trim() !== '')
            summarizeSelectedText();
          else
            createBubble('Please select text in the document first.', 'assistant');
        }

        if (!question.toLowerCase().includes('document')
          && !containsAny(question, window.keywords.selection)) {
          createBubble('Please specify if you want to summarize the entire document or selected text.', 'assistant');
        }
      }
      // Any other questions about the document
      else {
        // Check if this is a history-related question
        const isHistoryQuestion = containsAny(question, window.keywords.history);

        if (isHistoryQuestion) {
          // Use document-aware flow for history questions
          askQuestionByPrompt('DOCUMENT_HISTORY_QUESTION', question);
        } else {
          // Start spinning on main div
          spinner.spin(window.askWebSDKMainDiv);

          // Send question as document query
          window.chatbot.sendMessage('DOCUMENT_QUESTION', askWebSDKQuestionInput.value.trim(), window.chatbot.options).then(response => {
            spinner.stop();
            let responseText = window.chatbot.responseText(response);
            responseText = formatText('DOCUMENT_QUESTION', responseText);
            createBubble(responseText, 'assistant');
          }).catch(error => {
            spinner.stop();
            createBubble(`Error: ${error.message}`, 'assistant');
          });
        }
      }

      askWebSDKQuestionInput.value = ''; // Clear input box
    };

    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionInput);
    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionButton);
    askWebSDKQuestionDivBottom.appendChild(askWebSDKQuestionDiv);

    window.askWebSDKMainDiv.appendChild(askWebSDKQuestionDivTop);
    window.askWebSDKMainDiv.appendChild(askWebSDKQuestionDivBottom);

    return window.askWebSDKMainDiv;
  },
  // Handle selected text summary popup click
  'askWebSDKPopupClick': () => {
    createBubble('Summarize the selected text.', 'human');
    summarizeSelectedText();
  },
};

// Function to summarize selected text
function summarizeSelectedText() {
  // Start spinning on main div
  spinner.spin(window.askWebSDKMainDiv);

  // Combine into single container for all bubble responses
  window.chatbot.sendMessage('SELECTED_TEXT_SUMMARY', window.selectedText, window.chatbot.options).then(response => {
    spinner.stop();
    let responseText = window.chatbot.responseText(response);
    responseText = formatText('SELECTED_TEXT_SUMMARY', responseText);
    createBubble(responseText, 'assistant');
  }).catch(error => {
    spinner.stop();
    createBubble(`Error: ${error.message}`, 'assistant');
  });
}

// Function to ask question by prompt
function askQuestionByPrompt(prompt, questionText = null) {
  // Start spinning on main div
  spinner.spin(window.askWebSDKMainDiv);

  // Create a wrapper callback that stops the spinner after createBubble is called
  const callbackWrapper = (...args) => {

    // Only create bubble if not DOCUMENT_CONTEXTUAL_QUESTIONS
    if (prompt !== 'DOCUMENT_CONTEXTUAL_QUESTIONS')
      createBubble(...args);
    spinner.stop();
  };

  window.chatbot.getAllText(prompt, callbackWrapper, questionText);
}

// Expose askQuestionByPrompt globally for use in index.js
window.askQuestionByPrompt = askQuestionByPrompt;

export default functionMap;