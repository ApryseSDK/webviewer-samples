'use client';

import { WebViewerInstance } from '@pdftron/webviewer';
import { Ref, useEffect, useState, useRef } from 'react';

export default function Viewer() {
  const viewer: Ref<HTMLDivElement | any> = useRef(null);
  const [webviewerInstance, setWebViewerInstance] = useState<WebViewerInstance | any>(null);

  useEffect(() => {
    // Due to SSR in Next.js, we need to import the module dynamically, to avoid window is not defined error due to re-rendering.
    // Read more here: https://github.com/vercel/next.js/discussions/42319
    import('@pdftron/webviewer').then((module) => {
      const WebViewer = module.default;
      WebViewer(
        {
          path: '/webviewer/lib',
          initialDoc: '/files/webviewerdemodoc.pdf',
          licenseKey: 'your_license_key'  // sign up to get a free trial key at https://dev.apryse.com
        },
        viewer.current,
      ).then((instance: WebViewerInstance) => {
        const { documentViewer, annotationManager, Annotations } = instance.Core;
        // Run APIs here.

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
          // need to draw the annotation otherwise it won't show up until the page is refreshed
          annotationManager.redrawAnnotation(rectangleAnnot);
        });
        setWebViewerInstance(instance);
      });
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen h-screen">
      <div className="flex flex-row p-4 bg-apryse-blue justify-between w-full align-middle">
        <h1 className="text-xl font-bold align-middle">
          Apryse WebViewer
        </h1>
        <button className="bg-white text-black rounded p-1" onClick={() => window.open('https://docs.apryse.com/documentation/web/guides/', '_blank')}>Guides</button>
      </div>
      <div className="h-full " ref={viewer}></div>
    </div>
  );
}

