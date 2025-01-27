# WebViewer Audio

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample uses the audio addon for WebViewer that allows the loading of media elements (.mp3, .mp4, ogg, webm, etc.), so that their audio tracks can be annotated and redacted. This sample is specifically designed for users interested in integrating WebViewer Audio into a React project

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js and npm](https://www.npmjs.com/get-npm).


1. [Node.js](https://nodejs.org/en).
2. IDE used in this sample is Visual Studio Code with an NPM extension to process commands within its terminal.
3. [GitHub command line](https://github.com/git-guides/install-git) `git`.

## Install

```
gh repo clone ApryseSDK/webviewer-audio
cd webviewer-samples/webviewer-audio
npm install
```

## Run

In Visual Studio Code or from a Command Prompt window, preview the app in `localhost` with an `npm` command. 

```
npm start
```

`npm run start-server` is required for saving of annotations. This will start a separate server on `localhost:8080` that will handle web requests to save the annotations as XFDF to the local drive.

This option will be available on the UI as part of the Download button, which requires an active license.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `build/` directory. See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

To test the build directory locally, outside of Visual Studio Code, you can use [serve](https://www.npmjs.com/package/serve) or [http-server](https://www.npmjs.com/package/http-server). In case of serve, by default it strips the .html extension stripped from paths. We added serve.json configuration to disable cleanUrls option.