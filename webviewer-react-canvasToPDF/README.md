# WebViewer - React - CanvasToPDF sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

CanvasToPDF is a PDF Library that allows users to create vector appearances with Canvas API. In other words, enable you to export your HTML Canvas to a vector quality PDF.

This sample is specifically designed for any users interested in integrating WebViewer and CanvasToPDF into React project.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Gradient Pattern Annotation
```js
const blob = await canvasToPDF(drawGradientCircles, {
  width: rectangleAnnot.Width,
  height: rectangleAnnot.Height,
});
```

<img width="552" alt="Screen Shot 2022-08-25 at 3 26 49 PM" src="https://user-images.githubusercontent.com/70789275/186779919-5678b462-69f0-47a7-98c9-17e9aa655319.png">

You can use them by replacing the above code to the below code like this:

## Hatch Annotation
```js
const blob = await canvasToPDF(drawHatch, {
  width: rectangleAnnot.Width,
  height: rectangleAnnot.Height,
});
```

<img width="558" alt="Screen Shot 2022-08-25 at 3 27 36 PM" src="https://user-images.githubusercontent.com/70789275/186779935-8fff6c6b-16d4-408c-a7d7-96df6c36b82d.png">

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-react-canvasToPDF
npm install
```

## Run

```
npm start
```

After the app starts, you will be able to see WebViewer running on `localhost:3006`.