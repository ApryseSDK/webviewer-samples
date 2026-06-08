'use client';

import { WebViewerInstance } from '@pdftron/webviewer';
import { useEffect, useRef } from 'react';

function addSampleRectangleAnnotation(instance: WebViewerInstance) {
  const { annotationManager, Annotations } = instance.Core;
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
}

// Due to SSR in Next.js, we need to import the module dynamically, to avoid window is not defined error due to re-rendering.
// Read more here: https://github.com/vercel/next.js/discussions/42319
function initializeWebViewer(container: HTMLDivElement) {
  import('@pdftron/webviewer').then((module) => {
    const WebViewer = module.default;
    WebViewer(
      {
        path: '/lib/webviewer',
        initialDoc: 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf',
        licenseKey: 'YOUR_LICENSE_KEY'  // sign up to get a free trial key at https://dev.apryse.com
      },
      container,
    ).then((instance: WebViewerInstance) => {
      const { documentViewer } = instance.Core;
      // Run APIs here.
      documentViewer.addEventListener('documentLoaded', () => addSampleRectangleAnnotation(instance));
    });
  });
}

export default function Viewer() {
  const viewer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewer.current) return;
    initializeWebViewer(viewer.current);
  }, []);

  return (
    <div className="h-full w-full" ref={viewer}></div>
  );
}

