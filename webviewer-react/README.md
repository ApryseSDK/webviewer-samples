# WebViewer - React sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is designed to show you how to integrate WebViewer into a React project. [Read more about integrating with React](https://docs.apryse.com/web/guides/get-started/react).

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started page](https://docs.apryse.com/web/guides/get-started).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

This sample requires Node version 20. To check your version, run `node -v` in a terminal/console window.

### Setting the License Key

In order to set the license key, set `VITE_DEMO_KEY` in the `.env.example` file in the project and rename the file to `.env` (or create a `.env.local` file for local-only changes). Alternatively, the string may be passed into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor


If this sample was obtained using the `create-webviewer-app` tool then the key has already been set in the `.env` file and no further action is needed.


## Install

In a terminal opened to the project directory, use the preferred package manager to install the dependencies. 

**Using npm**
```
npm install
```
**Using pnpm**
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

After the app starts, you will be able to see WebViewer running on `localhost:5173`.

