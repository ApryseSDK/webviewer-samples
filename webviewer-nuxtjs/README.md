# WebViewer Nuxt 4 Sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into a [Nuxt 4](https://nuxt.com/) project.

WebViewer depends on browser APIs, so it is imported dynamically inside `onMounted` and the viewer is wrapped in Nuxt's [`<ClientOnly>`](https://nuxt.com/docs/api/components/client-only) component to keep it out of server-side rendering.

This sample is written in TypeScript. Nuxt supports TypeScript out of the box, so the single-file components use `<script setup lang="ts">` and no extra build configuration is required.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

### Setting the License Key

In order to set the license key, set `NUXT_PUBLIC_DEMO_KEY` in the `.env.example` file in the project and rename the file to `.env` (or create a `.env.local` file for local-only changes). Alternatively, the string may be passed into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

If this sample was obtained using the `create-webviewer-app` tool then the key has already been set in the `.env` file and no further action is needed.

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
  esbuild: true
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

Use the preferred package manager to run the `dev` script to start a local development server and serve the Angular app with hot reload.

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

## Type checking

Nuxt does not type check during `dev` or `build` for performance reasons. Run the types explicitly with:

```
npm run type-check
```

## Customize configuration
See [Configuration Reference](https://nuxt.com/docs/getting-started/configuration).
