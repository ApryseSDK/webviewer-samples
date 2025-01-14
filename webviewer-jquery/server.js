// modified original source from https://www.npmjs.com/package/reload#using-reload-in-express

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');

var app = express();

var appDir = path.join(__dirname, 'app');

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json()); // Parses json, multi-part (file), url-encoded

app.get('/', function (req, res) {
  res.sendFile(path.join(appDir, 'index.html'));
});

app.use(express.static(appDir));

var server = http.createServer(app);

server.listen(app.get('port'), function () {
  console.log('Web server listening on port ' + app.get('port'));
});
