# WebViewer - AngularJS sample

[WebViewer](https://apryse.com/products/webviewer) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate, and manipulate PDFs that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating WebViewer into [AngularJS](https://angularjs.org).

## Initial setup

Before you begin, make sure your development environment includes:

1. [Node.js](https://nodejs.org/en).
2. IDE used in this sample is Visual Studio Code.
3. [GitHub command line](https://github.com/git-guides/install-git) `git`.
4. Angular CLI: `npm install -g @angular/cli`. If an unsupported engine message appears, make sure to install a compatible NodeJS version.

## Install

```
gh repo clone ApryseSDK/webviewer-angularjs-sample
cd webviewer-angularjs-sample
npm install
```

## Run

```
npm start
```

Navigate to `http://localhost:3000/`. The app will automatically reload if you change any of the source files.

## Enabling full API

WebViewer Full API is a complete browser side PDF SDK, unlocking viewing, parsing and editing of PDF files. To enable full API, you can modify constructor in components.js:

```diff
WebViewer({
  path: 'lib', // path to the PDFTron 'lib' folder on your server
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
+  fullAPI: true
}, document.getElementById('viewer'))
```

Visit Apryse's [WebViewer](https://docs.apryse.com/documentation/web/) page to see what else you can do with the WebViewer.

## WebViewer APIs

* [@pdftron/webviewer API documentation](https://docs.apryse.com/api/web/global.html#WebViewer__anchor)
* [@pdftron/webviewer-angularjs](https://github.com/ApryseSDK/webviewer-angularjs-sample)

## Showcase

Refer to a running sample on Apryse SDK [showcase page](https://showcase.apryse.com/).

## Contributing

Any submission to this repo is governed by these [guidelines](/CONTRIBUTING.md).


## License

For licensing, refer to [License](LICENSE).