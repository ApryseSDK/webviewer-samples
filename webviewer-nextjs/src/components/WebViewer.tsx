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
          path: '/lib/webviewer',
          initialDoc: 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf',
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
    <div className="h-full w-full" ref={viewer}></div>
  );
}

