import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';

const Viewer = ({ docToLoad }) => {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer.Iframe(
      {
        path: '/webviewer/lib',
        initialDoc: docToLoad,
        ui: 'legacy',
        loadAsPDF: true,
      },
      viewer.current,
    ).then((instance) => {
      if (!window.instance) {
        window.instance = instance;
      }
      instance.UI.enableFeatures([
        'ThumbnailMultiselect',
        'MultipleViewerMerging',
      ]);
      instance.UI.enableElements(['documentControl']);
      instance.UI.openElements(['leftPanel']);
    });
  }, []);

  return <div className="webviewer" ref={viewer}></div>;
};

export default Viewer;
