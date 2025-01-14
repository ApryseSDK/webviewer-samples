import React, { useRef, useEffect, useContext } from 'react';
import WebViewer from '@pdftron/webviewer';
import WebViewerContext from '../context/webviewer.js';

const Viewer = () => {
  const viewer = useRef(null);
  const { setInstance } = useContext(WebViewerContext);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
      },
      viewer.current
    ).then((instance) => {
      setInstance(instance);
    });
  }, []);

  return <div className='webviewer' ref={viewer} style={{height: "100vh"}}></div>;
};

export default Viewer;
