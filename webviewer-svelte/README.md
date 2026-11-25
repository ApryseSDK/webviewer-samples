# WebViewer Svelte Example

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into [Svelte](https://svelte.dev/) project.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Setting the License Key

In order to set the license key, set `DEMO_KEY` in the `.env.example` file in the project and rename the file to .env (or create a .env.local file for local-only changes). Alternatively, the string may be [passed into the constructor](https://docs.apryse.com/web/get-started/faq/add-license#passing-into-constructor) of the WebViewer.

If this sample was obtained using the [@apryse/create-webviewer-app](https://www.npmjs.com/package/@apryse/create-webviewer-app) tool then the key has already been set in the .env file and no further action is needed.

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install and Run

In a terminal opened to the project directory, use the preferred package manager to install the dependencies and start a local development server

**Using npm**

```
npm install
npm run dev
```

**Using pnpm**  
Create a `pnpm-workspace.yaml` file in the project root:

```
allowBuilds:
  esbuild: true
```

Then run the following:

```
pnpm install
pnpm dev
```

**Using yarn**

```
yarn
yarn dev
```

**Using bun**

```
bun install
bun run dev
```

After the local server starts, you can navigate to `http://localhost:8080`
