# WebViewer Blazor Example

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into a [Blazor Server](https://learn.microsoft.com/aspnet/core/blazor/) project.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Setting the License Key

In order to set the license key, set `DEMO_KEY` in the `.env.example` file in the project and rename the file to .env. The key is read by the server at startup and passed to WebViewer. Alternatively, the string may be [passed into the constructor](https://docs.apryse.com/web/get-started/faq/add-license#passing-into-constructor) of the WebViewer in `wwwroot/js/webviewerScripts.js`.

## Initial setup

Before you begin, make sure your development environment includes the [.NET 11 SDK](https://dotnet.microsoft.com/download/dotnet/11.0) and [Node.js](https://nodejs.org/en/).

## Install and Run

In a terminal opened to the project directory, use the preferred package manager to install the dependencies and start the Blazor server. Installing the dependencies also copies the WebViewer files into `wwwroot/lib`.

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

After the server starts, you can navigate to `https://localhost:5001/webviewer`
