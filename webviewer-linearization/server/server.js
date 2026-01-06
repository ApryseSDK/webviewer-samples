// ES6 Compliant Syntax
// GitHub Copilot - Claude Sonnet 4.5 - December 22, 2025
// server.js

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM equivalent filename and dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',   // Specify the frontend origin (by default Vite uses Port 5173)
  methods: ['GET', 'POST'],          // Allowed HTTP methods
  credentials: true,                 // Allow sending credentials (cookies, HTTP auth headers)
  exposedHeaders: ['Content-Range', 'Accept-Ranges'] // Allowed HTTP headers
}));

// local directory - the files folder
app.use(express.static('files'));


// serving a linearized file with range requests -------------------------------------------- 
app.get('/linearized', async (req, res) => {

  const filePath = path.join(__dirname, 'files', 'PDFTRON_about-linearized.pdf');

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('PDF file not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Set common headers
  // res.set('Access-Control-Allow-Origin', '*'); // this is not required as CORS middleware already adds the origin header
  res.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges'); // https://docs.apryse.com/web/faq/slow-loading#refused-to-get-unsafe-header-contentrange
  res.set('Accept-Ranges', 'bytes'); // Tells the client (browser) that the server supports partial content requests
  res.set('Content-Type', 'application/pdf'); // Tells the client (browser) that the response body is a PDF file.


  if (range) {
    const matches = range.match(/bytes=(\d*)-(\d*)/);
    let start, end;

    if (matches) {
      if (matches[1] === '' && matches[2]) {
        // Suffix range: bytes=-22 
        const suffixLength = parseInt(matches[2], 10);
        start = fileSize - suffixLength;
        end = fileSize - 1;
      } else {
        start = parseInt(matches[1], 10);
        end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;
      }

      // Validate range
      if (start >= fileSize || start < 0 || end >= fileSize || end < start) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunkSize = end - start + 1;
      res.status(206);
      res.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.set('Content-Length', chunkSize);

      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }
  }
  else {
    res.set('Content-Length', fileSize);
    res.status(200);

    fs.createReadStream(filePath).pipe(res);
  }
});


// Start the Express server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
