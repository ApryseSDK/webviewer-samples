# WebViewer Range Request Linearized PDFs Sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This repo is designed to show users how to use range requests on a backend server to request specific bytes from a URL for loading large PDFs. The code for this is found in `server/server.js`:

```js
// Serving a linearized file with range requests -------------------------------------------- 
app.get('/linearized', async (req, res) => {
  try {
    // Get the Range header from the request 
    const range = req.headers.range;

    // Get the total file size by making a HEAD request
    const headResponse = await fetch(pdfURL, { method: 'HEAD' });
    const fileSize = parseInt(headResponse.headers.get('content-length'), 10);

    // Set common headers
    res.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges'); // https://docs.apryse.com/web/faq/slow-loading#refused-to-get-unsafe-header-contentrange
    res.set('Accept-Ranges', 'bytes'); // Tells the client (browser) that the server supports partial content requests
    res.set('Content-Type', 'application/pdf'); // Tells the client (browser) that the response body is a PDF file

    // Handle range requests
    if (range) {
      const matches = range.match(/bytes=(\d*)-(\d*)/);
      let start, end;

      // Parse range values
      if (matches) {
        if (matches[1] === '' && matches[2]) {
          // Suffix range: bytes=-22 (last 22 bytes of the file) 
          const suffixLength = parseInt(matches[2], 10);
          start = fileSize - suffixLength;
          end = fileSize - 1;
        } else { // Normal range: bytes=0-499 or bytes=500- (from byte 500 to end)
          start = parseInt(matches[1], 10);
          end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;
        }

        // Validate range
        if (start >= fileSize || start < 0 || end >= fileSize || end < start) {
          res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
          return;
        }

        // Calculate chunk size
        const chunkSize = end - start + 1;

        // Set headers for partial content
        res.status(206); // Partial Content
        res.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.set('Content-Length', chunkSize);

        // Fetch with range header
        const response = await fetch(pdfURL, {
          headers: { Range: `bytes=${start}-${end}` }
        });

        // Stream the partial content
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
        return;
      }
    }

    // No range header, fetch entire file
    res.set('Content-Length', fileSize);
    res.status(200); // OK
    const response = await fetch(pdfURL);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).send('Error fetching PDF file');
  }
});

```

Note that the PDFs must be linearized to support this. Linearization optimizes PDFs so that they can be streamed into a client applocation. This allows remote online documents to be displayed almost instantly without having to wait for them to be completely downloaded.

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
