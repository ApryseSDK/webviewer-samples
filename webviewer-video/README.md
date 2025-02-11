# WebViewer Video

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample uses the [video addon](https://www.npmjs.com/package/@pdftron/webviewer-video) for WebViewer. It allows the loading of HTML5 videos (.mp4, ogg, webm) so that their frames can be annotated. For more information, see this [guide](https://docs.apryse.com/web/guides/get-started/manually-video).

[Watch a video](https://youtu.be/d_yIN8aZE6Y) that highlights new features included in 3.0 release.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js and npm](https://www.npmjs.com/get-npm).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-video
npm install
```

## Run

```
npm start
```


**Note:** If you get `ERR_OSSL_EVP_UNSUPPORTED` when trying the run the sample, try setting the environment variable `NODE_OPTIONS` to `--openssl-legacy-provider` before the start command. In Windows, this is done by changing the following line in package.json:

`"start": "node scripts/start.js"`

to become:

`"start": "set NODE_OPTIONS=--openssl-legacy-provider && node scripts/start.js"`
