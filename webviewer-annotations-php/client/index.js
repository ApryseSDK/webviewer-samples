const viewerElement = document.getElementById('viewer');
const DOCUMENT_ID = 'webviewer-demo-1';

WebViewer({
  path: 'lib',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf',
  documentXFDFRetriever: () => loadXfdfString(DOCUMENT_ID)
}, viewerElement).then(instance => {
  const { annotationManager } = instance.Core;
  
  // Add a save button on header
  const topHeader = instance.UI.getModularHeader('default-top-header');
  const items = topHeader.getItems();
  
  const saveButton = {
    type: 'customButton',
    img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
    title: 'Save Annotations',
    onClick: function() {
      // Save annotations when button is clicked
      // widgets and links will remain in the document without changing so it isn't necessary to export them
      annotationManager.exportAnnotations({ links: false, widgets: false }).then(function (xfdfString) {
        saveXfdfString(DOCUMENT_ID, xfdfString).then(function() {
          alert('Annotations saved successfully.');
        }).catch(function () {
          alert('Annotations not saved successfully.');
        });
      });
    }
  };
    
  items.push(saveButton);
  topHeader.setItems(items);
});


// Make a POST request with XFDF string
const saveXfdfString = function(documentId, xfdfString) {
  return new Promise(function(resolve) {
    fetch(`../server/annotationHandler.php?documentId=${documentId}`, {
      method: 'POST',
      body: xfdfString
    }).then(function(res) {
      if (res.status === 200) {
        resolve();
      }
    });
  });
};

// Make a GET request to get XFDF string
const loadXfdfString = function(documentId) {
  return new Promise(function(resolve) {
    fetch(`../server/annotationHandler.php?documentId=${documentId}`, {
      method: 'GET'
    }).then(function(res) {
      if (res.status === 200) {
        res.text().then(function(xfdfString) {
          resolve(xfdfString);
        })
      }
    });
  });
};
