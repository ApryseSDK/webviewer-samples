import ChatbotResponse from './response.js';
import { Spinner } from '../libs/spinjs/spin.js';

const spinner = new Spinner(spinOptions);

// Browser-compatible chatbot client
class Chatbot {
  constructor() {
    // Preserve messages history sent to AI model
    // to allow reference to previous interactions
    this.messagesHistory = [];
    this.messagesHistoryOptions = {
      // Keep document context from messages history
      useEmpty: false,
      // Increased limit for document questions
      // allows room for both messages history and document content
      maxTokens: 8000,
      // Update messages history
      skipUpdate: false
    };
  }

  // Trim messages history to fit within token limit
  async trimHistoryForTokenLimit(messagesHistory, maxTokens) {
    let tokenCount = 0;
    const trimmedHistory = [];

    for (let i = messagesHistory.length - 1; i >= 0; i--) {
      const message = messagesHistory[i];
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
      } else
        break;
    }

    return trimmedHistory;
  }

  async sendMessage(promptLine, message) {
    try {
      // For document-level operations, use increased token limit to preserve messages history
      // Adjust token limits based on prompt type to balance document content and messages history
      let maxTokens = this.messagesHistoryOptions.maxTokens || 8000;

      // For document questions, we need more room for messages history since we're sending full document
      if (promptLine.includes('DOCUMENT_'))
        maxTokens = Math.max(maxTokens, 8000); // Ensure minimum 8000 tokens for document questions
      const messagesHistoryToSend = this.messagesHistoryOptions.useEmpty ? [] : await this.trimHistoryForTokenLimit(this.messagesHistory, maxTokens);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          promptType: promptLine,
          history: messagesHistoryToSend
        })
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Update messages history only if not explicitly disabled
      if (!this.messagesHistoryOptions.skipUpdate) {
        // For document queries, extract only the question part to avoid storing redundant document content
        let historyMessage = message;
        if (promptLine.includes('DOCUMENT_')) {
          // Extract question from document queries to avoid token waste
          const questionMatch = message.match(/(?:Human Question|Question): (.+?)\n\nDocument Content:/);
          if (questionMatch)
            historyMessage = questionMatch[1];
          else
            // Fallback: use first 200 chars if pattern not found, avoiding full document
            historyMessage = message.length > 200 ? message.substring(0, 200) + '... [document content excluded from history]' : message;
        }

        this.messagesHistory.push(
          { role: 'human', content: `${promptLine}: ${historyMessage}` },
          { role: 'assistant', content: data.response }
        );
      }

      return data.response;
    } catch (error) {
      throw error;
    }
  }

  // Prepare a message, considering contextual question or history question
  prepareMessage(promptType, question) {
    // Initialize message with document content as-is
    let message = loadedDocument.text;

    if (!question)
      return message;

    // Prepend the question to the document content
    if (promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY')
      message = `Question: ${question}\n\nDocument Content:\n${loadedDocument.text}`;
    // For history questions, prepend the human question to document content
    else if (promptType === 'DOCUMENT_HISTORY_QUESTION')
      message = `Human Question: ${question}\n\nDocument Content:\n${loadedDocument.text}`;

    return message;
  };

  // Process questions with preserving messages history
  async processQuestions(promptType, question, bubble) {

    // Prepare the message to be sent, considering contextual question or messages history question
    // Format the message considering the prompt type, user's question, and the document content
    let message = this.prepareMessage(promptType, question);

    // For DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY, messages history is required and contamination free
    // Re-configure the messages history maximum tokens to ensure messages history is preserved
    if (promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY')
      // Increase the token limit to 10,000 to ensure both document content and messages history are preserved
      this.messagesHistoryOptions.maxTokens = 10000;
    // Sends the message to AI model
    // For contextual questions, preserve messages history to allow reference to previous interactions
    let responseText = '';
    await this.sendMessage(promptType, message).then(response => {
      const chatbotResponse = new ChatbotResponse(response);
      responseText = chatbotResponse.getText();
      responseText = chatbotResponse.formatText(promptType, responseText);
      // Pass contextual information from the messages history
      // for the DOCUMENT_CONTEXTUAL_QUESTIONS prompt type
      if (promptType === 'DOCUMENT_CONTEXTUAL_QUESTIONS')
        this.transferContextualQuestions(this.messagesHistory[1].content);
    }).catch(error => {
      responseText = `Error: ${error.message}`;
    });

    bubble(responseText, 'assistant');
  }

  askQuestionByPrompt(prompt, question = null) {
    // Start spinning on main div
    spinner.spin(askWebSDKMainDiv);

    // Create a wrapper callback that stops the spinner after bubble is called
    const callbackWrapper = (...args) => {
      // Only create bubble if not DOCUMENT_CONTEXTUAL_QUESTIONS
      if (prompt !== 'DOCUMENT_CONTEXTUAL_QUESTIONS')
        this.bubble(...args);
      spinner.stop();
    };

    this.processQuestions(prompt, question, callbackWrapper);
  }

  // Function to summarize the text for prompts:
  // SELECTED_TEXT_SUMMARY
  // DOCUMENT_QUESTION
  async summarizeTextByPrompt(prompt, text) {
    // Start spinning on main div
    spinner.spin(askWebSDKMainDiv);

    // Combine into single container for all bubble responses
    let responseText = '';
    await chatbot.sendMessage(prompt, text).then(response => {
      const chatbotResponse = new ChatbotResponse(response);
      responseText = chatbotResponse.getText();
      responseText = chatbotResponse.formatText(prompt, responseText);
    }).catch(error => {
      responseText = `Error: ${error.message}`;
    });

    spinner.stop();
    this.bubble(responseText, 'assistant');
  }

  // Transfer contextual questions to global variable for UI update
  transferContextualQuestions = async (questions) => {

    this.questionsContextuallySound = [];
    let lines = questions.split(/•\s*/).filter(Boolean);
    lines.forEach(line => {
      this.questionsContextuallySound.push(line.trim());
    });

    if (!questionsLIs || questionsLIs.length === 0) {
      this.transferContextualQuestions(questions);
      return;
    }

    //find all LIs with promptType 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY' (these are the contextual questions)
    let index = 0;
    let updatedCount = 0;
    questionsLIs.forEach((configAndLiTags) => {

      if (configAndLiTags[0] && configAndLiTags[0].promptType === 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') {

        if (this.questionsContextuallySound[index] !== undefined) {
          let li = configAndLiTags[1];
          if (li)
            li.innerText = this.questionsContextuallySound[index];
          else
            console.warn(`No UI element found for contextual question ${index + 1}`);

          let configItem = configAndLiTags[0];
          if (configItem)
            configItem.content = this.questionsContextuallySound[index];

          updatedCount++;
        } else
          console.warn(`Question ${index + 1} is undefined! Available questions:`, this.questionsContextuallySound);

        index++;
      }
    });

    // Now questionsLIs should be updated where all its LIs will be added to a UL element
    if (questionsLIs.length === 0)
      return;

    // Now select all LIs within the parent and move them all inside a UL element.
    const parentElement = questionsLIs[0][1].parentElement;
    if (parentElement) {
      const ulElement = document.createElement('ul');
      // Move all LIs inside the UL
      questionsLIs.forEach(configAndLiTags => {
        ulElement.appendChild(configAndLiTags[1]);
      });
      parentElement.appendChild(ulElement);
    }
  }

  // Function to create a chat bubble
  bubble = (content, role) => {
    conversationLog.push({ role: role, content: content });

    let messageDiv = document.createElement('div');
    messageDiv.className = (role === 'assistant') ? 'askWebSDKAssistantMessageClass' : 'askWebSDKHumanMessageClass';
    messageDiv.innerHTML = content;
    askWebSDKChattingDiv.appendChild(messageDiv);
    askWebSDKChattingDiv.scrollTop = askWebSDKChattingDiv.scrollHeight;
  }
};

// Export for use in other modules
export default Chatbot;