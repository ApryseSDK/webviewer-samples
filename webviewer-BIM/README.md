# WebViewer BIM

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample uses the BIM addon for WebViewer. It allows you to view, annotate, and collaborate on 3D models.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Features

- Load models from your own servers without relying on the cloud.
- Navigate complex BIM models with the look and feel of the familiar Webviewer UI.
- Traverse the model tree and toggle visibility of objects.
- View model properties and rich metadata such as material and dimensional information.
- Annotate BIM models to track design issues.

![webviewer-bim-1-0-0](https://user-images.githubusercontent.com/15149835/178818619-700cd6ea-2671-45b0-b30c-5312e9b52b52.png)

## Architecture

There are two components to WebViewer BIM:

1. Server-side file conversion that supports 3D streaming to the client.
2. Client-side 3D viewer that renders BIM models and allows navigation entirely encapsulated in our familiar WebViewer UI.

## Running the sample

To get the sample working, both WebViewer BIM client and server must be setup and running. The server URL will be referenced in the front-end to allow communication between client and server.

## Setting up Webviewer BIM Server

The server comes packaged as either a binary or a Docker image available for Linux or Windows. For server setup, configuration, and API details please read the Webviewer BIM Server [README](SERVER_README.md).

The server is supported on Windows, Linux and MacOS Intel (M1 not supported).

## Prerequisites
- Server license key provided by Apryse.
  - **Request a [trial license key](https://apryse.com/form/trial-support) to try for free.**
- Install [Docker](https://docs.docker.com/get-docker/).

## Setup server

- See [Setting up server](SERVER_README.md#setting-up-server) section to download and setup the server.
- See [Configuring server](SERVER_README.md#configuring-server) section to configure the server with provided license key.

## Run server

- See [Running server](SERVER_README.md#running-server) section to run the server.

## Server APIs

- See [Server APIs](SERVER_README.md#current-api) section for details on the WebViewer BIM Server APIs.

## Setting up Webviewer BIM Client

## Setup application

1. Run the following:
```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-BIM
npm install
```

2. Change `serverURL` variable in `App.js` to wherever your server is hosted. See [Setting up WebViewer BIM Server](#setting-up-webviewer-bim-server) section for details.

## Run application

After setup is complete, run the application:

```js
npm start
```

## Usage

## initializeBimViewer(instance, serverURL, options)

Call `initializeBimViewer` within the promise resolve of WebViewer instance to initialize BIM viewer.
- `instance` - WebViewer instance that is available after initializing.
- `serverURL` - URL of WebViewer BIM server.
- `options` - Initialization options for WebViewer BIM.
	- `license` - WebViewer BIM license key.
	- `dataSchema` - Options to define schema of the properties panel.

Returns a promise that resolves to an object containing the functions needed to load models in WebViewer.

```js
import  Webviewer  from  '@pdftron/webviewer';
import { initializeBimViewer } from '@pdftron/webviewer/bim-client'

function App() {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer(
      { path: '/webviewer/lib' },
      viewer.current,
    ).then(async instance => {

      const license = `---- Insert commercial license key here after purchase ----`;
      const serverURL = `---- Insert server URL after setup ----`;

      const options = getViewerOptions(license);
      const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
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
      <div className="webviewer" ref={viewer} style={{ height: "100vh" }}></div>
    </div>
  );
}
```

## load3dAsset(pathToAsset)

Call `load3dAsset` after initializing the 3D viewer to load an IFC model.
- `pathToAsset` - URL or path to IFC model.

```js
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
webviewerBIM.File.load3dAsset('<uri for 3d asset>');
```

## preload3dAsset(serverURL, pathToAsset, conversionOptions)

Static method that preloads an IFC model for future loading. This can be used to convert model data prior to loading. If 'enable_auth' is enabled on your BIM server you will also receive an Auth token for both the model data and the properties data.
- `serverURL` - URL to your BIM server instance.
- `pathToAsset` - URL or path to IFC model.
- `conversionOptions` - Optional options object to modify load behavior.

```js
import { preload3dAsset } from '@pdftron/webviewer-bim-client';
```

```js
const assetObject = await preload3dAsset(<serverURL>, <pathToAsset>, <conversionOptions>);

/*
Sample Asset Object
{
   modelData: {
	id: '7bdb6aeab27191a882b9d3ed1e48afd4b490d755',
	auth: 'be36e17d84d9eac35f41aef4cd9dc6e894f9f452b96175b2075308725338c3fe'
   },
   propertiesData: {
	id: 'b204f18fb2168dc547d5056721c50ceb5bb3c62b',
	auth: 'fa34e17d84g3awe35f41aef4cd9dc6e894f9f452b96175b2075308725338c3fe'
   }
};
*/
```

## loadCached3dAsset(assetObject)

Call `loadCached3dAsset` to load an existing asset from the BIM server
- `assetObject` - Object containing the ids for the asset data and optionally properties data. If 1enable_auth1 is enabled on your BIM server you will also need to include an Auth token for both the model data and the properties data.

```js
sampleAssetObject = {
   modelData: {
	id: '7bdb6aeab27191a882b9d3ed1e48afd4b490d755',
	auth: 'be36e17d84d9eac35f41aef4cd9dc6e894f9f452b96175b2075308725338c3fe'
   },
   propertiesData: {
	id: 'b204f18fb2168dc547d5056721c50ceb5bb3c62b',
	auth: 'fa34e17d84g3awe35f41aef4cd9dc6e894f9f452b96175b2075308725338c3fe'
   }
};
	
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
const assetObject = await webviewerBIM.File.loadCached3dAsset(sampleAssetObject);
```

## checkAssetConversionProgress(assetObject)

Call `checkAssetConversionProgress` to check the progress on a preloaded Asset.
- `assetObject` - Object containing the ids for the asset data and optionally properties data.

Returns True if the asset is ready to be loaded, false otherwise.

```js
sampleAssetObject = {
   modelData: {
	id: '7bdb6aeab27191a882b9d3ed1e48afd4b490d755',
	auth: 'be36e17d84d9eac35f41aef4cd9dc6e894f9f452b96175b2075308725338c3fe'
   },
   propertiesData: {
	id: 'b204f18fb2168dc547d5056721c50ceb5bb3c62b',
	auth: 'fa34e17d84g3awe35f41aef4cd9dc6e894f9f452b96175b2075308725338c3fe'
   }
};
	
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
	
// rudimentary polling against the BIM server to know when the Asset is ready
while (true) {
  const status = await webviewerBim.File.checkAssetConversionProgress(assetObject);
  if (status === true) {
    break;
  }
  await new Promise((r) => setTimeout(r, 200));
}
	
const assetObject = await webviewerBIM.File.loadCached3dAsset(sampleAssetObject);
```

## unmountBimViewer()

Call `unmountBimViewer` to revert WebViewer back to its original state, and to clear any memory from the WebViewer BIM client.
```js
import  Webviewer  from  '@pdftron/webviewer';
import { initializeBimViewer, unmountBimViewer } from '@pdftron/webviewer-bim-client'
```

```js
  const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
  webviewerBIM.File.load3dAsset("Add URL to your 3D asset here");
 
 // Call unmountBimViewer when you're ready to unmount.
 // unmountBimViewer(instance);
```

## enableSSAO()

Call `enableSSAO` to enable screen-space ambient occlusion for the viewer.

```js
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
webviewerBIM.Viewer.enableSSAO();
```

## disableSSAO()

Call `disableSSAO` to disable screen-space ambient occlusion for the viewer.

```js
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
webviewerBIM.Viewer.disableSSAO();
```

## setSSAOOptions()

Call `setSSAOOptions` to adjust screen-space ambient occlusion for the viewer.

```js
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
webviewerBIM.Viewer.setSSAOOptions({
 // example parameters：
 isDynamicRadius: true,
 radius: 1,
 loops: 64,
 blurRadius: 2,
 power: 1.4,
})
```

## enableAntiAliasing()

Call `enableAntiAliasing` to enable anti-aliasing for the viewer.

```js
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
webviewerBIM.Viewer.enableAntiAliasing();
```

## disableAntiAliasing()

Call `disableAntiAliasing` to disable anti-aliasing for the viewer.

```js
const webviewerBIM = await initializeBimViewer(instance, serverURL, options);
webviewerBIM.Viewer.disableAntiAliasing();
```

## setCameraSensitivity(number)

Call `setCameraSensitivity` to set the sensitivity for Orbit/Pan tool.
- `number` to set the sensitivity

```js
const { documentViewer } = instance.Core;
const cameraTools = {
  orbit: 'Orbit3D',
  pan: 'Pan3D',
  walk: 'Walk',
};
const panTool = documentViewer.getTool(cameraTools.pan);
panTool.setCameraSensitivity(10);
```

## getCameraSensitivity()

Call `getCameraSensitivity` to get the sensitivity for Orbit/Pan tool.
Returns a value of Number

```js
const { documentViewer } = instance.Core;
const cameraTools = {
  orbit: 'Orbit3D',
  pan: 'Pan3D',
  walk: 'Walk',
};

const orbitTool = documentViewer.getTool(cameraTools.orbit);
orbitTool.getCameraSensitivity();
```

## Framework Agnostic Setup

This project sample uses React as the front-end framework, but you may wish to use (or not use) a different framework. This section shows how to setup the front-end agnostic of any framework:

## Prerequisites

It is recommended you install Node.js and NPM.

## NPM packages

- https://www.npmjs.com/package/@pdftron/webviewer
- https://www.npmjs.com/package/@pdftron/webviewer-bim-client

## Copying resources to public/ folder

There are several directories that need to be copied and served locally in your application.

There are two folders you need to copy: 
- node_modules/@pdftron/webviewer/public
- node_modules/@pdftron/webviewer-bim/dist

```
cp -R ./node_modules/@pdftron/webviewer/public public/webviewer/lib
cp -R ./node_modules/@pdftron/webviewer-bim/dist public/webviewer-bim
```

See [scripts/copy-webviewer-files.js](scripts/copy-webviewer-files.js) for a simple script to do this.

Afterwards the folder structure will look something like:

```
public/
  webviewer/
    lib/
      ui/
      core/
  webviewer-bim/
    compress/
    oda/
    webviewer-bim-min.js
```

## Sample code

```js
import  Webviewer  from  '@pdftron/webviewer';
import { initializeBimViewer } from '@pdftron/webivewer/bim-client'

Webviewer({
  path: '/webviewer/lib',
}, document.getElementById('viewer')).then(instance  => {

  const license = `---- Insert commercial license key here after purchase ----`;
  const serverURL = `---- Insert server URL after setup ----`;
  const options = { license: license };
  const WebViewerBIM = await initializeBimViewer(instance, serverURL, options);

  WebViewerBIM.File.load3dAsset('<uri for 3d asset>');


});
```

## Showcase

Refer to a running sample on Apryse SDK [showcase page](https://showcase.apryse.com/bim-viewer).

