/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 */

import './index.css';
import WebViewer from '@pdftron/webviewer';

const viewerElement = document.getElementById('viewer');
if (!viewerElement) {
  throw new Error('Could not find element with id "viewer"');
}

const openFileBtn = document.getElementById("open");
if (!openFileBtn) {
  throw new Error('Could not find element with id "open"');
}

const saveFileBtn = document.getElementById("save");
if (!saveFileBtn) {
  throw new Error('Could not find element with id "save"');
}

const licenseKey = import.meta.env.VITE_DEMO_KEY;

WebViewer({
  path: './lib/webviewer', // path to the Apryse 'lib' folder on your server
  initialDoc: 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf',
  licenseKey,
 },
  viewerElement)
 .then(instance => {
   // Interact with APIs here.
  instance.UI.setTheme('dark');
  instance.UI.disableElements(['downloadButton']);

  const { documentViewer, annotationManager } = instance.Core;

  openFileBtn.onclick = async () => {
    const file = await window.electronAPI.openFile();
    if (!file) {
      return;
    }
    // The filename tells WebViewer which file type it's loading
    await instance.UI.loadDocument(new Blob([file.data]), { filename: file.name });
  };

  saveFileBtn.onclick = async () => {
    const doc = documentViewer.getDocument();
    const xfdfString = await annotationManager.exportAnnotations();
    const data = await doc.getFileData({
      // saves the document with annotations in it
      xfdfString,
    });
    const arr = new Uint8Array(data);

    // Pass the current filename so the save dialog can suggest it
    await window.electronAPI.saveFile(arr, doc.getFilename());
  };
 })
 .catch((error: unknown) => {
   console.error('Failed to initialize WebViewer:', error);
 });
