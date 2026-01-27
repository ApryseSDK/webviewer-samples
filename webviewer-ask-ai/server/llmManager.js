import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

// LLMManager - Manages LLM initialization, configuration, and execution
// Handles OpenAI chat models, token counting, and text processing
class LLMManager {
  constructor() {
    this.llm = null;
    this.parser = null;
    this.tiktoken = null;
  }

  // Initialize tiktoken library for local token counting
  // @returns {Promise<Object|null>} Tiktoken library or null if failed
  async initializeTiktoken() {
    if (this.tiktoken)
      return this.tiktoken;

    try {
      this.tiktoken = await import('js-tiktoken');
      return this.tiktoken;
    } catch (error) {
      console.log('Direct tiktoken import failed, will rely on LangChain:', error.message);
      return null;
    }
  }

  // Get accurate token count using local tiktoken or LangChain fallback
  // @param {string} text - Text to count tokens for
  // @param {number} timeoutMs - Timeout in milliseconds
  // @returns {Promise<number>} Token count
  async getTokenCount(text, timeoutMs = parseInt(process.env.TOKEN_COUNT_TIMEOUT) || 5000) {
    try {
      // First try direct tiktoken (local-only, no network calls)
      const tiktokenLib = await this.initializeTiktoken();
      if (tiktokenLib) {
        const startTime = Date.now();

        const encoder = tiktokenLib.getEncoding('cl100k_base'); // GPT-3.5/4 encoding
        const tokens = encoder.encode(text);
        const result = tokens.length;
        // Note: js-tiktoken doesn't require manual memory cleanup
        const duration = Date.now() - startTime;
        return result;
      }

      // Fallback to LangChain 
      if (!this.isInitialized()) {
        logger.warn('LLM not initialized, cannot use LangChain for token counting');
        return Math.ceil(text.length / 4);
      }

      const startTime = Date.now();
      console.log('Using LangChain tiktoken (potential network calls), text length:', text.length);

      // Fallback to LangChain (makes network calls)
      const tokenCountPromise = this.llm.getNumTokens(text);
      const timeoutPromise = new Promise((_, reject) =>
        // Add timeout protection to detect network calls
        setTimeout(() => reject(new Error(`Token counting timeout after ${timeoutMs}ms - possibly making network calls from Middle East/Asia to OpenAI servers`)), timeoutMs)
      );

      const result = await Promise.race([tokenCountPromise, timeoutPromise]);
      const duration = Date.now() - startTime;

      console.log(`LangChain token count completed in ${duration}ms: ${result} tokens`);
      if (duration > 1000)
        logger.warn(`Slow token counting detected (${duration}ms) - likely making network calls. Consider using local tiktoken only.`);

      return result;

    } catch (error) {
      logger.warn('Token counting failed, using character estimation:', error.message);
      console.log('Error details:', error.stack);

      // Geographic hint in error message
      if (error.message.includes('timeout'))
        logger.error('GEOGRAPHIC ISSUE DETECTED: Token counting is timing out. This often happens when LangChain makes network calls to OpenAI servers from regions with high latency (like Middle East/Asia). Consider using local-only tiktoken.');

      console.log('Default math calculation using 4 byte estimation');

      return Math.ceil(text.length / 4);
    }
  }

  // Chunk text to fit within token limits
  // @param {string} text - Text to chunk
  // @param {number} maxTokens - Maximum tokens per chunk
  // @returns {Promise<Array<string>>} Array of text chunks
  async chunkText(text, maxTokens = 12000) { // Leave room for assistant prompt and response
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = '';

    for (const word of words) {
      const testChunk = currentChunk + (currentChunk ? ' ' : '') + word;
      const tokenCount = await this.getTokenCount(testChunk);
      if (tokenCount > maxTokens && currentChunk) {
        chunks.push(currentChunk);
        currentChunk = word;
      } else
        currentChunk = testChunk;
    }

    if (currentChunk)
      chunks.push(currentChunk);

    return chunks;
  }


  // Initialize LangChain components (LLM and parser)
  initialize() {
    if (!process.env.OPENAI_API_KEY) {
      logger.error('Missing OPENAI_API_KEY in .env file');
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL,
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE),
        seed: parseInt(process.env.OPENAI_SEED), // For reproducible responses
      });

      this.parser = new StringOutputParser();

      if (!this.llm || !this.parser) {
        logger.error('Failed to initialize LangChain components');
        return;
      }

      logger.log('LangChain initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize LangChain components:', error);
    }
  }

  // Check LangChain initialization status
  // @returns {boolean} True if initialized, false otherwise
  isInitialized() {
    if (!this.llm || !this.parser)
      return false;

    return true;
  }

  // Dynamically tune LLM settings
  // @param {Object} settings - Settings object with maxTokens property
  tuneSettings(settings = { maxTokens }) {
    if (!this.isInitialized()) {
      logger.error('Unable to tune settings - LangChain components are not initialized');
      return;
    }

    if (!settings.maxTokens) {
      logger.error('Invalid settings provided for tuning');
      return;
    }

    this.llm.maxTokens = settings.maxTokens;
  }

  // Execute messages with LLM and parse response
  // @param {Array} messages - Array of message objects
  // @returns {Promise<string|null>} Parsed response or null if failed
  async executeMessages(messages) {
    if (!this.isInitialized()) {
      logger.error('Unable to execute messages - LangChain components are not initialized');
      return null;
    }

    const response = await this.llm.invoke(messages);
    if (!response) {
      logger.error('LLM invocation returned no response');
      return null;
    }

    const parsedResponse = await this.parser.parse(response);
    if (!parsedResponse) {
      logger.error('Parsing LLM response returned no result');
      return null;
    }

    return parsedResponse;
  }
}

export default LLMManager;