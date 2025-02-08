// This file is to run a server in localhost:3000
// Code to handle annotations is in annotationHandler.js

const express = require('express');
const bodyParser = require('body-parser');
const open = (...args) => import('open').then(({default: open}) => open(...args));
const annotationHandler = require('./annotationHandler');

const app = express();

app.use(bodyParser.text());
app.use('/client', express.static('client')); // For statically serving 'client' folder at '/'

annotationHandler(app);

// Run server
app.listen(3000, 'localhost', (err) => {
	if (err) {
		console.error(err);
	} else {
    console.info(`Server is listening at http://localhost:3000/client/index.html`);
    open('http://localhost:3000/client/index.html');
	}
});