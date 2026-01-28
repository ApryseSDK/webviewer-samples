// Document class to manage the loaded document-related properties and operations
// NOTE: The loaded document contents is cached in this object.
//       Document contents edit requires saving then re-loading.
class DocumentManager {
  #documentViewer;
  instance;
  fileName;
  pageCount;
  completePromise;
  text;
  isValid;

  constructor(documentViewer) {
    this.#documentViewer = documentViewer;
    this.instance = null;
    this.fileName = '';
    this.pageCount = 0;
    this.completePromise = null;
    this.text = '';
    this.isValid = true;
  }

  async initialize() {
    this.instance = this.#documentViewer.getDocument();
    if (!this.isValid) {
      console.error('Failed to initialize document manager.');
      return;
    }
    this.fileName = this.instance.getFilename();
    this.pageCount = this.instance.getPageCount();
    this.completePromise = await this.instance.getDocumentCompletePromise().then(async () => {
      // Load full document text
      for (let pageIndex = 1; pageIndex <= this.pageCount; pageIndex++) {
        try {
          const pageText = await this.instance.loadPageText(pageIndex);
          this.text += `<<PAGE_BREAK>> Page ${pageIndex}\n${pageText}\n\n`;
        } catch (error) {
          this.text += `<<PAGE_BREAK>> Page ${pageIndex}\n[Error loading page content]\n\n`;
          continue;
        }
      }
    });
    this.isValid = this.instance &&
      this.completePromise &&
      this.pageCount > 0 &&
      this.text.length > 0;
    }
}

export default DocumentManager;