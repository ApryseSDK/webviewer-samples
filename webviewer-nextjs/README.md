# WebViewer - Next.js sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into a Next.js project. With the source code access, it gives developers full control to customize and style the UI, build custom controls and logic, integrate into workflows, or build a UI from scratch.

Due to SSR in Next.js, the module needs to be imported dynamically, to avoid a "window is not defined" error due to re-rendering.
Read more here: https://github.com/vercel/next.js/discussions/42319

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Setting the License Key

In order to set the license key, set `NEXT_PUBLIC_DEMO_KEY` in the `.env.example` file in the project and rename the file to .env (or create a .env.local file for local-only changes). Alternatively, the string may be [passed into the constructor](https://docs.apryse.com/web/get-started/faq/add-license#passing-into-constructor) of the WebViewer.

If this sample was obtained using the [@apryse/create-webviewer-app](https://www.npmjs.com/package/@apryse/create-webviewer-app) tool then the key has already been set in the .env file and no further action is needed.

## Initial setup

Before you begin, make sure the development environment includes [Node.js](https://nodejs.org/en/).

## install

### Using npm

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-nextjs
npm install
```

### Using pnpm

```
pnpm install
```

### Using yarn

```
yarn
```

### Using bun

```
bun install
```

## Compiles and hot-reloads for development

### Using npm

```
npm run dev
```

### Using pnpm

```
pnpm dev
```

### Using yarn

```
yarn dev
```

### Using bun

```
bun run dev
```

## Compiles and minifies for production

### Using npm

```
npm run build
```

### Using pnpm

```
pnpm build
```

### Using yarn

```
yarn build
```

### Using bun

```
bun run build
```

## Serves the minified build

### Using npm

```
npm start
```

### Using pnpm

```
pnpm start
```

### Using yarn

```
yarn start
```

### Using bun

```
bun run start
```

## Lints and fixes files

### Using npm

```
npm run lint
```

### Using pnpm

```
pnpm lint
```

### Using yarn

```
yarn lint
```

### Using bun

```
bun run lint
```
