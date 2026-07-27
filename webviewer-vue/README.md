# WebViewer - Vue sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into Vue project. You can [read a guide](https://docs.apryse.com/documentation/web/get-started/vue/). This project has been scaffolded using [vite](https://vitejs.dev) through the `create-vue` npm command as recommended by the developers of Vue.js. For more details, see [here](https://vuejs.org/guide/scaling-up/tooling.html)

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

### Setting the License Key

In order to set the license key, set `VITE_DEMO_KEY` in the `.env` file in the project (or create a `.env.local` file for local-only changes). Alternatively, the string may be passed into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

The project has a sample `.env.example` file that can be copied and renamed to `.env`.  
It contains a placeholder line for providing the license key.

If this sample was obtained using the `create-webviewer-app` tool then the key has already been set in the `.env` file and no further action is needed.

## Install

Before you begin, make sure the development environment includes [Node.js](https://nodejs.org/en/).

In the terminal, navigate to the project directory:

```
cd webviewer-samples/webviewer-vue
```

Then install dependencies with the preferred package manager.

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

## License

The Vue sample project is provided under the MIT license.  
WebViewer React UI project/codebase or any derived works is only permitted in solutions with an active commercial Apryse WebViewer license. For exact licensing terms please refer to your commercial WebViewer license. For any licensing, pricing, or product questions, contact [Sales](https://apryse.com/form/contact-sales).
