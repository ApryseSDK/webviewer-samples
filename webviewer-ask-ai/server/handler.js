import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage as AssistantMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';
import logger from './logger.js';

// Try to import tiktoken directly for local-only token counting
let tiktoken = null;

async function initializeTiktoken() {
  if (tiktoken) return tiktoken;

  try {
    tiktoken = await import('js-tiktoken');
    return tiktoken;
  } catch (error) {
    console.log('Direct tiktoken import failed, will rely on LangChain:', error.message);
    return null;
  }
}

dotenv.config();

// Guard rails configuration for different prompt types
const PROMPT_GUARD_RAILS = {
  'DOCUMENT_SUMMARY': {
    assistantPrompt: 'You are a document summarizer specializing in PDF documents. Summarize the provided text concisely under 300 words. CRITICALLY IMPORTANT: For each sentence in your summary, you MUST add square brackets with the page number where that information came from (e.g., [1] for page 1, [2] for page 2, etc.). The document text is divided by page break markers in the format "<<PAGE_BREAK>> Page N" where N is the page number. When you see "<<PAGE_BREAK>> Page 3", all content following that marker until the next page break is from page 3. Always cite the correct page number for each fact or statement. Example: "The company reported strong earnings [1]. The new policy takes effect in January [2]."',
    maxTokens: 500, //Max tokens for summary, adjust as needed. Value means 500 tokens to be used for response, input can be larger but this value restricts the output response length. 
    temperature: 0.0,
    seed: 42
  },
  'DOCUMENT_KEYWORDS': {
    assistantPrompt: 'You are a keyword extraction specialist. Create a bulleted list of the 10 most important keywords from the provided document text. Format each keyword as: "• Keyword [page#]" where page# is ONE page number where the keyword appears. Do not repeat page numbers or list multiple pages for the same keyword. Example: "• Federal Acquisition Regulation [1]" or "• Section 508 compliance [2]". Keep responses concise. Do not add **Keywords** on the response. JUST the bulleted list.',
    maxTokens: 300, // Reduced to prevent truncation
    temperature: 0.0,
    seed: 42
  },
  'SELECTED_TEXT_SUMMARY': {
    assistantPrompt: 'You are a text summarizer for selected content. Provide a concise summary of the selected text, highlighting the main points and key information. Be clear and focused. CRITICALLY IMPORTANT: For each sentence in your summary, you MUST add square brackets with the page number where that information came from (e.g., [1] for page 1, [2] for page 2, etc.). The document text is divided by page break markers in the format "<<PAGE_BREAK>> Page N" where N is the page number. When you see "<<PAGE_BREAK>> Page 3", all content following that marker until the next page break is from page 3. Always cite the correct page number for each fact or statement. Example: "The company reported strong earnings [1]. The new policy takes effect in January [2]."',
    maxTokens: 500,
    temperature: 0.0,
    seed: 42
  },
  'DOCUMENT_QUESTION': {
    assistantPrompt: 'You are a document Q&A assistant. Answer questions about the provided document content accurately and concisely. Use specific information from the document to support your answers. If you cannot find relevant information in the document, say so clearly. CRITICALLY IMPORTANT: For each statement or fact in your answer, you MUST add square brackets with the page number where that information came from (e.g., [1] for page 1, [2] for page 2, etc.). The document text is divided by page break markers in the format "<<PAGE_BREAK>> Page N" where N is the page number. When you see "<<PAGE_BREAK>> Page 3", all content following that marker until the next page break is from page 3. Always cite the correct page number for each fact or statement. Example: "The policy requires annual reviews [3]. Training must be completed within 30 days [5]". CRITICALLY IMPORTANT: Your responses can not be in the form of question, you must answer the question, do not restate it, just give your answer directly based on the document.',
    maxTokens: 500,
    temperature: 0.0,
    seed: 42
  },
  'DOCUMENT_CONTEXTUAL_QUESTIONS': {
    assistantPrompt: 'You are an expert researcher skilled in creating diverse, non-overlapping questions. CRITICALLY IMPORTANT: keep the question to a single subject and no longer than 20 words. Examine the document and based on the contents, create 3 DISTINCT questions that explore DIFFERENT aspects of the document, ensuring each question will yield UNIQUE answers with NO overlap. Follow this framework but do not include in the response the type of question information, just provide the question. As an example, if "What is this document about?", or "What cost, or budget, or ROI, or pricing are involved?" or "What hisotrical background is covered on the document?". Each question must target a completely different information domain. CRITICALLY IMPORTANT: Return just the question text not the type of question in bulleted list format as: "• ".',
    maxTokens: 500,
    temperature: 0.0,
    seed: 42
  },
  'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY': {
    assistantPrompt: 'You are an expert researcher. CRITICAL: Answer ONLY the current question about the document. However, you MUST use the document content provided to answer the question. Base your response SOLELY on the document content provided in this message. Be direct and concise. CRITICAL: You must provide an answer from the document contents, even if it is a brief comment. REQUIRED: Add page citations [1], [2]. In case there are multiple pages, do not repeat the same page number. If more than one page is cited separate by comma as [1,2] for pages 1 and 2. CRITICAL: do not make up page number that does not exist in the document. Direct answer only, no question restatement.',
    maxTokens: 500,
    temperature: 0.0,
    seed: 42
  },
  'DOCUMENT_HISTORY_QUESTION': {
    assistantPrompt: 'You are a document Q&A assistant with full access to conversation history and document content. Answer questions about previous interactions, generated questions, or chat history while referencing the document content when relevant. Be specific about what was previously discussed or generated. You can reference both the document content and previous conversation history to provide comprehensive answers. REQUIRED: Add page citations [1], [2], etc. when referencing document facts.',
    maxTokens: 800,
    temperature: 0.0,
    seed: 42
  },
  'default': {
    assistantPrompt: 'You are a helpful assistant that helps users with PDF documents and general questions. Be concise and helpful.',
    maxTokens: 1000,
    temperature: 0.0,
    seed: 42
  }
};

