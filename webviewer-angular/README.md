# WebViewer - Angular sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is designed to show you have to Integrate WebViewer into an Angular project. This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.0. [Read more about integrating with Angular](https://docs.apryse.com/web/guides/get-started/angular)

You can [watch a video](https://www.youtube.com/watch?v=OxNjs4dc6zY) that walks you through how to embed Apryse's WebViewer inside of Angular project.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

In order to set the license key, you will need to set the string in the WebViewer sample. One such way is by passing it into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

Follow the steps below to set the license key in this sample:

- Locate the app.component.ts file at ./src/app/app.component.ts
- Replace "your_license_key" with your license
- Save the file

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-angular
npm install
```

## Run

```
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.