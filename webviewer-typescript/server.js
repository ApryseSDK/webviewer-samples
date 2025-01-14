const express = require('express');
const opn = require('opn');
const ip = require('ip');

const app = express();

const options = process.argv.reduce((acc, arg) => {
	const pair = arg.split('=');
	if (pair.length === 2) {
		acc[pair[0]] = pair[1];
	}
	return acc;
}, {});

app.get('/ip', (req, res) => {
	res.send(ip.address());
});

app.get(/\/myApp(.*)(\/|\.html)$/, (req, res, next) => {
	if (req.query.key || !options.key) {
		next();
	} else {
		if (req.originalUrl.slice(-10) === 'index.html') {
			res.redirect(`${req.originalUrl}?key=${options.key}`)
		} else {
			res.redirect(`./index.html?key=${options.key}`)
		}
	}
});

app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use('/src', express.static('src'));
app.use('/dist', express.static('dist'));

app.listen(3000, '0.0.0.0', (err) => {
	if (err) {
		console.error(err);
	} else {
		console.info(`Listening at localhost:3000 (http://${ip.address()}:3000)`);
			opn(`http://localhost:3000/`);
	}
});