// Function to get accurate token count using local tiktoken or LangChain fallback
async function getTokenCount(text, timeoutMs = parseInt(process.env.TOKEN_COUNT_TIMEOUT) || 5000) {
  try {
    // First try direct tiktoken (local-only, no network calls)
    const tiktokenLib = await initializeTiktoken();
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
    if (!llm) {
      console.log('LLM not initialized, using character estimation for token count');
      return Math.ceil(text.length / 4);
    }

    const startTime = Date.now();
    console.log('Using LangChain tiktoken (potential network calls), text length:', text.length);

    // Fallback to LangChain (makes network calls)
    const tokenCountPromise = llm.getNumTokens(text);
    const timeoutPromise = new Promise((_, reject) =>
      // Add timeout protection to detect network calls
      setTimeout(() => reject(new Error(`Token counting timeout after ${timeoutMs}ms - possibly making network calls from Middle East/Asia to OpenAI servers`)), timeoutMs)
    );

    const result = await Promise.race([tokenCountPromise, timeoutPromise]);
    const duration = Date.now() - startTime;

    console.log(`LangChain token count completed in ${duration}ms: ${result} tokens`);
    if (duration > 1000) {
      logger.warn(`Slow token counting detected (${duration}ms) - likely making network calls. Consider using local tiktoken only.`);
    }

    return result;

  } catch (error) {
    logger.warn('Token counting failed, using character estimation:', error.message);
    console.log('Error details:', error.stack);

    // Geographic hint in error message
    if (error.message.includes('timeout')) {
      logger.error('GEOGRAPHIC ISSUE DETECTED: Token counting is timing out. This often happens when LangChain makes network calls to OpenAI servers from regions with high latency (like Middle East/Asia). Consider using local-only tiktoken.');
    }

    console.log('Default math calculation using 4 byte estimation');

    return Math.ceil(text.length / 4);
  }
}

// Function to chunk text to fit within token limits
async function chunkText(text, maxTokens = 12000) { // Leave room for assistant prompt and response
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    const testChunk = currentChunk + (currentChunk ? ' ' : '') + word;
    const tokenCount = await getTokenCount(testChunk);
    if (tokenCount > maxTokens && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk = testChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// Function to get assistant prompt and settings based on prompt type
function getPromptSettings(promptType) {
  return PROMPT_GUARD_RAILS[promptType] || PROMPT_GUARD_RAILS['default'];
}

// Initialize the OpenAI chat llm and parser
let llm = null;
let parser = null;

// Initialize LangChain components
function initializeLangChain() {
  if (!process.env.OPENAI_API_KEY) {
    logger.error('Missing OPENAI_API_KEY in .env file');
    return false;
  }

  try {
    llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo-16k',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.0,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
      seed: 42, // For reproducible responses
    });

    parser = new StringOutputParser();
    logger.log('LangChain initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing LangChain:', error);
    return false;
  }
}

