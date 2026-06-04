# WebViewer - Next.js 14 sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into a Next.js 14 project. With the source code access, it gives developers full control to customize and style the UI, build custom controls and logic, integrate into workflows, or build a UI from scratch.

Due to SSR in Next.js, the module needs to be imported dynamically, to avoid a "window is not defined" error due to re-rendering.
Read more here: https://github.com/vercel/next.js/discussions/42319

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Trial

WebViewer comes with a 7-day trial without any feature limitations or trial key needed. To extend the trial, you can obtain the trial key by [signing-up](https://dev.apryse.com/) on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure the development environment includes [Node.js](https://nodejs.org/en/).

## install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-nextjs-14
npm install
```

## Compiles and hot-reloads for development
```
npm run dev
```

## Compiles and minifies for production
```
npm run build
```

## Serves the minified build
```
npm start
```

## Lints and fixes files
```
npm run lint
```