# WebViewer Real Time Collaboration Sample - using WebSocket, SQLite3 and Node.js server

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This is a WebViewer sample to show how you can construct a real time collaboration server for WebViewer through `WebSocket`, `SQLite3`, and `Node.js` server.

The below diagram depicts the structure of the real time collaboration sample app.

![Structure](./real-time-structure.png "Structure")

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/). This sample requires version 13 of Node.js.

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-realtime-collaboration-sqlite3
npm install
```

## Run

```
npm start
```

## Port

 In case your Windows development machine has restrictions on accessing port 8181, an error will return `code: 'EACCES'` and `port: 8181`. To solve this error, the easiest solution is to change to one accessible port. In Windows find the ports that are restricted with `netsh interface ipv4 show excludedportrange protocol=tcp`. To change the port, find the two locations in the files below and update to the new port:

```
//\server\annotationHandler.js

`const wss = new WebSocket.Server({ port: 8181});`

//\client\index.js

const url = `ws://${hostName}:8181`;
```


## How to use

- Run a WebViewer instance with the `npm start` command. An instance of the WebViewer will run on [port 3000](http://localhost:3000/index.html) using your default browser.
- Open up two other browsers, one in incognito mode and another separate instance using a different major browser, all listening to [port 3000](http://localhost:3000/index.html).
- Create annotations with the annotations tools on one of the browsers, and observe the annotations appear on the other two browsers in real time.
- You can also access the real time server from a different device in the same network via replacing `localhost` in your URL to the server's IP address.

![Real time annotations collaboration](real-time-annotations.svg "Real time annotations collaboration")
