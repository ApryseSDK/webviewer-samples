# WebViewer - React sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is designed to show you how to integrate WebViewer into a React project. [Read more about integrating with React](https://docs.apryse.com/web/guides/get-started/react).

You can watch [a video here](https://youtu.be/bVhWXuLSL0k) to help you get started.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

This sample requires Node version 20. To check your version, run `node -v` in a terminal/console window.

In order to set the license key, you will need to set the string in the WebViewer sample. One such way is by passing it into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

Follow the steps below to set the license key in this sample:

- Locate the app.component.ts file at src/app.js
- Replace "your_license_key" with your license
- Save the file


## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-react
npm install
```

## Run

```
npm start
```

After the app starts, you will be able to see WebViewer running on `localhost:3000`.
