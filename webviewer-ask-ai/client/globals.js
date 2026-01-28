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

// Helper function to check if text contains any keyword from a list
const containsAny = (text, list) => {
  return list.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}