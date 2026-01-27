// Globals for the app
let loadedDocument = null;
let chatbot = null;
let configData = null;

// Selected text clipboard for chatbot context
let clipboard = '';

// Chatbot panel div elements
let askWebSDKMainDiv = null;
let askWebSDKChattingDiv = null;
let assistantContentDiv = null;

// Chatbot panel conversation log
// to keep track of assistant and human messages
let conversationLog = [];
// Store question LIs for updating with contextual questions
let questionsLIs = [];

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

// Helper function to check if text contains any keyword from a list
const containsAny = (text, list) => {
  return list.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}