window.webviewerFunctions = {
  initWebViewer: function () {
      const viewerElement = document.getElementById('viewer');
      WebViewer({
          path: 'lib',
          initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf', // replace with your own PDF file
      }, viewerElement).then((instance) => {
          // call apis here
      })
  }
};