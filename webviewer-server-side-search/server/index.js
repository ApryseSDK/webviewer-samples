const express = require('express');
const apiRouter = require('./api');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('client'));
app.use('/assets', express.static('assets'));
app.use('/api', apiRouter);

app.get('*', function(req, res){
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Sample server listening at http://localhost:${port}`);
})
