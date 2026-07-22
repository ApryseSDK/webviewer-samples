import { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

const App = () => {
  const viewer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewerElement = viewer.current;
    if (!viewerElement) return;

    WebViewer(
      {
        path: '/lib/webviewer',
        initialDoc: 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf',
        licenseKey: import.meta.env.VITE_DEMO_KEY,  // sign up to get a free trial key at https://dev.apryse.com
      },
      viewerElement,
    ).then((instance) => {
      // Access WebViewer instance here
      const { documentViewer, annotationManager, Annotations } = instance.Core;

      // Example: Add a rectangle annotation to the first page when the document is loaded
      documentViewer.addEventListener('documentLoaded', () => {
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: 1,
          // values are in page coordinates with (0, 0) in the top left
          X: 100,
          Y: 150,
          Width: 200,
          Height: 50,
          Author: annotationManager.getCurrentUser()
        });

        annotationManager.addAnnotation(rectangleAnnot);
        // Need to draw the annotation otherwise it won't show up until the page is refreshed
        annotationManager.redrawAnnotation(rectangleAnnot);
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
