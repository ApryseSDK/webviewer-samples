# WebViewer - Angular sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is designed to show you how to Integrate WebViewer into an Angular project. This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0. [Read more about integrating with Angular](https://docs.apryse.com/web/guides/get-started/angular)

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

In order to set the license key, you will need to set the string in the WebViewer sample. One such way is by passing it into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

Follow the steps below to set the license key in this sample:

- Locate the app.component.ts file at ./src/app/app.component.ts
- Replace "your_license_key" with your license
- Save the file

## Install

In a terminal opened to the project directory, use the preferred package manager to install the dependencies. 

**Using npm**
```
npm install
```
**Using pnpm**
Create a `pnpm-workspace.yaml` file in the project root:
```
allowBuilds:
  '@parcel/watcher': true
  esbuild: true
  lmdb: true
  msgpackr-extract: true
```
Then run the following:
```
pnpm install
```
**Using yarn**
```
yarn
```
**Using bun**
```
bun install
```

## Run

Use the preferred package manager to run the `dev` script to start a local development server and serve the React app with hot reload.

**Using npm**
```
npm run dev
```

**Using pnpm**
```
pnpm dev
```

**Using yarn**
```
yarn dev
```

**Using bun**
```
bun run dev
```


Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.