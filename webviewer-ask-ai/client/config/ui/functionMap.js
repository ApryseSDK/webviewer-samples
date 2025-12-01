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
  'askWebSDKPanelRender': () => {
    askWebSDKMainDiv = document.createElement('div');
    askWebSDKMainDiv.id = 'askWebSDKMainDiv';
    askWebSDKMainDiv.className = 'askWebSDKMainDivClass';

    let askWebSDKHeaderDiv = document.createElement('div');
    askWebSDKHeaderDiv.id = 'askWebSDKHeaderDiv';
    askWebSDKHeaderDiv.className = 'askWebSDKHeaderDivClass';

    let askWebSDKHeaderTitle = document.createElement('h4');
    askWebSDKHeaderTitle.id = 'askWebSDKHeaderTitle';
    askWebSDKHeaderTitle.className = 'askWebSDKHeaderTitleClass';
    askWebSDKHeaderTitle.innerText = `Document: ${window.WebViewer.getInstance().Core.documentViewer.getDocument().getFilename()}`;
    askWebSDKHeaderDiv.appendChild(askWebSDKHeaderTitle);
    askWebSDKMainDiv.appendChild(askWebSDKHeaderDiv);

    askWebSDKChattingDiv = document.createElement('div');
    askWebSDKChattingDiv.id = 'askWebSDKChattingDiv';
    askWebSDKChattingDiv.className = 'askWebSDKChattingDivClass';
    systemMessages.forEach((message) => {
      let messageDiv = document.createElement('div');
      messageDiv.className = 'askWebSDKSystemMessageClass';
      if (Array.isArray(message.content)) {
        message.content.forEach((contentItem) => {
          let systemContentDiv = null;
          if (contentItem.type === 'info')
            systemContentDiv = document.createElement('div');
          else
            systemContentDiv = document.createElement('li');

          systemContentDiv.style.marginTop = '5px';
          systemContentDiv.className = (contentItem.type === 'info') ? 'askWebSDKInfoMessageClass' : 'askWebSDKQuestionMessageClass';
          if (contentItem.type === 'question') {
            systemContentDiv.style.cursor = 'pointer';
            systemContentDiv.addEventListener('mouseover', () => {
              systemContentDiv.style.textDecoration = 'underline';
              systemContentDiv.style.color = 'blue';
            });
            systemContentDiv.addEventListener('mouseout', () => {
              systemContentDiv.style.textDecoration = 'none';
              systemContentDiv.style.color = 'black';
            });
            systemContentDiv.addEventListener('click', () => {
              createBubble(contentItem.content, 'user');
              const spinner = new window.SpinningWheel();
              spinner.start(askWebSDKMainDiv);

              if (contentItem.id === 1) {
                window.chatbot.getAllText(contentItem.promptType, createBubble);
                spinner.stop();
              } else if (contentItem.id === 2) {
                window.chatbot.getAllText(contentItem.promptType, createBubble);
                spinner.stop();
              }
            });
          }
          systemContentDiv.innerText = contentItem.content;
          messageDiv.appendChild(systemContentDiv);
        });
      } else {
        messageDiv.innerText = message.content;
      }
      askWebSDKChattingDiv.appendChild(messageDiv);
    });

    askWebSDKMainDiv.appendChild(askWebSDKChattingDiv);

    let askWebSDKQuestionDiv = document.createElement('div');
    askWebSDKQuestionDiv.id = 'askWebSDKQuestionDiv';
    askWebSDKQuestionDiv.className = 'askWebSDKQuestionDivClass';

    let askWebSDKQuestionInput = document.createElement('input');
    askWebSDKQuestionInput.id = 'askWebSDKQuestionInput';
    askWebSDKQuestionInput.className = 'askWebSDKQuestionInputClass';
    askWebSDKQuestionInput.type = 'text';
    askWebSDKQuestionInput.placeholder = 'Ask your question here...';
    askWebSDKQuestionInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter')
        askWebSDKQuestionButton.click();
    });

    let askWebSDKQuestionButton = document.createElement('button');
    askWebSDKQuestionButton.id = 'askWebSDKQuestionButton';
    askWebSDKQuestionButton.className = 'askWebSDKQuestionButtonClass';
    askWebSDKQuestionButton.innerText = 'Send';
    askWebSDKQuestionButton.addEventListener('click', () => {
      if (askWebSDKQuestionInput.value.trim() !== '') {
        createBubble(askWebSDKQuestionInput.value.trim(), 'user');

        // Start loading spinner on main div to block all interactions
        const spinner = new window.SpinningWheel();
        spinner.start(askWebSDKMainDiv);

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
    });

    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionInput);
    askWebSDKQuestionDiv.appendChild(askWebSDKQuestionButton);
    askWebSDKMainDiv.appendChild(askWebSDKQuestionDiv);

    return askWebSDKMainDiv;
  },
  'askWebSDKPopupClick': () => {
    createBubble('Summarize the selected text.', 'user');

    // Start loading spinner for selected text summary on main div
    const spinner = new window.SpinningWheel();
    spinner.start(askWebSDKMainDiv);

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

function createBubble(content, role) {
  let messageDiv = document.createElement('div');
  messageDiv.className = (role === 'system') ? 'askWebSDKSystemMessageClass' : 'askWebSDKUserMessageClass';
  messageDiv.innerHTML = content;
  askWebSDKChattingDiv.appendChild(messageDiv);
}

export default functionMap;