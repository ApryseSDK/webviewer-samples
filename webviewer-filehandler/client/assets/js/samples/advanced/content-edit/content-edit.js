WebViewer(
  {
    path: '../../../lib',
    initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf',
    enableFilePicker: true,
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);

  instance.UI.enableElements(['contentEditButton']);
  instance.UI.setToolbarGroup(instance.UI.ToolbarGroup.EDIT);

  const { documentViewer, Tools } = instance.Core;

  documentViewer.addEventListener('documentLoaded', () => {
    documentViewer.setToolMode(documentViewer.getTool(Tools.ToolNames.CONTENT_EDIT));
  });

  document.getElementById('file-picker').onchange = e => {
    const file = e.target.files[0];
    if (file) {
      instance.UI.loadDocument(file);
    }
  };

  document.getElementById('url-form').onsubmit = e => {
    e.preventDefault();
    instance.UI.loadDocument(document.getElementById('url').value);
  };
});
