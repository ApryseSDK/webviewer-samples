import { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import { initializeBimViewer } from '@pdftron/webviewer-bim-client';

import './App.css';

function App() {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer.Iframe(
      { path: '/webviewer/lib' },
      viewer.current,
    ).then(async instance => {

      const license = `---- Insert commercial license key here after purchase ----`;
      const serverURL = `---- Insert server URL after setup ----`;

      const options = getViewerOptions(license);
      const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
      webviewerBIM.File.load3dAsset('<uri for 3d asset>');
    });
  }, []);

  function getViewerOptions(license) {
    return {
      license,
      dataSchema: {
        headerName: 'Name',
        defaultValues: {
          Description: 'Description',
          GlobalID: 'GlobalId',
          Handle: 'handle',
        },
        groups: {
          ExampleGroup01: {
            ObjectType: 'ObjectType',
            ObjectPlacement: 'ObjectPlacement',
          },
        },
        groupOrder: ['ExampleGroup01'],
        removeEmptyRows: true,
        removeEmptyGroups: true,
        createMiscGroup: true,
      }
    };
  }

  return (
    <div className="webviewer-bim-container">
      <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
    </div>
  );
}

export default App;
