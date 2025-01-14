# WebViewer - Server-Side Search Integration

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It allows you to view and annotate PDF files on your web app with a fully customizable UI.

![WebViewer UI](https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-ui.png "WebViewer UI")

This sample adds a WebViewer to a Node.js project that enables a search feature as server-side and overrides the default client search.

## Initial setup
  
Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone https://github.com/ApryseSDK/webviewer-server-side-search
cd webviewer-server-side-search
npm install
```

## Setting License

Follow the steps below to set the license key in this sample:

- Locate the file /server/api.js
- Replace 'YOUR_LICENSE_KEY' with your license
- Save the file

## Run

```
npm start
```

This will start a server that you can access the WebViewer client at http://localhost:8080/. The search REST API is available at http://localhost:8080/api/search using `GET`.

## How to search

- Click the search button at the top-right corner and execute a search.
- The search performs in the backend and returns a list of hits for the current document. You can navigate the document from the list.

## WebViewer APIs

[WebViewer: Feature-Rich JavaScript PDF Viewer](https://docs.apryse.com/documentation/web/).

[Guides for Server/Desktop PDF library](https://docs.apryse.com/documentation/core/guides/).

## License

For licensing, refer to [License](LICENSE).