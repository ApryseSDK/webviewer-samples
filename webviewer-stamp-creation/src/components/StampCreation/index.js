import React, { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/webviewer';
import { initializeStampCreation } from './bootstrap.ts';
import './styles.css';

const StampCreation = () => {
  const mainViewerRef = useRef(null);
  const portalRef = useRef(null);
  const designerViewerRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let stampCreation;

    initializeStampCreation({
      WebViewerConstructor: WebViewer,
      mainViewerElement: mainViewerRef.current,
      portalElement: portalRef.current,
      designerViewerElement: designerViewerRef.current,
    }).then((result) => {
      if (disposed) {
        result.designer.dispose();
        result.instance.UI.dispose?.();
        return;
      }
      stampCreation = result;
    }).catch(console.error);

    return () => {
      disposed = true;
      stampCreation?.designer.dispose();
      stampCreation?.instance.UI.dispose?.();
    };
  }, []);

  return (
    <main className="stamp-creation">
      <div ref={mainViewerRef} id="viewer" />
      <div ref={portalRef} id="stamp-designer-portal" className="stamp-designer-portal">
        <div className="stamp-designer-shell">
          <div ref={designerViewerRef} id="stamp-designer-viewer" />
        </div>
      </div>
    </main>
  );
};

export default StampCreation;
