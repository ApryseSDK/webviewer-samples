// This file is to run a server in localhost:process.env.PORT

import express from 'express';
import bodyParser from 'body-parser';
import open from 'open';
import handler from './handler.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Use JSON body parser for API endpoints
app.use(bodyParser.json());
app.use(bodyParser.text());
// For statically serving 'client' folder
app.use('/client', express.static('client'));
// Serve config directory for client-side access
app.use('/config', express.static('config'));

handler(app);

// Run server
app.listen(process.env.PORT, 'localhost', (err) => {
	if (err) {
		console.error(err);
	} else {
		console.info(`Server is listening at http://localhost:${process.env.PORT}/client/index.html`);
		open(`http://localhost:${process.env.PORT}/client/index.html`);
	}
});