export default (app) => {

  // Initialize LangChain on startup
  const langChainReady = initializeLangChain();

  // Token counting API endpoint for client-side use
  app.post('/api/token-count', async (request, response) => {
    try {
      if (!langChainReady || !llm) {
        return response.status(500).json({
          error: 'Token counting service not available. Please check server configuration.'
        });
      }

      const { text } = request.body;

      if (!text || typeof text !== 'string') {
        return response.status(400).json({ error: 'Text is required' });
      }

      // Get accurate token count using LangChain's tiktoken
      const tokenCount = await getTokenCount(text);

      // Find from `response` a way to see the IP address of the requester
      logger.log(`Token count request from ${request.ip}: ${tokenCount} tokens for text length ${text.length} | ${text.length > 50 ? (text.substring(0, 50)) : text}`);

      response.status(200).json({
        tokenCount,
        method: 'langchain-tiktoken',
        textLength: text.length
      });
    } catch (error) {
      logger.error('Token counting error:', error);
      response.status(500).json({
        error: 'An error occurred while counting tokens'
      });
    }
  });

  // Chat API endpoint
  app.post('/api/chat', async (request, response) => {
    try {
      if (!langChainReady || !llm) {
        return response.status(500).json({
          error: 'Chat service not available. Please check server configuration.'
        });
      }

      const { message, promptType, history = [] } = request.body;

      if (!message || typeof message !== 'string') {
        return response.status(400).json({ error: 'Message is required' });
      }

      // Get appropriate prompt settings based on prompt type
      const promptSettings = getPromptSettings(promptType);

      // Check if message is too long and handle accordingly
      const messageTokens = await getTokenCount(message);
      const promptTokens = await getTokenCount(promptSettings.assistantPrompt);
      const estimatedTokens = messageTokens + promptTokens + 500; // Buffer for history and response

      let finalContent;

      if (estimatedTokens > 16000) { // Leave buffer for llm limit

        // For keyword extraction, we can chunk the document and extract keywords from each chunk
        if (promptType.toLowerCase()?.includes('keywords')) {
          const chunks = await chunkText(message, 12000);

          const allKeywords = [];

          for (let i = 0; i < chunks.length; i++) {
            const chunkMessages = [
              new AssistantMessage(`${promptSettings.assistantPrompt} This is chunk ${i + 1} of ${chunks.length}. Extract keywords from this section only.`),
              new HumanMessage(chunks[i])
            ];

            // update llm settings for this prompt with consistency parameters
            llm.temperature = promptSettings.temperature || 0.0;
            llm.maxTokens = 120; // Reduced to prevent truncation and repetition
            llm.seed = promptSettings.seed || 42;

            const chunkResponse = await llm.invoke(chunkMessages);
            const chunkContent = await parser.parse(chunkResponse);
            allKeywords.push(chunkContent);
            console.log(`Extracted keywords from chunk ${i + 1}/${chunks.length}`);
          }

          // Now consolidate all keywords into final list with deterministic approach
          const consolidationMessages = [
            new AssistantMessage('You are a keyword consolidation specialist. From the following keyword lists extracted from different sections of a document, create a final bulleted list of the 10 most important and representative keywords. CONSISTENCY RULES: 1) Remove exact duplicates and near-duplicates 2) Use canonical/standard forms of terms 3) Rank by frequency and importance across all sections 4) Maintain the same format: "• Keyword [page#]" 5) Be deterministic - always select the same keywords for the same input.'),
            new HumanMessage(`Consolidate these keyword lists into the top 10 keywords:\n\n${allKeywords.join('\n\n---\n\n')}`)
          ];

          // update llm settings for consolidation with consistency parameters
          llm.temperature = 0.0;
          llm.maxTokens = 200;
          llm.seed = 42;

          const finalResponse = await llm.invoke(consolidationMessages);
          finalContent = await parser.parse(finalResponse);

        } else {
          // For other prompt types, use first chunk with warning
          const chunks = await chunkText(message, 12000);
          const messages = [
            new AssistantMessage(`${promptSettings.assistantPrompt}\n\nNOTE: This document was too long, so only the first section is being processed.`),
            ...history.map(msg =>
              msg.role === 'human'
                ? new HumanMessage(msg.content)
                : new AssistantMessage(`Previous assistant response: ${msg.content}`)
            ),
            new HumanMessage(chunks[0])
          ];

          // update llm settings for this prompt
          llm.temperature = promptSettings.temperature;
          llm.maxTokens = promptSettings.maxTokens;

          const response_data = await llm.invoke(messages);
          finalContent = await parser.parse(response_data);
        }

      } else {
        // Normal processing for documents within token limits
        const messages = [
          new AssistantMessage(promptSettings.assistantPrompt),
          ...history.map(msg =>
            msg.role === 'human'
              ? new HumanMessage(msg.content)
              : new AssistantMessage(`Previous assistant response: ${msg.content}`)
          ),
          new HumanMessage(message)
        ];

        // Debug logging for DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY issues
        await logger.logContextualQuestionDebug(promptType, message, promptSettings, history, getTokenCount);

        // update llm with prompt-specific settings including seed for consistency
        llm.temperature = promptSettings.temperature;
        llm.maxTokens = promptSettings.maxTokens;
        if (promptSettings.seed !== undefined) {
          llm.seed = promptSettings.seed;
        }

        const response_data = await llm.invoke(messages);
        finalContent = await parser.parse(response_data);
      }

      // Ensure sending a clean string response
      const cleanResponse = typeof finalContent === 'string' ? finalContent :
        (finalContent?.content || JSON.stringify(finalContent));

      response.status(200).json({ response: cleanResponse });
    } catch (error) {
      response.status(500).json({
        error: 'An error occurred while processing your request'
      });
    }
  });
}