const viewerElement = document.getElementById("viewer");

const openFileBtn = document.getElementById("open");
const saveFileBtn = document.getElementById("save");

WebViewer(
  {
    path: "../lib/webviewer",
    initialDoc: "https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf",
  },
  viewerElement
).then((instance) => {
  // Interact with APIs here.
  instance.UI.setTheme('dark');
  instance.UI.disableElements(['downloadButton']);

  const { documentViewer, annotationManager } = instance.Core;

  openFileBtn.onclick = async () => {
    const filePath = await window.electronAPI.openFile();
    if (!filePath) {
      return;
    }
    instance.UI.loadDocument(filePath);
  };

  saveFileBtn.onclick = async () => {
    const doc = documentViewer.getDocument();
    const xfdfString = await annotationManager.exportAnnotations();
    const data = await doc.getFileData({
      // saves the document with annotations in it
      xfdfString,
    });
    const arr = new Uint8Array(data);

    window.electronAPI.saveFile(arr);
  };
});
