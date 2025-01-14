# WebViewer - Cordova sample

[WebViewer](https://apryse.com/products/webviewer) is a powerful JavaScript-based PDF Library that is part of the [Apryse PDF SDK](https://apryse.com/products/core-sdk/pdf). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating WebViewer into Cordova project. This project was generated with [Cordova CLI](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/). See [Create your first Cordova app](https://cordova.apache.org/docs/en/latest/guide/cli/index.html) for more information.

The repo uses the [WebViewer Server](https://docs.apryse.com/documentation/web/guides/wv-server-deployment/) as a backend for extending browser & file viewing compatibility. Alternatively, a [Custom server](https://docs.apryse.com/documentation/web/guides/custom-server-deployment) can be developed for use with the WebViewer.

The [offline branch](https://github.com/PDFTron/webviewer-cordova-sample/tree/offline) of this repo shows how the WebViewer can be used in a Cordova app without connecting to the WebViewer server backend or using the extended functionality that the server provides.

## Initial setup

Before beginning, make sure the development environment includes [Node.js](https://nodejs.org/en/) and [Cordova CLI](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/).

This repo requires a WebViewer Server to be set up and the URL provided to the `webviewerServerURL` option for the `Webviewer` in `www/js/index.js` .

## Install

```
git clone https://github.com/PDFTron/webviewer-cordova-sample.git
cd webviewer-cordova-sample
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

## WebViewer APIs

* [@pdftron/webviewer API documentation](https://docs.apryse.com/api/web/global.html#WebViewer__anchor)

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
