# WebViewer Linearization Sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This repo is designed for users who are planning to setup a web-optimized viewing experience using WebViewer in their application. 


## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).


## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/). Node 20 recommended.

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-linearization
npm install
```

### Install WebViewer Core Dependencies

The preferred method to install the Core dependencies is to use the [WebViewer NPM package](https://docs.apryse.com/documentation/web/get-started/npm/#1-install-via-npm).

Once installed, copy the Core & UI folders into the path being used by the viewer for its dependencies 
/client/public/webviewer/lib

A post install script (copy-webviewer-files.cjs) is included to automate this process

## Run
```
npm start
```

## Project structure

```
client/ 
    public/ 
        webviewer/
            lib/        - folder containing WebViewer files
    src/
        App.jsx         - main file defining WebViewer frontend
server/ 
    files/              - static folder serving the files
    server.js           - main file defining the server configurations
```


## How to use

- Run the client frontend & server backend 
- Go to http://localhost:5173/ and see the linearized PDF load onto WebViewer via range request
- Open the Developer Tools and the Network Panel to see the 'linearized' 206 partial range request
- Optional: Click on the button on the top to check if the document is linearized 
