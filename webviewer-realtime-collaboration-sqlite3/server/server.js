const express = require('express');
const app = express();
const port = 3000;
const annotationHandler = require('./annotationHandler');
const bodyParser = require('body-parser');
const open = (...args) => import('open').then(({default: open}) => open(...args));

app.use(bodyParser.text());
app.use(express.static('client'));

app.listen(port, '0.0.0.0', () => {
  console.info(`Server listening at port ${port}`);
  open('http://localhost:3000/index.html')
});

annotationHandler(app);