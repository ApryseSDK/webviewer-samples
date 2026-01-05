// ES6 Compliant Syntax
// GitHub Copilot - Claude Sonnet 4.5 - December 22, 2025
// App.jsx

import { useEffect, useRef, useState } from 'react'
import WebViewer from '@pdftron/webviewer'
import './App.css'


function App() {
  const viewer = useRef(null);
  const [linearized, setLinearized] = useState('');

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        l: 'YOUR_LICENSE_KEY',
        fullAPI: true,
      },
      viewer.current
    ).then((instance) => {
      console.log('WebViewer instance ready', instance);

      const { documentViewer } = instance.Core;

      instance.UI.loadDocument('http://localhost:4000/linearized');

      document.getElementById('sample-button').addEventListener('click', async () => {
        const pdfDoc = await documentViewer.getDocument().getPDFDoc();
        const isLinearized = await pdfDoc.isLinearized();
        setLinearized(isLinearized ? '✅ File is linearized' : '❌ File is not linearized');
      });
    });
  }, []);

  return (
    <>
      <div className="App">
        <div className="button-container">
          <button id="sample-button">Check if file is linearized</button>
          <div id="result-box">{linearized}</div>
        </div>
        <div className="webviewer" ref={viewer}></div>
      </div>
    </>
  );
}


export default App
