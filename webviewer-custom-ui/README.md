# WebViewer - Custom UI

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample demonstrates
  * How to leverage Apryse's document renderer without an `<iFrame>`
  * How to define custom `<button>` elements and implement functionality from the Apryse SDK such as
    * Zoom In/Out
    * Drawing Rectangles
    * Select Tool
    * Creating and Applying Redactions
  * How to implement searching using [DocViewer Search APIs](https://docs.apryse.com/documentation/web/guides/advance-text-search/)

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-custom-ui
npm install
```

## Run

```
npm start
```