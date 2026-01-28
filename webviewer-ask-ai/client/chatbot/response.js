// ChatbotResponse class to handle response processing
class ChatbotResponse {
  #response;

  constructor(response) {
    this.#response = response;
  }

  // Extract text from OpenAI response via LangChain
  getText() {
    const response = this.#response;
    
    // Primary: Server should send clean string content
    if (typeof response === 'string')
      return response;

    // Fallback: if server still sends complex object, extract properly
    if (typeof response === 'object' && response !== null) {

      // Standard LangChain approach: use .content property directly
      if (response.content !== undefined)
        return response.content;

      // Fallback for serialized LangChain objects
      if (response.kwargs && response.kwargs.content)
        return response.kwargs.content;

      return JSON.stringify(response);
    }

    return 'No response received';
  }

  // Format response to include cited page links
  // and page breaks based on prompt type
  formatText(promptType, text) {
    switch (promptType) {
      case 'DOCUMENT_SUMMARY':
      case 'SELECTED_TEXT_SUMMARY':
      case 'DOCUMENT_QUESTION':
        // Add page breaks to page citation ends with period
        text = text.replace(/(\d+\])\./g, '$1.<br/><br/>');
        break;
      case 'DOCUMENT_CONTEXTUAL_QUESTIONS':
        // Format bullet points with line breaks
        let lines_contextual_questions = text.split(/•\s*/).filter(Boolean);
        text = lines_contextual_questions.map(line => `• ${line.trim()}`).join('<br/>');
        break;
      case 'DOCUMENT_KEYWORDS':
        // Format bullet points with line breaks
        let lines = text.split(/•\s*/).filter(Boolean);
        text = lines.map(line => `• ${line.trim()}`).join('<br/>');
        break;
      default:
        break;
    }

    // Separate citations group on form [1, 2, 3] to individual [1][2][3]
    text = this.#separateGroupedCitations(text, /\[\d+(?:\s*,\s*\d+)+\]/g);

    // Separate citations range on form [1-3] to individual [1][2][3]
    text = this.#separateGroupedCitations(text, /\[\d+(?:\s*-\s*\d+)+\]/g);

    if (promptType === 'DOCUMENT_KEYWORDS') {
      let lines = text.split('<br/>').filter(Boolean);
      lines.forEach((line, index) => {
        const formattedLine = line.replace(/(\[\d+])(?:\1)+/g, '$1');
        lines[index] = formattedLine;
      });
      text = lines.join('<br/>');
    }

    let matches = text.match(/\[\d+\]/g);
    if (matches && matches.length > 0) {
      // Element duplicate matches
      matches = [...new Set(matches)];

      let pageNumber = 1;
      // match to be turned into link
      matches.forEach(match => {
        pageNumber = match.match(/\d+/)[0];
        if (pageNumber > 0 &&
          pageNumber <= loadedDocument.pageCount) {
          const pageLink = `<button class="page-link" type="button" style="color:blue;" onclick="WebViewer.getInstance().Core.documentViewer.setCurrentPage(${pageNumber}, true);">[${pageNumber}]</button>`;
          text = text.replaceAll(match, `${pageLink}`);
        }
      });
    }

    return text;
  }

  // Helper to separate grouped citations on form [1, 2, 3] or [1-3] into individual [1][2][3]
  #separateGroupedCitations(text, pattern) {
    let matches = text.match(pattern);
    if (matches && matches.length > 0) {
      let formattedMatchNumbers = '';
      matches.forEach(match => {
        let matchNumbers = match.match(/\d+/g);
        matchNumbers.forEach(matchNumber => {
          formattedMatchNumbers += `[${matchNumber}]`;
        });

        text = text.replaceAll(match, formattedMatchNumbers);
        formattedMatchNumbers = '';
      });
    }

    return text;
  }
}

// Export for use in other modules
export default ChatbotResponse;