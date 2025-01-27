# WebViewer - JS Sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into a vanilla JS project.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial Setup

Before you begin, make sure your development environment includes [Node.js and npm](https://www.npmjs.com/get-npm).

1. [Node.js](https://nodejs.org/en).
2. IDE used in this sample is Visual Studio Code with an NPM extension to process commands within its terminal.
3. [GitHub command line](https://github.com/git-guides/install-git) `git`.

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-js
npm install
```

`npm install` gets and installs required dependencies. Make sure `.parcelrc` is available at the root and configured as below.

```
{
  "extends": "@parcel/config-default",
  "reporters": [
    "...",
    "parcel-reporter-multiple-static-file-copier"
  ]
}
```

## Run

```
npm start
```

After the app starts, you will be able to see a WebViewer running on `localhost:1234`.

## Static Resources

`WebViewer` requires static resources created in the `dist` folder. Make sure the `origin` and `destination` are specified as below in the `package.json`.

```
  "multipleStaticFileCopier": [
    {
      "origin": "node_modules/@pdftron/webviewer/public",
      "destination": "dist/public/webviewer"
    }
  ]
```

The `package.json` file contains the `start` and `build` scripts. The only script to call is the `start` to run the app out-of-the-box.

```
    "start": "parcel index.html --open http://localhost:1234"
```
