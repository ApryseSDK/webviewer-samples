// Globals for the app
const APP_SITE_NAME = "WebViewer Ask AI";
const ASK_WEB_SDK_ICO = "<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" fill=\\\"currentColor\\\" viewBox=\\\"0 0 300 300\\\" focusable=\\\"false\\\" class=\\\"chakra-icon css-1iu0mhe\\\"><path d=\\\"M135.9 93.8c-2.5 0-4.9-1.2-6.3-3.5l-19.8-31.7c-2.2-3.5-1.1-8.1 2.4-10.3s8.1-1.1 10.3 2.4l19.8 31.7c2.2 3.5 1.1 8.1-2.4 10.3-1.3.8-2.7 1.1-4 1.1m28.8 4.1c-1.3 0-2.7-.4-3.9-1.1-3.5-2.2-4.5-6.8-2.4-10.3l19.8-31.7c2.2-3.5 6.8-4.5 10.3-2.4 3.5 2.2 4.5 6.8 2.4 10.3L171 94.4c-1.4 2.3-3.8 3.5-6.3 3.5m-14.2 81.3h25c2.8 0 3.4.8 3.1 3.6-1.5 14.1-14.2 25-28.7 24.9-14.4-.2-26.6-11.2-28-25.3-.2-2.4.7-3.2 3-3.2zm52.7-52.1c9.2 0 16.4 7.2 16.5 16.4 0 9-7.3 16.4-16.2 16.4-9.1 0-16.6-7.3-16.6-16.3-.2-9 7.2-16.4 16.3-16.5m-105.7.1c9.1 0 16.4 7.4 16.4 16.5-.1 9.1-7.5 16.4-16.6 16.3-8.9-.1-16.2-7.4-16.3-16.4 0-9.1 7.4-16.5 16.5-16.4\\\" class=\\\"chat_svg__st0\\\"></path><path d=\\\"M203.4 240.4H97.2c-35 0-63.6-28.5-63.6-63.6v-28.1c0-35 28.5-63.6 63.6-63.6h106.2c35 0 63.6 28.5 63.6 63.6v28.1c-.1 35-28.6 63.6-63.6 63.6M97.2 102.9c-25.2 0-45.8 20.5-45.8 45.8v28.1c0 25.2 20.5 45.8 45.8 45.8h106.2c25.2 0 45.8-20.5 45.8-45.8v-28.1c0-25.2-20.5-45.8-45.8-45.8zm-72.3 29.2c-10.7 0-19.4 7-19.4 15.6v30.1c0 8.6 8.7 15.6 19.4 15.6h.7v-61.3zm250.8 0c10.7 0 19.4 7 19.4 15.6v30.1c0 8.6-8.7 15.6-19.4 15.6h-.7v-61.3z\\\" class=\\\"chat_svg__st0\\\"></path></svg>";

const setSelectedText = (selectedText) => {
  window.selectedText = selectedText;
}

let conversationLog = [];
window.conversationLog = conversationLog;

let questionsLIs = [];
window.questionsLIs = questionsLIs;

const keywords = {
  summarization: ['summarize', 'summary', 'summarization'],
  area: ['text', 'paragraph', 'area'],
  selection: ['selected', 'selection', 'highlighted'],
  history: ['history', 'previous', 'generated', 'earlier', 'asked', 'before', 'questions']
};
window.keywords = keywords;

const assistantMessages = [
  {
    type: 'info',
    content: [
      {
        type: 'info',
        content: 'Here are some suggested questions to get you started:',
        promptType: '',
      },
      {
        type: 'question',
        content: 'Summarize Document',
        promptType: 'DOCUMENT_SUMMARY'
      },
      {
        type: 'question',
        content: 'List Keywords',
        promptType: 'DOCUMENT_KEYWORDS'
      },
      {
        type: 'question',
        content: 'Loading...',
        promptType: 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY'
      },
      {
        type: 'question',
        content: 'Loading...',
        promptType: 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY'
      },
      {
        type: 'question',
        content: 'Loading...',
        promptType: 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY'
      }
    ]
  }
];
window.assistantMessages = assistantMessages;

const containsAny = (text, list) => {
  return list.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}

const spinOptions = {
  lines: 8, // The number of lines to draw
  length: 15, // The length of each line
  width: 10, // The line thickness
  radius: 15, // The radius of the inner circle
  scale: 0.1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: 'var(--note)', // CSS color or array of colors
  fadeColor: 'var(--modal-negative-space)', // CSS color or array of colors
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px var(--note-box-shadow)', // Box-shadow for the lines
  zIndex: 2000000000, // The z-index (defaults to 2e9)
  className: 'spinner', // The CSS class to assign to the spinner
  position: 'absolute', // Element positioning
};

let askWebSDKMainDiv = null;
window.askWebSDKMainDiv = askWebSDKMainDiv;

let askWebSDKChattingDiv = null;
window.askWebSDKChattingDiv = askWebSDKChattingDiv;

let assistantContentDiv = null;
window.assistantContentDiv = assistantContentDiv;

// Function to create a chat bubble
const createBubble = (content, role) => {
  window.conversationLog.push({ role: role, content: content });

  let messageDiv = document.createElement('div');
  messageDiv.className = (role === 'assistant') ? 'askWebSDKAssistantMessageClass' : 'askWebSDKHumanMessageClass';
  messageDiv.innerHTML = content;
  window.askWebSDKChattingDiv.appendChild(messageDiv);
  window.askWebSDKChattingDiv.scrollTop = window.askWebSDKChattingDiv.scrollHeight;
}

// Format response to include cited page links
// and page breaks based on prompt type
const formatResponse = (promptType, text) => {
  switch (promptType) {
    case 'DOCUMENT_SUMMARY':
    case 'SELECTED_TEXT_SUMMARY':
    case 'DOCUMENT_QUESTION':
      // Add page breaks to page citation ends with period
      text = text.replace(/(\d+\])\./g, '$1.<br/><br/>');
      break;
    case 'DOCUMENT_CONTEXTUAL_QUESTIONS':
      // Format bullet points with line breaks
      let lines_contextual_questions = text.split(/•\s*/).filter(Boolean);
      text = lines_contextual_questions.map(line => `• ${line.trim()}`).join('<br/>');
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
  text = separateGroupedCitations(text, /\[\d+(?:\s*,\s*\d+)+\]/g);

  // Separate citations range on form [1-3] to individual [1][2][3]
  text = separateGroupedCitations(text, /\[\d+(?:\s*-\s*\d+)+\]/g);

  if (promptType === 'DOCUMENT_KEYWORDS') {
    let lines = text.split('<br/>').filter(Boolean);
    lines.forEach((line, index) => {
      const formattedLine = line.replace(/(\[\d+])(?:\1)+/g, '$1');
      lines[index] = formattedLine;
    });
    text = lines.join('<br/>');
  }

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
        const pageLink = `<button class="page-link" type="button" style="color:blue;" onclick="window.WebViewer.getInstance().Core.documentViewer.setCurrentPage(${pageNumber}, true);">[${pageNumber}]</button>`;
        text = text.replaceAll(match, `${pageLink}`);
      }
    });
  }

  return text;
}

// Helper to separate grouped citations on form [1, 2, 3] or [1-3] into individual [1][2][3]
const separateGroupedCitations = (text, pattern) => {
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