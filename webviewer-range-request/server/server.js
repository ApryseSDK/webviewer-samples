// ES6 Compliant Syntax
// GitHub Copilot - Claude Sonnet 4.5 - December 22, 2025
// server.js

import express from 'express';
import cors from 'cors';

// Initialize Express app
const app = express();
const PORT = 4000;

// Sample URL of a linearized PDF file
const pdfURL = 'https://apryse.s3.us-west-1.amazonaws.com/public/files/samples/canada-income-tax-act.pdf';

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',   // Specify the frontend origin (by default Vite uses Port 5173)
  methods: ['GET', 'POST'],          // Allowed HTTP methods
  credentials: true,                 // Allow sending credentials (cookies, HTTP auth headers)
  exposedHeaders: ['Content-Range', 'Accept-Ranges'] // Allowed HTTP headers
}));

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

// Start the Express server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});