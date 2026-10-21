# WebViewer Nuxt 4 Sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into a [Nuxt 4](https://nuxt.com/) project.

WebViewer depends on browser APIs, so it is imported dynamically inside `onMounted` and the viewer is wrapped in Nuxt's [`<ClientOnly>`](https://nuxt.com/docs/api/components/client-only) component to keep it out of server-side rendering.

This sample is written in TypeScript. Nuxt supports TypeScript out of the box, so the single-file components use `<script setup lang="ts">` and no extra build configuration is required.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Trial

WebViewer comes with a 7-day trial without any feature limitations or trial key needed. To extend the trial, a trial key can be obtained by signing-up through the [developer portal](https://dev.apryse.com/).

## Install

Before beginning, make sure the development environment includes [Node.js](https://nodejs.org/en/).

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-nuxtjs
npm install
```

## Run
In Visual Studio Code or from a Command Prompt window, preview the app in `localhost:3000` with an `npm` command.

```
npm run dev
```

For detailed explanation on Nuxt commands and deployment, check out the [documentation](https://nuxt.com/docs/api/commands/dev).

## Type checking

Nuxt does not type check during `dev` or `build` for performance reasons. Run the types explicitly with:

```
npm run type-check
```

## Customize configuration
See [Configuration Reference](https://nuxt.com/docs/getting-started/configuration).
