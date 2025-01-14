# TypeScript PDF Viewer Sample (WebViewer)

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into web projects.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating WebViewer into a TypeScript project. WebViewer has a comprehensive definition file ready for use by just adding a reference to the definition file.


## Trial

You can obtain the trial key by signing-up on our [developer portal](https://dev.apryse.com/).


## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

In order to set the license key, you will need to set the string in the WebViewer sample. One such way is by passing it into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

Follow the steps below to set the license key in this sample:

- Locate the index.ts file at /src/index.ts
- Replace 'Insert commercial license key here after purchase' with your license key
- Save the file


## Install

```shell
git clone https://github.com/ApryseSDK/webviewer-typescript-sample.git
cd webviewer-typescript-sample
npm install
```

## Run

Setup the TypeScript compiler to watch for changes and recompile the source file:

```shell
npm run watch
```

Open a different shell service and run:

```shell
npm start
```

## WebViewer APIs

Most classes and functions are well documented in the TypeScript definition file. See [API documentation](https://docs.apryse.com/api/web/WebViewerInstance.html).

## Enabling full API

PDFNetJS Full is a complete browser side PDF SDK, unlocking viewing, parsing and editing of PDF files. To enable full API, you can modify constructor in `src/index.ts` and then use `tsc src/index.ts` from the project root:

```diff
const viewerElement = document.getElementById('viewer');
WebViewer({
    path: 'WebViewer/lib',
    initialDoc: 'path/to/local/file OR online URL', // replace with your own PDF file
+   fullAPI: true
}, viewerElement).then((instance) => {
    // call APIs here
    })
}
```

## License

See [license](./LICENSE).
