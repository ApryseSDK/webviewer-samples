import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';

dotenv.config();

export const UNKNOWN_MODEL_FALLBACK = `"${process.env.OPENAI_MODEL || 'Unknown model'}". Follow README instructions to set environment variables in '.env' file.`;
export const OPENAI_CLIENT_UNAVAILABLE_FALLBACK = `"${process.env.OPENAI_MODEL || 'Unknown model'}" OpenAI client is not available. Please check OPENAI_API_KEY and OPENAI_MODEL in the server .env file.`;

// LLMManager - Manages LLM initialization, configuration, and execution
// Handles OpenAI chat models, token counting, and text processing
class LLMManager {
  llm = null;
  parser = null;
  initializationError = null;

  getModelName() {
    return process.env.OPENAI_MODEL || 'Unknown model';
  }

  getInitializationError() {
    return this.initializationError;
  }

  formatExecutionError(error) {
    const modelName = this.getModelName();
    const errorMessage = error?.message || 'Unknown OpenAI error.';

    if (errorMessage.includes('does not have access to model'))
      return `OpenAI could not use model "${modelName}".`;

    if (errorMessage.includes('Incorrect API key') || errorMessage.includes('invalid_api_key') || errorMessage.includes('401'))
      return `OpenAI API key is invalid for model "${modelName}". Update OPENAI_API_KEY in the server .env file.`;

    return `OpenAI request failed for model "${modelName}": ${errorMessage}`;
  }

  // Initialize LangChain components (LLM and parser)
  initialize() {
    if (!process.env.OPENAI_API_KEY) {
      this.initializationError = `${OPENAI_CLIENT_UNAVAILABLE_FALLBACK}`;
      console.error(this.initializationError);
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
        maxTokens: Number.parseInt(process.env.OPENAI_MAX_TOKENS, 10),
        temperature: Number.parseFloat(process.env.OPENAI_TEMPERATURE)
      });

      this.parser = new StringOutputParser();
      this.initializationError = null;

      if (!this.llm || !this.parser) {
        this.initializationError = `Failed to initialize OpenAI client for model "${this.getModelName()}".`;
        console.error(this.initializationError);
        return;
      }

      console.log('LangChain initialized successfully');
    } catch (error) {
      this.initializationError = this.formatExecutionError(error);
      console.error('Failed to initialize LangChain components:', this.initializationError);
    }
  }

  // Check LangChain initialization status
  // @returns {boolean} True if initialized, false otherwise
  isInitialized() {
    return !!this.llm && !!this.parser;
  }

  // Execute messages with LLM and parse response
  // @param {Array} messages - Array of message objects
  // @returns {Promise<string|null>} Parsed response or null if failed
  async executeMessages(messages) {
    if (!this.isInitialized()) {
      const initializationError = this.initializationError || `OpenAI client is not initialized for model "${this.getModelName()}".`;
      console.error('Unable to execute messages - LangChain components are not initialized');
      throw new Error(initializationError);
    }

    try {
      const response = await this.llm.invoke(messages);
      if (!response) {
        console.error('LLM invocation returned no response');
        return null;
      }

      const parsedResponse = await this.parser.parse(response.content);
      if (!parsedResponse) {
        console.error('Parsing LLM response returned no result');
        return null;
      }

      return parsedResponse;
    } catch (error) {
      throw new Error(this.formatExecutionError(error));
    }
  }
}

export default LLMManager;