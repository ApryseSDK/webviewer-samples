function removeLeadingNumbering(text) {
  const pattern = /^\s*(?:(?:\d+|[IVXLCDM]+)[)\-–—]*|[•*·\-–—])\s*/i;
  return text.replace(pattern, '');
}

function phoneToRegex(phone) {
  // Remove anything that is not a digit
  const digits = phone.replace(/\D/g, '');

  // Break into parts
  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const line = digits.slice(6);

  // Return a regex allowing optional spaces, dashes, and parentheses
  return String.raw`\(?\s*${area}\s*\)?\s*\-?\s*${exchange}\s*\-?\s*${line}`;
}

function emailToRegex(email) {
  // Split email into parts
  const [local, domain] = email.split('@');
  const domainParts = domain.split('.');

  // Escape parts and allow optional whitespace around @ and .
  const domainRegex = domainParts.join(String.raw`\s*\.\s*`);

  const pattern = String.raw`\s*@\s*`;
  return `${local}${pattern}${domainRegex}`;
}

// Function to create redaction annotations from AI analysis results
const applyRedactions = async () => {
  const { documentViewer, Search, annotationManager, Annotations } = WebViewer.getInstance().Core;

  // Ensure the user has permissions to create/edit/delete annotations
  annotationManager.promoteUserToAdmin();

  // Parse the analysis to extract PII entities
  let piiEntities = [];
  try {
    // Extract entities from the analysis (assuming format from AI response)
    const lines = globalThis.aiAnalysisResult.analysis.split('\n');
    lines.forEach(line => {
      if (line.trim() !== '')
        piiEntities.push(line.trim());
    });
  } catch (error) {
    console.error('Error parsing analysis result:', error);
    return;
  }

  if (piiEntities.length === 0)
    return;

  // Configure the search modes
  const modes = [
    Search.Mode.PAGE_STOP,
    Search.Mode.HIGHLIGHT,
    Search.Mode.WHOLE_WORD
  ];

  let redactAnnotations = [];
  // Search for PII entities then create redactions
  for (const piiEntity of piiEntities) {
    let searchMode = modes.reduce((combinedModes, mode) => combinedModes | mode, 0);

    const separatorIndex = piiEntity.indexOf(':');
    if (separatorIndex === -1)
      continue;

    let classification = piiEntity.slice(0, separatorIndex).trim();
    const pii = piiEntity.slice(separatorIndex + 1).trim();
    if (classification === '' || pii === '')
      continue;

    classification = removeLeadingNumbering(classification);

    let searchStream;
    if (classification == "Phone") {
      const piiPhone = phoneToRegex(pii).toString();
      searchMode |= Search.Mode.REGEX;
      searchStream = documentViewer.search(piiPhone, searchMode);
    }
    else if (classification == "Email") {
      const piiEmail = emailToRegex(pii).toString();
      searchMode |= Search.Mode.REGEX;
      searchStream = documentViewer.search(piiEmail, searchMode);
    }
    else
      searchStream = documentViewer.search(pii, searchMode); // Setting up stream using your string to search.

    const searchResults = await searchStream.getAll(); // NOSONAR - javascript:S9382 sequential await is required to obtain all results.
    for (const result of searchResults) {
      const redactAnnot = new Annotations.RedactionAnnotation({
        PageNumber: result.pageNum,
        Quads: result.quads.map((quad) => quad.getPoints())
      });

      redactAnnot.Author = "AI Redaction";
      redactAnnot.OverlayText = classification;
      redactAnnot.FontSize = '10pt';
      redactAnnot.setContents(classification);
      redactAnnot.setCustomData('trn-annot-preview', documentViewer.getSelectedText(redactAnnot.PageNumber));
      redactAnnotations.push(redactAnnot);
    }
  }

  // Apply and redraw the redaction annotations collection
  annotationManager.addAnnotations(redactAnnotations);
  annotationManager.drawAnnotationsFromList(redactAnnotations);
};

export { applyRedactions };