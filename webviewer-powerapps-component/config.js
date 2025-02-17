(() => {
  window.addEventListener('viewerLoaded', () => {
    const { instance } = window;

    // instance.UI.disableElements(['printButton']);
    // instance.UI.disableElements(['downloadButton']);

    //add custom save button
    const { documentViewer, annotationManager } = instance.Core;

    const topHeader = instance.UI.getModularHeader('default-top-header');
    const items = topHeader.getItems();

    const saveButton = {
      type: 'customButton',
      img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
      onClick: async () => {
        const doc = documentViewer.getDocument();
        const xfdfString = await annotationManager.exportAnnotations();
        const data = await doc.getFileData({
          // saves the document with annotations in it
          xfdfString
        });
        const arr = new Uint8Array(data);
        const blob = new Blob([arr], { type: 'application/pdf' });
        let a = URL.createObjectURL(blob);
        const payload = {
            file: a
        };
        window.parent.postMessage({ type: 'SAVE_DOCUMENT', payload }, '*');
      }
    };
    items.push(saveButton);
    topHeader.setItems(items);
  });

  window.addEventListener("message", receiveMessage, false);
})();

function receiveMessage(event) {
  /**
   * @note If you are using WebViewer version <= 7.x, please uncomment the line
   * below
   */
  // const instance = readerControl;
  if (event.isTrusted && typeof event.data === 'object') {
    switch (event.data.type) {
      case 'OPEN_DOCUMENT':
        instance.loadDocument(event.data.payload.file, {
          officeOptions: {
            disableBrowserFontSubstitution: true,
          }
        })
        break;
      default:
        break;
    }
  }
}