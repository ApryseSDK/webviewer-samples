
var viewerElement = document.getElementById('viewer');
var DOCUMENT_ID = 'webviewer-demo-1';

WebViewer.Iframe({
  path: 'lib',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf',
  documentXFDFRetriever: async () => {
    const rows = await loadxfdfStrings(DOCUMENT_ID);
    return JSON.parse(rows).map(row => row.xfdfString);
  }
}, viewerElement).then(instance => {
  var docViewer = instance.Core.documentViewer;
  var annotManager = docViewer.getAnnotationManager();

  // Save when annotation change event is triggered (adding, modifying or deleting of annotations)
  annotManager.addEventListener('annotationChanged', function(annots, action, options) {
    // If the event is triggered by importing then it can be ignored
    // This will happen when importing the initial annotations from the server or individual changes from other users
    if (options.imported) return;

    annotManager.exportAnnotationCommand().then(function (xfdfStrings) {
      annots.forEach(function(annot) {
        savexfdfString(DOCUMENT_ID, annot.Id, xfdfStrings);
      });
    });
  });
});

// Make a POST request with document ID, annotation ID and XFDF string
var savexfdfString = function(documentId, annotationId, xfdfString) {
  return new Promise(function(resolve) {
    fetch(`/server/annotationHandler.js?documentId=${documentId}`, {
      method: 'POST',
      body: JSON.stringify({
        annotationId,
        xfdfString
      })
    }).then(function(res) {
      if (res.status === 200) {
        resolve();
      }
    });
  });
};

// Make a GET request to get XFDF string
var loadxfdfStrings = function(documentId) {
  return new Promise(function(resolve) {
    fetch(`/server/annotationHandler.js?documentId=${documentId}`, {
      method: 'GET'
    }).then(function(res) {
      if (res.status === 200) {
        res.text().then(function(xfdfStrings) {
          resolve(xfdfStrings);
        });
      }
    });
  });
};
