# TypeScript PDF Viewer Sample (WebViewer)

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into a TypeScript project. WebViewer has a comprehensive definition file ready for use by just adding a reference to the definition file.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

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
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-typescript
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
