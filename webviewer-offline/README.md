# WebViewer - offline sample

[WebViewer](https://www.pdftron.com/webviewer) is a powerful JavaScript-based PDF Library that's part of the [PDFTron PDF SDK](https://www.pdftron.com). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo shows how you can load WebViewer offline using [service worker](https://developers.google.com/web/fundamentals/primers/service-workers/) and [localforage](https://github.com/localForage/localForage).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone https://github.com/PDFTron/webviewer-offline-sample.git
cd webviewer-offline-sample
npm install
```

## Generate the list of files for service worker
In the root folder, run the following
```
node prepare-serviceworker-list.js
```

This will generate a json file `service-worker-list.json` that contains the list of files to be cached in service worker.

## Run

```
npm start
```
![](https://onepixel.pdftron.com/webviewer-offline-sample)
