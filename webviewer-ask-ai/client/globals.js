// Globals for the app
let loadedDocument = null;
let chatbot = null;
let configData = null;

// Selected text clipboard for chatbot context
let clipboard = '';

// Chatbot panel div elements
let askWebSDKMainDiv = null;
globalThis.askWebSDKMainDiv = askWebSDKMainDiv;
let askWebSDKChattingDiv = null;
globalThis.askWebSDKChattingDiv = askWebSDKChattingDiv;
let assistantContentDiv = null;
globalThis.assistantContentDiv = assistantContentDiv;

// Chatbot panel conversation log
// to keep track of assistant and human messages
let conversationLog = [];
// Store question LIs for updating with contextual questions
let questionsLIs = [];

// Helper function to check if text contains any keyword from a list
const containsAny = (text, list) => {
  return list.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}