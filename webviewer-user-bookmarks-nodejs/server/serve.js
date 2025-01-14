// This file is to run a server in localhost:3000
// Code to handle annotations is in annotationHandler.js

const express = require('express');
const bodyParser = require('body-parser');
const opn = require('opn');
const bookmarksHandler = require('./bookmarksHandler');

const app = express();

app.use(bodyParser.text());
app.use('/client', express.static('client')); // For statically serving 'client' folder at '/'

bookmarksHandler(app);

// Run server
app.listen(3000, '0.0.0.0', (err) => {
	if (err) {
		console.error(err);
	} else {
		console.info(`Server is listening at http://localhost:3000/client/index.html`);
		opn('http://localhost:3000/client/index.html');
	}
});
