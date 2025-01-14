# WebViewer - Custom UI

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [Apryse PDF SDK](https://apryse.com/developers/).
This repo is specifically designed for any users interested in making their [own UI](https://docs.apryse.com/documentation/web/guides/core/#creating-your-own-ui-using-webviewer-core).

![WebViewer with custom UI](docs/screenshots/webviewer-custom-ui-01.png)

This sample codebase demonstrates
  * How to leverage Apryse's document renderer without an `<iFrame>`
  * How to define custom `<button>` elements and implement functionality from the Apryse SDK such as
    * Zoom In/Out
    * Drawing Rectangles
    * Select Tool
    * Creating and Applying Redactions
  * How to implement searching using [DocViewer Search APIs](https://docs.apryse.com/documentation/web/guides/advance-text-search/)

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone https://github.com/ApryseSDK/webviewer-custom-ui.git
cd webviewer-custom-ui
npm install
```

## Run

```
npm start
```

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `build/` directory. See the section about [deployment](https://create-react-app.dev/docs/deployment/) for more information.

To test the build directory locally you can use [serve](https://www.npmjs.com/package/serve) or [http-server](https://www.npmjs.com/package/http-server). In case of serve, by default it strips the .html extension stripped from paths. We added serve.json configuration to disable cleanUrls option. 

## WebViewer APIs

For more information, refer to [Full API for PDF processing](https://docs.apryse.com/documentation/web/guides/full-api/) and [Class: WebViewerInstance](https://docs.apryse.com/api/web/WebViewerInstance.html).

## Showcase

For a live demo of the WebViewer capabilities, refer to the [Apryse WebViewer Demo: JavaScript PDF Viewer Demo](https://showcase.apryse.com/).

## Contributing

Submission to this repo is governed by these [guidelines](/CONTRIBUTING.md).

## License

For licensing, refer to [License](LICENSE).

