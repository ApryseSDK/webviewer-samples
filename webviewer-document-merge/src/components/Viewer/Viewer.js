import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';

const Viewer = ({ docToLoad }) => {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer.Iframe(
      {
        path: '/lib/webviewer',
        initialDoc: docToLoad,
        ui: 'legacy',
        loadAsPDF: true,
        enableFilePicker: true,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="webviewer" ref={viewer}></div>;
};

export default Viewer;
