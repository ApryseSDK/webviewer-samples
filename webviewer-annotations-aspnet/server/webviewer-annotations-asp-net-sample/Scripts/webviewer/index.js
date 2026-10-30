const viewerElement = document.getElementById('viewer');
const DOCUMENT_ID = 'webviewer-demo-1';

WebViewer({
  path: '/Scripts/webviewer/lib'
}, viewerElement).then(async instance => {
  const {annotationManager, documentViewer} = instance.Core;

  // Set the retriever before loading the document so saved annotations are merged in on load
  await documentViewer.setDocumentXFDFRetriever(() => loadXfdfString(DOCUMENT_ID));
  instance.UI.loadDocument('https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf');

  // Add a save button on header
  const topHeader = instance.UI.getModularHeader('default-top-header');
  const items = topHeader.getItems();
  
  const saveButton = {
    type: 'customButton',
    img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
    title: 'Save Annotations',
    onClick: async function() {
      // Save annotations when button is clicked
      // widgets and links will remain in the document without changing so it isn't necessary to export them
      try {
        const xfdfString = await annotationManager.exportAnnotations({ links: false, widgets: false });
        await saveXfdfString(DOCUMENT_ID, xfdfString);
        alert('Annotations saved successfully.');
      } catch {
        alert('Annotations not saved successfully.');
      }
    }
  };

  items.push(saveButton);
  topHeader.setItems(items);
});

// Make a POST request with XFDF string
const saveXfdfString = async function(id, xfdfString) {
  const res = await fetch(`/api/annotation?id=${id}`, {
    method: 'POST',
    body: xfdfString
  });
  if (res.status !== 200 && res.status !== 204) {
    throw new Error(`Failed to save annotations: ${res.status}`);
  }
};

// Make a GET request to get XFDF string
const loadXfdfString = async function(id) {
  const res = await fetch(`/api/annotation?id=${id}`, {
    method: 'GET'
  });
  if (res.status !== 200 && res.status !== 204) {
    throw new Error(`Failed to load annotations: ${res.status}`);
  }
  return res.text();
};
