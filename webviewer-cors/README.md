# WebViewer - CORS - Loading WebViewer's lib from a different domain

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in how to serve WebViewer's lib from [a different domain](https://docs.apryse.com/web/guides/config-files/#using-a-config-file-when-the-path-is-on-another-domain). This sample implements Cross-Origin Resource Sharing (CORS) as a client server `webviewer-app` that fetches resources from a server `webviewer-lib` in another domain. The dependency reference to `@pdftron/webviewer` exists in both `webviewer-lib\package.json` and `webviewer-app\package.json`.

We recommend serving the WebViewer lib on the same domain as the app itself for additional performance and security.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

Clone the repository

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
```

Find the `webviewer-cors` sample project and load both folders in their own Visual Studio Code instance: `webviewer-app` and `webviewer-lib`

Install WebViewer lib static server `webviewer-lib`.

```
cd webviewer-cors/webviewer-lib
npm i
```

Install React-TypeScript app `webviewer-app`.

```
cd webviewer-cors/webviewer-app
npm i
```

After the install completes, the `postinstall` will copy over WebViewer's lib folder to the static server under `public/lib`.

If the WebViewer lib folder is on another origin from your app, then you will need to include your app's origin here if you want to load a config file.



## Run

Run WebViewer lib static server to serve WebViewer lib on `http://localhost:8081/lib/`
```
cd webviewer-lib
npm start
```

Run React-TypeScript app to load ` http://localhost:3000`. Notice that `App.tsx` fetches the WebViewer from `http://localhost:8081/lib/`

```
cd webviewer-app
npm start
```

## Loading documents and interacting with WebViewer

Since the WebViewer iframe is hosted on a different domain, to interact and use APIs, we have to utilize [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

The `config.js` and `App.tsx` are configured to communicate with each other to load a document and use some of the APIs like adding a rectangle annotation on page 2 of the document.

## Making changes

If you make any changes to `config.js` make sure to restart the `webviewer-lib` http-server.

## WebViewer APIs

See [API documentation](https://docs.apryse.com/api/web/global.html#WebViewer__anchor)

