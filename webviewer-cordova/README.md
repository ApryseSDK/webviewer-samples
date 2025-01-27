# WebViewer - Cordova sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into Cordova project. This project was generated with [Cordova CLI](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/). See [Create your first Cordova app](https://cordova.apache.org/docs/en/latest/guide/cli/index.html) for more information.

The sample uses the [WebViewer Server](https://docs.apryse.com/documentation/web/guides/wv-server-deployment/) as a backend for extending browser & file viewing compatibility. Alternatively, a [Custom server](https://docs.apryse.com/documentation/web/guides/custom-server-deployment) can be developed for use with the WebViewer.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before beginning, make sure the development environment includes [Node.js](https://nodejs.org/en/) and [Cordova CLI](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/).

This sample requires a WebViewer Server to be set up and the URL provided to the `webviewerServerURL` option for the `Webviewer` in `www/js/index.js` .

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-cordova
npm install
```

## Run in the browser

```
npm start
```

## Run in an iOS emulator

Before you begin, you need the latest MacOS and XCode installed

```bash
npm install -g plugman
cordova platform add ios
cordova run --list --emulator


## use name of the device from the list above, for example IPAD
npm run start-ios -- --target="iPad-Pro--9-7-inch-, 15.0"
```

## Run in other platforms

To run in platforms other than browser and iOS, you can refer to official Cordova guides:
- [Android](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html)
- [Windows](https://cordova.apache.org/docs/en/latest/guide/platforms/windows/index.html)
- [OS X](https://cordova.apache.org/docs/en/latest/guide/platforms/osx/index.html)
