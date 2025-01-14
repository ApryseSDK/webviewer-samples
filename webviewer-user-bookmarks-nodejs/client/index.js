var viewerElement = document.getElementById('viewer');
var DOCUMENT_ID = 'webviewer-demo-1';

WebViewer({
  path: 'lib',
  initialDoc: './webviewer-demo.pdf',
  // ui: 'legacy',
}, viewerElement).then((instance) => {

  instance.UI.addEventListener('userBookmarksChanged', e => {
    const bookmarks = e.detail;
    const bookmarksString = JSON.stringify(bookmarks);
    saveBookmarksString(DOCUMENT_ID, bookmarksString).then(() => {
      console.log('Bookmarks saved successfully.');
    });
  });

  const onSaveBookmarks = () => {
    const bookmarks = instance.UI.exportBookmarks();
    const bookmarksString = JSON.stringify(bookmarks);
    saveBookmarksString(DOCUMENT_ID, bookmarksString).then(() => {
      alert('Bookmarks saved successfully.');
    });
  };

  /** Legacy UI: Uncomment this to add a save button to the header */
  // instance.UI.enableElements(['bookmarksPanel', 'bookmarksPanelButton']);
  // instance.UI.setHeaderItems((header) => {
  //   header.push({
  //     type: 'actionButton',
  //     img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
  //     onClick: onSaveBookmarks,
  //   });
  // });
  /** End of Legacy UI */


  /** Modular UI: Add a save button to the header */
  // Comment this out on legacy UI
  const saveButton = new instance.UI.Components.CustomButton({
    dataElement: 'customButton',
    title: 'Save Bookmarks',
    onClick: onSaveBookmarks,
    img: 'icon-save',
  });
  const defaultHeader = instance.UI.getModularHeader('default-top-header');
  defaultHeader.setItems([...defaultHeader.getItems(), saveButton]);
  /** End of Modular UI */


  // Load bookmarks when document is loaded
  instance.Core.documentViewer.addEventListener('documentLoaded', () => {
    loadBookmarksString(DOCUMENT_ID).then((bookmarksString = '') => {
      const bookmarks = JSON.parse(bookmarksString);
      instance.UI.importBookmarks(bookmarks);
    });
  });
});


// Make a POST request with bookmarks string
const saveBookmarksString = (documentId, bookmarksString) => {
  return new Promise((resolve) => {
    fetch(`/server/bookmarksHandler.js?documentId=${documentId}`, {
      method: 'POST',
      body: bookmarksString
    }).then((response) => {
      if (response.status === 200) {
        resolve();
      }
    });
  });
};

// Make a GET request to get bookmarks string
const loadBookmarksString = (documentId) => {
  return new Promise((resolve) => {
    fetch(`/server/bookmarksHandler.js?documentId=${documentId}`, {
      method: 'GET'
    }).then((response) => {
      if (response.status === 200) {
        response.text().then((bookmarksString) => {
          resolve(bookmarksString);
        })
      }
    });
  });
};
