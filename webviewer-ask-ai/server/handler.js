import { HumanMessage, SystemMessage as AssistantMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';
import LLMManager from './llmManager.js';
import logger from './logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Load guard rails configuration from config/config.json file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, '..', 'config', 'config.json');
const configData = JSON.parse(readFileSync(configPath, 'utf8'));
// Guard rails configuration for different prompt types
const GUARD_RAILS = configData.GUARD_RAILS;

// Create LLMManager instance
const llmManager = new LLMManager();

export default (app) => {

  // Initialize LangChain on startup
  llmManager.initialize();

  // Token counting API endpoint for client-side use
  app.post('/api/token-count', async (request, response) => {
    try {
      if (!llmManager.isInitialized())
        return response.status(500).json({
          error: 'Token counting service not available. Please check server configuration.'
        });

      const { text } = request.body;
      if (!text || typeof text !== 'string')
        return response.status(400).json({ error: 'Text is required' });

      // Get accurate token count using LangChain's tiktoken
      const tokenCount = await llmManager.getTokenCount(text);

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
      if (!llmManager.isInitialized())
        return response.status(500).json({
          error: 'Chat service not available. Please check server configuration.'
        });

      const { message, promptType, history = [] } = request.body;
      if (!message || typeof message !== 'string')
        return response.status(400).json({ error: 'Message is required' });

      // Get appropriate guard rail based on prompt type
      const guardRail = GUARD_RAILS[promptType] || GUARD_RAILS['default'];
      // Check if message is too long and handle accordingly
      const messageTokens = await llmManager.getTokenCount(message);
      const promptTokens = await llmManager.getTokenCount(guardRail.LLM.Prompt);
      const estimatedTokens = messageTokens + promptTokens + 500; // Buffer for history and response

      let finalContent;

      if (estimatedTokens > 16000) { // Leave buffer for llm limit

        // For keyword extraction, we can chunk the document and extract keywords from each chunk
        if (promptType.toLowerCase()?.includes('keywords')) {
          const chunks = await llmManager.chunkText(message, 12000);
          const allKeywords = [];

          for (let i = 0; i < chunks.length; i++) {
            const chunkMessages = [
              new AssistantMessage(`${guardRail.LLM.Prompt} This is chunk ${i + 1} of ${chunks.length}. Extract keywords from this section only.`),
              new HumanMessage(chunks[i])
            ];

            // Update llm settings
            // Reduced maxTokens to prevent truncation and repetition
            llmManager.tuneSettings({maxTokens: 120});

            // Execute keyword extraction for this chunk
            const chunkContent = await llmManager.executeMessages(chunkMessages);
            allKeywords.push(chunkContent);
            console.log(`Extracted keywords from chunk ${i + 1}/${chunks.length}`);
          }

          // Now consolidate all keywords into final list with deterministic approach
          const consolidationMessages = [
            new AssistantMessage('You are a keyword consolidation specialist. From the following keyword lists extracted from different sections of a document, create a final bulleted list of the 10 most important and representative keywords. CONSISTENCY RULES: 1) Remove exact duplicates and near-duplicates 2) Use canonical/standard forms of terms 3) Rank by frequency and importance across all sections 4) Maintain the same format: "• Keyword [page#]" 5) Be deterministic - always select the same keywords for the same input.'),
            new HumanMessage(`Consolidate these keyword lists into the top 10 keywords:\n\n${allKeywords.join('\n\n---\n\n')}`)
          ];

          // Update llm settings
          llmManager.tuneSettings({maxTokens: 200});

          // Execute consolidation messages to get final keywords
          finalContent = await llmManager.executeMessages(consolidationMessages);
        } else {
          // For other prompt types, use first chunk with warning
          const chunks = await llmManager.chunkText(message, 12000);
          const messages = [
            new AssistantMessage(`${guardRail.LLM.Prompt}\n\nNOTE: This document was too long, so only the first section is being processed.`),
            ...history.map(msg =>
              msg.role === 'human'
                ? new HumanMessage(msg.content)
                : new AssistantMessage(`Previous assistant response: ${msg.content}`)
            ),
            new HumanMessage(chunks[0])
          ];

          // Update llm settings
          llmManager.tuneSettings({maxTokens: guardRail.LLM.Settings.maxTokens});

          // Execute messages with only the first chunk
          finalContent = await llmManager.executeMessages(messages);
        }
      } else {
        // Normal processing for documents within token limits
        const messages = [
          new AssistantMessage(guardRail.LLM.Prompt),
          ...history.map(msg =>
            msg.role === 'human'
              ? new HumanMessage(msg.content)
              : new AssistantMessage(`Previous assistant response: ${msg.content}`)
          ),
          new HumanMessage(message)
        ];

        // Debug logging for DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY issues
        await logger.logContextualQuestionDebug(promptType, message, guardRail, history, llmManager.getTokenCount.bind(llmManager));

        // Update llm settings
        llmManager.tuneSettings({maxTokens: guardRail.LLM.Settings.maxTokens});

        // Execute messages normally
        finalContent = await llmManager.executeMessages(messages);
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