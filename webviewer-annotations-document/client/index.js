const viewerElement = document.getElementById('viewer');
WebViewer({
  path: 'lib',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf',
}, viewerElement).then(instance => {
  const {documentViewer, annotationManager} = instance.Core;

  // Add a save button on header
  const topHeader = instance.UI.getModularHeader('default-top-header');
  const items = topHeader.getItems();

  const saveButton = {
    type: 'customButton',
    img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
    title: 'Save Annotations',
    onClick: function() {
      // Update the document when button is clicked
      saveDocument('demo.pdf').then(function() {
        alert('Annotations saved to the document.');
      });
    }
  };

  items.push(saveButton);
  topHeader.setItems(items);

  // Make a POST request with blob data for a PDF with new annotations
  const saveDocument = function(filename) {
    return new Promise(function(resolve) {
      annotationManager.exportAnnotations().then(function(xfdfString) {
        documentViewer.getDocument().getFileData({ xfdfString }).then(function(data) {
          const arr = new Uint8Array(data);
          const blob = new Blob([ arr ], { type: 'application/pdf' });
          // FormData is used to send blob data through fetch
          const formData = new FormData();
          formData.append('blob', blob);
          fetch(`/server/annotationHandler.js?filename=${filename}`, {
            method: 'POST',
            body: formData
          }).then(function(res) {
            if (res.status === 200) {
              resolve();
            }
          });
        });
      });
    });
  };
});
