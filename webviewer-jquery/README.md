# WebViewer - jQuery sample

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into web projects.

![WebViewer UI](https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-ui.png)

This repo is designed for users interested in integrating WebViewer into jQuery project. For more information, refer to [jQuery](https://jquery.com/).

## Initial setup

Before beginning, [Node.js](https://nodejs.org/en/) should be installed to the development environment.

## Install

```
git clone https://github.com/ApryseSDK/webviewer-jquery-sample
cd webviewer-jquery-sample
npm install
```

## Run

```
npm start
```

It will load `http://localhost:3000/`. The application will automatically reload if you change any of the source files.

## Full API for PDF processing

PDFNetJS Full is a complete browser side PDF SDK, unlocking viewing, parsing and editing of PDF files. To enable full API, modify the constructor in app.js:

```diff
WebViewer({
  path: 'lib', // path to the Apryse 'lib' folder on your server
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
+  fullAPI: true
}, document.getElementById('viewer'))
```

For more information, refer to [Full API for PDF processing](https://docs.apryse.com/documentation/web/guides/full-api/) and [Class: WebViewerInstance](https://docs.apryse.com/api/web/WebViewerInstance.html).

## Showcase

For a live demo of the WebViewer capabilities, refer to the [Apryse WebViewer Demo: JavaScript PDF Viewer Demo](https://showcase.apryse.com/).

## Contributing

Submission to this repo is governed by these [guidelines](/CONTRIBUTING.md).

## License

For licensing, refer to [License](LICENSE).
