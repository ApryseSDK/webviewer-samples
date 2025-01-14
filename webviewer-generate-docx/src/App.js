import './App.css';
import { useEffect, useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import Viewer from './components/Viewer';
import WebViewerContext from './context/webviewer.js';

function App() {
  const [instance, setInstance] = useState();

  // generate DOCX document
  const generateDocx = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun('Hello World'),
                new TextRun({
                  text: 'Foo Bar',
                  bold: true,
                }),
                new TextRun({
                  text: '\tGithub is the best',
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    return blob;
  };

  useEffect(() => {
    const generateAndLoadDocument = async () => {
      const docBlob = await generateDocx();
      await instance.Core.documentViewer.loadDocument(docBlob, {
        extension: 'docx',
      });
    };
    if (instance) {
      generateAndLoadDocument();
    }
  }, [instance]);

  return (
    <WebViewerContext.Provider value={{ instance, setInstance }}>
      <div className='App'>
        <Viewer />
      </div>
    </WebViewerContext.Provider>
  );
}

export default App;
