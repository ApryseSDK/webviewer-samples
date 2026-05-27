import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import LLMManager, { OPENAI_CLIENT_UNAVAILABLE_FALLBACK, UNKNOWN_MODEL_FALLBACK } from './llmManager.js';
import InMemoryStore from './inMemoryStore.js';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

// Load configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, './config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const { guardRail } = config;

// Create LLMManager instance
const llmManager = new LLMManager();
// Create InMemoryStore instance to validate the
// received document text length and page count
// are within acceptable limits to prevent processing
// of excessively large documents.
const inMemoryStore = new InMemoryStore();
// Variables to hold document text, validation status, and analysis results in memory for quick access during the request lifecycle.
let documentText = '';
let isDocumentValid = false;
let analysisData = null;
// Clear document and analysis data.
const cleanupData = () => {
  documentText = '';
  isDocumentValid = false;
  analysisData = null;
}
// Validate analysis data contains results before sending it back to the client.
const isValidAnalysis = () => {
  return !(analysisData === null ||
    analysisData.length === 0 ||
    analysisData.includes('No personal information'));
};

export default function registerHandlers(app) {
  // Initialize LangChain on startup
  llmManager.initialize();

  // Prepare system prompt with PII classifications and guardrail rules
  let prepareSystemPrompt = (guardRail) => {
    let compiledClassificationDetails = guardRail.piiClassifications.flatMap(item => item.details).join(', ');
    let prompt = guardRail.systemPrompt.replace('PIICLASSIFICATIONSPLACEHOLDER', compiledClassificationDetails);
    prompt += guardRail.rulesSet.map(rule => `${rule}`).join(' ');
    return prompt;
  };

  // Create system prompt message
  const systemPrompt = prepareSystemPrompt(guardRail);
  const systemMessage = new SystemMessage(systemPrompt);

  // Endpoint to receive document text from client
  app.post('/api/send-text', async (request, response) => {
    try {
      if (!llmManager.isInitialized()) {
        return response.status(200).json({
          error: llmManager.getInitializationError() || OPENAI_CLIENT_UNAVAILABLE_FALLBACK,
          success: false
        });
      }

      const state = inMemoryStore.isValidDocument(request.body.documentText.trim(), request.body.pageCount);
      switch (state) {
        case 0:
          return response.status(200).json({
            error: 'Document text is empty.',
            success: false
          });
        case 1:
          return response.status(200).json({
            error: `Document text size exceeds ${InMemoryStore.MAX_DOCUMENT_LENGTH} characters limit.`,
            success: false
          });
        case 2:
          return response.status(200).json({
            error: `Document pages number exceeds ${InMemoryStore.ALLOWED_PAGES} pages limit.`,
            success: false
          });
        default:
          documentText = request.body.documentText.trim();
          isDocumentValid = true;
          response.json({
            message: 'Document text received successfully.',
            success: true
          });
      }
    } catch (error) {
      console.error('Error receiving document text:', error);
      cleanupData();
      response.status(500).json({
        error: 'Failed to receive document text',
        details: error.message,
        success: false
      });
    }
  });

  // Endpoint to analyze document for PII
  app.post('/api/analyze-pii', async (request, response) => {
    try {
      // Check if LangChain is ready for AI processing
      if (!llmManager.isInitialized()) {
        cleanupData();
        return response.status(500).json({
          error: llmManager.getInitializationError() || OPENAI_CLIENT_UNAVAILABLE_FALLBACK,
          success: false
        });
      }

      // Check if document is valid before analysis
      if (!isDocumentValid) {
        cleanupData();
        return response.status(400).json({
          error: 'Invalid document. Please check the document text and page count.',
          success: false
        });
      }

      // AI processing with LangChain for PII detection
      const humanMessage = new HumanMessage(documentText);
      analysisData = await llmManager.executeMessages([systemMessage, humanMessage]);

      response.json({
        success: true,
        message: 'PII analysis completed'
      });
    } catch (error) {
      console.error('Error analyzing document for PII:', error);
      cleanupData();
      const readableError = error?.message || 'Unknown LLM error occurred while analyzing document for PII.';
      response.status(500).json({
        error: readableError,
        details: 'Failed to analyze document for PII.',
        success: false
      });
    }
  });

  // Endpoint to send results back to client
  app.get('/api/get-results', async (request, response) => {
    try {
      // Check if analysis data is valid
      const validAnalysis = isValidAnalysis();
      if (!validAnalysis) {
        return response.status(200).json({
          analysis: analysisData,
          error: 'No analysis results found.',
          success: false
        });
      }

      response.status(200).json({
        success: true,
        analysis: analysisData
      });
    } catch (error) {
      console.error('Error retrieving analysis results:', error);
      response.status(500).json({
        error: 'Failed to retrieve analysis results',
        details: error.message,
        success: false
      });
    }
    finally {
      // Clear document and analysis data after sending results
      cleanupData();
    }
  });

  // Endpoint to provide configuration data to client
  app.get('/api/config', (request, response) => {
    const configResponse = {
      llmModel: process.env.OPENAI_MODEL || UNKNOWN_MODEL_FALLBACK,
      systemPrompt: null,
      systemPromptExposed: false
    };

    if (process.env.EXPOSE_CONFIGURATION === 'true') {
      configResponse.systemPrompt = formatSystemPrompt(guardRail);
      configResponse.systemPromptExposed = true;
    }
    
    response.json(configResponse);
  });

  let formatSystemPrompt = (guardRail) => {
    let compiledClassificationDetails = guardRail.piiClassifications.flatMap(item => item.details.map(detail => `\n- ${detail}`)).join('');
    let formattedPrompt = guardRail.systemPrompt.replace('PIICLASSIFICATIONSPLACEHOLDER', compiledClassificationDetails);
    let placeHolderText = 'Consider applying the following rules:';
    formattedPrompt = formattedPrompt.replace(placeHolderText, `\n\n${placeHolderText}`);
    formattedPrompt += guardRail.rulesSet.map(rule => `\n${rule}`).join('\n');
    return formattedPrompt;
  };
}