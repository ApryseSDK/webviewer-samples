// Globals for the app
globalThis.loadedDocument = null;
globalThis.chatbot = null;
globalThis.configData = null;

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
globalThis.conversationLog = [];
// Store question LIs for updating with contextual questions
globalThis.questionsLIs = [];

// Helper function to check if text contains any keyword from a list
const containsAny = (text, list) => {
  return list.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}