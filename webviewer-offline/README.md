# WebViewer - offline sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample shows how you can load WebViewer offline using [service worker](https://developers.google.com/web/fundamentals/primers/service-workers/) and [localforage](https://github.com/localForage/localForage).

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-offline
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


