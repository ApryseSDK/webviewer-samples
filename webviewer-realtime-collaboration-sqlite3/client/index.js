const viewerElement = document.getElementById('viewer');

let annotationManager = null;
const DOCUMENT_ID = 'webviewer-demo-1';
const hostName = window.location.hostname;
const url = `ws://${hostName}:8181`;
const connection = new WebSocket(url);
const nameList = ['Andy', 'Andrew', 'Logan', 'Justin', 'Matt', 'Sardor', 'Zhijie', 'James', 'Kristian', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'David', 'Joseph', 'Thomas', 'Naman', 'Nancy', 'Sandra'];
const serializer = new XMLSerializer();

const sendAnnotationChanges = (annotations, action) => {
  if (!annotations) {
    return;
  }

  annotations.childNodes.forEach((child) => {
    sendAnnotationChange(child, action);
  });
};

connection.onerror = error => {
  console.warn(`Error from WebSocket: ${error}`);
}

WebViewer.Iframe({
  path: 'lib', // path to the PDFTron 'lib' folder
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
  documentXFDFRetriever: async () => {
    const rows = await loadXfdfStrings(DOCUMENT_ID);
    return JSON.parse(rows).map(row => row.xfdfString);
  },
}, viewerElement).then( instance => {

  // Instance is ready here
  instance.UI.openElements(['leftPanel']);
  annotationManager = instance.Core.documentViewer.getAnnotationManager();
  // Assign a random name to client
  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);
  annotationManager.setCurrentUser(nameList[Math.floor((randomValue[0] / 2 ** 32) * nameList.length)]);
  annotationManager.addEventListener('annotationChanged', async (_annotations, _action, info = {}) => {
    // If annotation change is from import, return
    if (info.imported) {
      return;
    }

    const xfdfString = await annotationManager.exportAnnotationCommand();
    // Parse xfdfString to separate multiple annotation changes to individual annotation change
    const parser = new DOMParser();
    const commandData = parser.parseFromString(xfdfString, 'text/xml');
    const addedAnnots = commandData.getElementsByTagName('add')[0];
    const modifiedAnnots = commandData.getElementsByTagName('modify')[0];
    const deletedAnnots = commandData.getElementsByTagName('delete')[0];

    // List of added annotations
    sendAnnotationChanges(addedAnnots, 'add');
    // List of modified annotations
    sendAnnotationChanges(modifiedAnnots, 'modify');
     // List of deleted annotations
    sendAnnotationChanges(deletedAnnots, 'delete');
  });

  connection.onmessage = async (message) => {
    const data = typeof message.data === 'string' ? message.data : await message.data.text();
    const annotation = JSON.parse(data);
    const annotations = await annotationManager.importAnnotationCommand(annotation.xfdfString);
    await annotationManager.drawAnnotationsFromList(annotations);
  }
});

const loadXfdfStrings = (documentId) => {
  return new Promise((resolve, reject) => {
    fetch(`/server/annotationHandler.js?documentId=${documentId}`, {
      method: 'GET',
    }).then((res) => {
      if (res.status < 400) {
        res.text().then(xfdfStrings => {
          resolve(xfdfStrings);
        });
      } else {
        reject(new Error(`Failed to load XFDF strings for document ${documentId}: ${res.status} ${res.statusText}`));
      }
    }).catch((error) => {
      reject(new Error(`Failed to fetch XFDF strings for document ${documentId}: ${error.message}`));
    });
  });
};


// wrapper function to convert xfdf fragments to full xfdf strings
const convertToXfdf = (changedAnnotation, action) => {
  let xfdfString = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><fields />`;
  if (action === 'add') {
    xfdfString += `<add>${changedAnnotation}</add><modify /><delete />`;
  } else if (action === 'modify') {
    xfdfString += `<add /><modify>${changedAnnotation}</modify><delete />`;
  } else if (action === 'delete') {
    xfdfString += `<add /><modify /><delete>${changedAnnotation}</delete>`;
  }
  xfdfString += `</xfdf>`;
  return xfdfString;
}

// helper function to send annotation changes to WebSocket server
const sendAnnotationChange = (annotation, action) => {
  if (annotation.nodeType !== annotation.TEXT_NODE) {
    const annotationString = serializer.serializeToString(annotation);
    connection.send(JSON.stringify({
      documentId: DOCUMENT_ID,
      annotationId: annotation.getAttribute('name'),
      xfdfString: convertToXfdf(annotationString, action)
    }));
  }
}