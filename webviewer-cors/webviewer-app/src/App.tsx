import React, { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

function App() {
  const viewer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    WebViewer(
      {
        path: 'http://localhost:8081/lib/',
      },
      viewer.current as HTMLDivElement,
    ).then((instance) => {
      const url = 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf';
      instance.UI.loadDocument(url);

      const { documentViewer, Annotations } = instance.Core;
      documentViewer.addEventListener('documentLoaded', () => {
        const annotManager = documentViewer.getAnnotationManager();
        const rectangle = new Annotations.RectangleAnnotation();
        rectangle.PageNumber = 2;
        rectangle.X = 100;
        rectangle.Y = 100;
        rectangle.Width = 250;
        rectangle.Height = 250;
        rectangle.Author = annotManager.getCurrentUser();
        annotManager.addAnnotation(rectangle);
      });
    });

  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
