# WebViewer - JS Sample

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs, MS Office, videos, images, and CAD that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating WebViewer into a vanilla JS project.

## Demo

You can explore all of the functionality in our [showcase](https://showcase.apryse.com/).

## Initial Setup

Before you begin, make sure your development environment includes [Node.js and npm](https://www.npmjs.com/get-npm).


1. [Node.js](https://nodejs.org/en).
2. IDE used in this sample is Visual Studio Code with an NPM extension to process commands within its terminal.
3. [GitHub command line](https://github.com/git-guides/install-git) `git`.

## Install

```
git clone https://github.com/ApryseSDK/webviewer-js-sample.git
cd webviewer-js-sample
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

## WebViewer APIs

* [@pdftron/webviewer API documentation](https://docs.apryse.com/api/web/global.html#WebViewer__anchor)
* [@pdftron/webviewer-js-sample API documentation](https://github.com/ApryseSDK/webviewer-js-sample)
* [API documentation: WebViewerInstance](https://docs.apryse.com/api/web/WebViewerInstance.html).

## Showcase

Refer to a running sample on Apryse SDK [showcase page](https://showcase.apryse.com/).


## License

For licensing, refer to [License](LICENSE).

