import { Spinner } from './spinjs/spin.js';
const spinOptions = {
  lines: 13, // The number of lines to draw
  length: 38, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#ffffff', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  zIndex: 2000000000, // The z-index (defaults to 2e9)
  className: 'spinner', // The CSS class to assign to the spinner
  position: 'absolute', // Element positioning
};
let askWebSDKMainDiv = null;
let askWebSDKChattingDiv = null;
const systemMessages = [
  {
    type: 'welcoming',
    content: `Hello, I'm ${APP_SITE_NAME}. How can I help you?`,
  },
  {
    type: 'info',
    content: `Select the options below to get started. You can also select text in the document and click the popup to summarize the selected text.`,
  },
  {
    type: 'info',
    content: [
      {
        id: 0,
        type: 'info',
        content: 'Choose:',
        promptType: '',
      },
      {
        id: 1,
        type: 'question',
        content: 'Summarize Document',
        promptType: 'DOCUMENT_SUMMARY'
      },
      {
        id: 2,
        type: 'question',
        content: 'List Keywords',
        promptType: 'DOCUMENT_KEYWORDS'
      }
    ]
  }
];

const functionMap = {
  // Render the WebViewer chat panel
  'askWebSDKPanelRender': () => {
    // The main container div
    askWebSDKMainDiv = document.createElement('div');
    askWebSDKMainDiv.id = 'askWebSDKMainDiv';
    askWebSDKMainDiv.className = 'askWebSDKMainDivClass';

    // Header container div with document title
    let askWebSDKHeaderDiv = document.createElement('div');
    askWebSDKHeaderDiv.id = 'askWebSDKHeaderDiv';
    askWebSDKHeaderDiv.className = 'askWebSDKHeaderDivClass';

    let askWebSDKHeaderTitle = document.createElement('h4');
    askWebSDKHeaderTitle.id = 'askWebSDKHeaderTitle';
    askWebSDKHeaderTitle.className = 'askWebSDKHeaderTitleClass';
    askWebSDKHeaderTitle.innerText = `Document: ${window.WebViewer.getInstance().Core.documentViewer.getDocument().getFilename()}`;
    askWebSDKHeaderDiv.appendChild(askWebSDKHeaderTitle);
    askWebSDKMainDiv.appendChild(askWebSDKHeaderDiv);

    // Chatting container div with system and user messages
    askWebSDKChattingDiv = document.createElement('div');
    askWebSDKChattingDiv.id = 'askWebSDKChattingDiv';
    askWebSDKChattingDiv.className = 'askWebSDKChattingDivClass';
    systemMessages.forEach((message) => {
      let messageDiv = document.createElement('div');
      messageDiv.className = 'askWebSDKSystemMessageClass';
      if (Array.isArray(message.content)) {
        message.content.forEach((contentItem) => {
          let systemContentDiv = (contentItem.type === 'info') ? document.createElement('div') : document.createElement('li');
          systemContentDiv.className = (contentItem.type === 'info') ? 'askWebSDKInfoMessageClass' : 'askWebSDKQuestionMessageClass';
          if (contentItem.type === 'question') {
            systemContentDiv.onmouseover = () => {
              systemContentDiv.style.textDecoration = 'underline';
              systemContentDiv.style.color = 'blue';
            };
            systemContentDiv.onmouseout = () => {
              systemContentDiv.style.textDecoration = 'none';
              systemContentDiv.style.color = 'black';
            };
            systemContentDiv.onclick = () => {
              createBubble(contentItem.content, 'user');
              const spinner = new Spinner(spinOptions);
              spinner.spin(askWebSDKMainDiv);
              
              // Create a wrapper callback that stops the spinner after createBubble is called
              const callbackWrapper = (...args) => {
                createBubble(...args);
                spinner.stop();
              };
              
              window.chatbot.getAllText(contentItem.promptType, callbackWrapper);
            };
          }
          systemContentDiv.innerText = contentItem.content;
          messageDiv.appendChild(systemContentDiv);
        });
      } else
        messageDiv.innerText = message.content;

      askWebSDKChattingDiv.appendChild(messageDiv);
    });

    askWebSDKMainDiv.appendChild(askWebSDKChattingDiv);

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
      if (askWebSDKQuestionInput.value.trim() !== '') {
        createBubble(askWebSDKQuestionInput.value.trim(), 'user');

        // Start loading spinner on main div to block all interactions
        const spinner = new Spinner(spinOptions);
        spinner.spin(askWebSDKMainDiv);

        // Send question as document query
        window.chatbot.sendMessage('DOCUMENT_QUESTION', askWebSDKQuestionInput.value.trim()).then(response => {
          spinner.stop();
          let responseText = window.chatbot.responseText(response);
          responseText = window.chatbot.formatText('DOCUMENT_QUESTION', responseText);
          createBubble(responseText, 'system');
        }).catch(error => {
          spinner.stop();
          createBubble(`Error: ${error.message}`, 'system');
        });
      }
    };

    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionInput);
    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionButton);
    askWebSDKMainDiv.appendChild(askWebSDKQuestionDiv);

    return askWebSDKMainDiv;
  },
  // Handle selected text summary popup click
  'askWebSDKPopupClick': () => {
    createBubble('Summarize the selected text.', 'user');

    // Start loading spinner for selected text summary on main div
    const spinner = new Spinner(spinOptions);
    spinner.spin(askWebSDKMainDiv);

    //Combine into single container for all bubble responses
    window.chatbot.sendMessage('SELECTED_TEXT_SUMMARY', window.selectedText).then(response => {
      spinner.stop();
      let responseText = window.chatbot.responseText(response);
      responseText = window.chatbot.formatText('SELECTED_TEXT_SUMMARY', responseText);
      createBubble(responseText, 'system');
    }).catch(error => {
      spinner.stop();
      createBubble(`Error: ${error.message}`, 'system');
    });
  },
};

// Function to create a chat bubble
function createBubble(content, role) {
  let messageDiv = document.createElement('div');
  messageDiv.className = (role === 'system') ? 'askWebSDKSystemMessageClass' : 'askWebSDKUserMessageClass';
  messageDiv.innerHTML = content;
  askWebSDKChattingDiv.appendChild(messageDiv);
  askWebSDKChattingDiv.scrollTop = askWebSDKChattingDiv.scrollHeight;
}

export default functionMap;