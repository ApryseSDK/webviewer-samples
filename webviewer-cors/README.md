# WebViewer - CORS - Loading WebViewer's lib from a different domain

[WebViewer](https://docs.apryse.com/web/) is a powerful JavaScript-based PDF Library that's part of the [Apryse SDK](https://apryse.com/).

This repo is specifically designed for any users interested in how to serve WebViewer's lib from [a different domain](https://docs.apryse.com/web/guides/config-files/#using-a-config-file-when-the-path-is-on-another-domain).

We recommend serving WebViewer lib on the same domain as the app itself for additional performance and security.

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

Clone the repository

```
git clone https://github.com/ApryseSDK/webviewer-cors.git
```

Install WebViewer lib static server
```
cd webviewer-cors/webviewer-lib
npm i
```

Install React-TypeScript app
```
cd webviewer-cors/webviewer-app
npm i
```
After the install completed, the `postinstall` will copy over WebViewer's lib folder to the static server under `public/lib`.

```
# If the WebViewer lib folder is on another origin from your app then you will
# need to include your app's origin here if you want to load a config file
http://localhost:3000
```

## Run

Run WebViewer lib static server to serve WebViewer lib
```
cd webviewer-cors/webviewer-lib
npm start
```

Run React-TypeScript app
```
cd webviewer-cors/webviewer-app
npm start
```

## Loading documents and interacting with WebViewer

Since the WebViewer iframe is hosted on a different domain, to interact and use APIs, we have to utilize [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

The `config.js` and `App.tsx` are configured to communicate with each other to load a document and use some of the APIs like adding a rectangle annotation on page 2 of the document.

## Making changes

If you make any changes to `config.js` make sure to restart the `webviewer-lib` http-server.

## WebViewer APIs

See [API documentation](https://docs.apryse.com/api/web/global.html#WebViewer__anchor)

## License

See [license](./LICENSE).
