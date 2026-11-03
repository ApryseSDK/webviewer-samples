// Test-only server: same as server/serve.js but does not open a browser.
const path = require('node:path');
const express = require('express');
const bodyParser = require('body-parser');
const annotationHandler = require('../../../server/annotationHandler');

const root = path.resolve(__dirname, '../../..');
const app = express();

app.use(bodyParser.text());
app.use('/client', express.static(path.join(root, 'client')));

annotationHandler(app);

app.get('/server/demo.pdf', (req, res) => {
  res.contentType('application/pdf');
  res.sendFile(path.join(root, 'server', 'demo.pdf'));
});

app.listen(3000, 'localhost', () => {
  console.info('Test server is listening at http://localhost:3000/client/index.html');
});
