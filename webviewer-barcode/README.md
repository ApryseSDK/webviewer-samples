# WebViewer Barcode

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample demonstrates a PoC for generating barcodes, stamping them onto a PDF and then reading them after they have been flattened onto the document. [Watch the demo here](https://youtu.be/KCUL3HoFxkM) or [read the blog here](https://apryse.com/blog/annotation/stamp-and-read-barcode-on-pdfs-with-pdftron-sdk).

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Install

```
npm install
```

## Run

```
npm start
```

**Note:** If you get `ERR_OSSL_EVP_UNSUPPORTED` when trying the run the sample, try setting the environment variable `NODE_OPTIONS` to `--openssl-legacy-provider` before the start command. In Windows, this is done by changing the following line in package.json:

`"start": "react-scripts start"`

to become:

`"start": "set NODE_OPTIONS=--openssl-legacy-provider && react-scripts start"`

## Barcode Libraries

This app features [jsbarcode](https://github.com/lindell/JsBarcode) for generation and [javascript-barcode-reader](https://github.com/mubaidr/Javascript-Barcode-Reader) for reading of the 2D barcodes and [jsqr](https://github.com/cozmo/jsQR) for generation and [qrcode](https://github.com/soldair/node-qrcode) for reading of the QR codes.

## API documentation

See [API documentation](https://docs.apryse.com/api/web/global.html#WebViewer__anchor)

