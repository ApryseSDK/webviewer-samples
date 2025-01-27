# WebViewer - Server-Side Search Integration

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample adds a WebViewer to a Node.js project that enables a search feature as server-side and overrides the default client search.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup
  
Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-server-side-search
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
