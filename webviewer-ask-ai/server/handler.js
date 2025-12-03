import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';

dotenv.config();

// Guard rails configuration for different prompt types
const PROMPT_GUARD_RAILS = {
  'DOCUMENT_SUMMARY': {
    systemPrompt: 'You are a document summarizer specializing in PDF documents. Summarize the provided text concisely under 300 words. CRITICALLY IMPORTANT: For each sentence in your summary, you MUST add square brackets with the page number where that information came from (e.g., [1] for page 1, [2] for page 2, etc.). The document text is divided by page break markers in the format "<<PAGE_BREAK>> Page N" where N is the page number. When you see "<<PAGE_BREAK>> Page 3", all content following that marker until the next page break is from page 3. Always cite the correct page number for each fact or statement. Example: "The company reported strong earnings [1]. The new policy takes effect in January [2]."',
    maxTokens: 500,
    temperature: 0.3
  },
  'DOCUMENT_KEYWORDS': {
    systemPrompt: 'You are a keyword extraction specialist. Create a bulleted list of the 10 most important keywords from the provided document text. CRITICALLY IMPORTANT: For each keyword, you MUST include the page number where it appears in square brackets. The document text is divided by page break markers in the format "<<PAGE_BREAK>> Page N" where N is the page number. When you see "<<PAGE_BREAK>> Page 3", all content following that marker until the next page break is from page 3. Format each keyword as: "• Keyword [page#]" Example: "• Federal Acquisition Regulation [1]" or "• Section 508 compliance [2]". Always cite the correct page number for each keyword.',
    maxTokens: 500,
    temperature: 0.1
  },
  'SELECTED_TEXT_SUMMARY': {
    systemPrompt: 'You are a text summarizer for selected content. Provide a concise summary of the selected text, highlighting the main points and key information. Be clear and focused.',
    maxTokens: 500,
    temperature: 0.3
  },
  'DOCUMENT_QUESTION': {
    systemPrompt: 'You are a document Q&A assistant. Answer questions about the provided document content accurately and concisely. Use specific information from the document to support your answers. If you cannot find relevant information in the document, say so clearly. CRITICALLY IMPORTANT: For each statement or fact in your answer, you MUST add square brackets with the page number where that information came from (e.g., [1] for page 1, [2] for page 2, etc.). The document text is divided by page break markers in the format "<<PAGE_BREAK>> Page N" where N is the page number. When you see "<<PAGE_BREAK>> Page 3", all content following that marker until the next page break is from page 3. Always cite the correct page number for each fact or statement. Example: "The policy requires annual reviews [3]. Training must be completed within 30 days [5]."',
    maxTokens: 500,
    temperature: 0.4
  },
  'default': {
    systemPrompt: 'You are a helpful assistant that helps users with PDF documents and general questions. Be concise and helpful.',
    maxTokens: 1000,
    temperature: 0.7
  }
};

// Function to estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Function to chunk text to fit within token limits
function chunkText(text, maxTokens = 12000) { // Leave room for system prompt and response
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    const testChunk = currentChunk + (currentChunk ? ' ' : '') + word;
    if (estimateTokens(testChunk) > maxTokens && currentChunk) {
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

// Function to get system prompt and settings based on prompt type
function getPromptSettings(promptType) {
  return PROMPT_GUARD_RAILS[promptType] || PROMPT_GUARD_RAILS['default'];
}

// Initialize the OpenAI chat llm and parser
let llm = null;
let parser = null;

// Initialize LangChain components
function initializeLangChain() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY in .env file');
    return false;
  }

  try {
    llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    });

    parser = new StringOutputParser();
    console.log('✅ LangChain initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing LangChain:', error);
    return false;
  }
}

export default (app) => {

  // Initialize LangChain on startup
  const langChainReady = initializeLangChain();

  // Chat API endpoint
  app.post('/api/chat', async (request, response) => {
    try {
      if (!langChainReady || !llm) {
        return response.status(500).json({
          error: 'Chat service not available. Please check server configuration.'
        });
      }

      const { message, promptType } = request.body;

      if (!message || typeof message !== 'string') {
        return response.status(400).json({ error: 'Message is required' });
      }

      // Get appropriate prompt settings based on prompt type
      const promptSettings = getPromptSettings(promptType);

      // Check if message is too long and handle accordingly
      const estimatedTokens = estimateTokens(message) + estimateTokens(promptSettings.systemPrompt) + 500; // Buffer for history and response

      let finalContent;

      if (estimatedTokens > 16000) { // Leave buffer for llm limit

        // For keyword extraction, we can chunk the document and extract keywords from each chunk
        if (promptType?.includes('keywords') || promptType?.includes('Keywords')) {
          const chunks = chunkText(message, 12000);

          const allKeywords = [];

          for (let i = 0; i < chunks.length; i++) {
            const chunkMessages = [
              new SystemMessage(`${promptSettings.systemPrompt} This is chunk ${i + 1} of ${chunks.length}. Extract keywords from this section only.`),
              new HumanMessage(chunks[i])
            ];

            // update llm settings for this prompt
            llm.temperature = promptSettings.temperature;
            llm.maxTokens = 150;

            const chunkResponse = await llm.invoke(chunkMessages);
            const chunkContent = await parser.parse(chunkResponse);
            allKeywords.push(chunkContent);
          }

          // Now consolidate all keywords into final list
          const consolidationMessages = [
            new SystemMessage('You are a keyword consolidation specialist. From the following keyword lists extracted from different sections of a document, create a final bulleted list of the 10 most important and representative keywords. Remove duplicates and prioritize the most significant terms.'),
            new HumanMessage(`Consolidate these keyword lists into the top 10 keywords:\n\n${allKeywords.join('\n\n---\n\n')}`)
          ];

          // update llm settings for consolidation
          llm.temperature = 0.1;
          llm.maxTokens = 200;

          const finalResponse = await llm.invoke(consolidationMessages);
          finalContent = await parser.parse(finalResponse);

        } else {
          // For other prompt types, use first chunk with warning
          const chunks = chunkText(message, 12000);
          const messages = [
            new SystemMessage(`${promptSettings.systemPrompt}\n\nNOTE: This document was too long, so only the first section is being processed.`),
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
          new SystemMessage(promptSettings.systemPrompt),
          new HumanMessage(message)
        ];

        // update llm with prompt-specific settings
        llm.temperature = promptSettings.temperature;
        llm.maxTokens = promptSettings.maxTokens;

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
