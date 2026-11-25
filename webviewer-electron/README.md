# WebViewer - Electron sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into an Electron Forge project.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

### Setting the License Key

In order to set the license key, set `VITE_DEMO_KEY` in the `.env` file in the project (or create a `.env.local` file for local-only changes). Alternatively, the string may be passed into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

The project has a sample `.env.example` file that can be copied and renamed to `.env`.  
It contains a placeholder line for providing the license key.

If this sample was obtained using the `create-webviewer-app` tool then the key has already been set in the `.env` file and no further action is needed.

## Install and Run

In a terminal opened to the project directory, use the preferred package manager to install the dependencies and start the Electron server. Installing the dependencies also copies the WebViewer files into `public/lib`.

**Using npm**

```
npm install
npm run dev
```

**Using pnpm**

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

This builds the main and preload scripts, starts the Vite dev server on `localhost:5173`, and opens an Electron window running WebViewer. The first launch may take a little longer while Vite prepares its dependencies.

## License

The Electron Forge sample project is provided under the MIT license.  
WebViewer Electron Forge project/codebase or any derived works is only permitted in solutions with an active commercial Apryse WebViewer license. For exact licensing terms please refer to your commercial WebViewer license. For any licensing, pricing, or product questions, contact [Sales](https://apryse.com/form/contact-sales).
