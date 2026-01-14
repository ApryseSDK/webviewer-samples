// Logger class for handling all console output and debugging
class Logger {
    constructor() {
        this.debugMode = process.env.NODE_ENV === 'development';
        this.logHistory = [];
    }

    // Generic console.log wrapper
    log(message, ...args) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: 'INFO',
            message,
            args
        };

        this.logHistory.push(logEntry);
        console.log(`[${timestamp}] ${message}`, ...args);
    }

    // Debug level logging (only shows in development)
    debug(message, ...args) {
        if (!this.debugMode) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: 'DEBUG',
            message,
            args
        };

        this.logHistory.push(logEntry);
        console.log(`[${timestamp}] DEBUG: ${message}`, ...args);
    }

    // Error logging
    error(message, ...args) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: 'ERROR',
            message,
            args
        };

        this.logHistory.push(logEntry);
        console.error(`[${timestamp}] ERROR: ${message}`, ...args);
    }

    // Warning logging
    warn(message, ...args) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: 'WARN',
            message,
            args
        };

        this.logHistory.push(logEntry);
        console.warn(`[${timestamp}] WARN: ${message}`, ...args);
    }

    // Specific debug logging for DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY
    async logContextualQuestionDebug(promptType, message, promptSettings, history, getTokenCount) {
        if (promptType !== 'DOCUMENT_CONTEXTUAL_QUESTION_EXACTLY') return;

        this.debug('\n🔍 CONTEXTUAL_QUESTION_EXACTLY Debug:');
        this.debug('📊 Token counts:', {
            messageTokens: await getTokenCount(message),
            promptTokens: await getTokenCount(promptSettings.assistantPrompt),
            historyEntries: history.length
        });
        this.debug('📝 Question extracted:', message.split('\n')[0]);
        this.debug('📄 Document preview:', message.includes('Document Content:') ? 'Document content included ✓' : 'NO document content found ❌');
        this.debug('💭 History entries:', history.length, 'entries');

        if (history.length > 0) {
            this.debug('🗣️ Last history entry preview:', history[history.length - 1].content.substring(0, 100) + '...');
        }
        this.debug('\n');
    }

    // Get log history for debugging or monitoring
    getLogHistory(level = null, limit = 100) {
        let logs = this.logHistory;

        if (level) {
            logs = logs.filter(log => log.level === level.toUpperCase());
        }

        return logs.slice(-limit);
    }

    // Clear log history
    clearHistory() {
        this.logHistory = [];
    }

    // Format log entry for display
    formatLogEntry(entry) {
        const argsStr = entry.args.length > 0 ? ` ${JSON.stringify(entry.args)}` : '';
        return `[${entry.timestamp}] ${entry.level}: ${entry.message}${argsStr}`;
    }
}

// Export singleton instance
const logger = new Logger();
export default logger;