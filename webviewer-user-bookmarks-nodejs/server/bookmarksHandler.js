const path = require('path');
const fs = require('fs');

module.exports = (app) => {
  // Create xfdf folder if it doesn't exist
  if (!fs.existsSync('server/bookmarks')) {
    fs.mkdirSync('server/bookmarks');
  }

  // Handle POST request sent to '/server/bookmarksHandler.js'
  app.post('/server/bookmarksHandler.js', (request, response) => {
    const bookmarksFile = path.resolve(__dirname, `./bookmarks/${request.query.documentId}.json`);

    try {
      // Write XFDF string into an XFDF file
      response.status(200).send(fs.writeFileSync(bookmarksFile, request.body));
    } catch(e) {
      response.status(500).send(`Error writing bookmarks data to ${bookmarksFile}`);
    }
    response.end();
  });

  // Handle GET request sent to '/server/bookmarksHandler.js'
  app.get('/server/bookmarksHandler.js', (request, response) => {
    const bookmarksFile = path.resolve(__dirname, `./bookmarks/${request.query.documentId}.json`);

    if (fs.existsSync(bookmarksFile)) {
      response.header('Content-Type', 'text/xml');
      // Read from the XFDF file and send the string as a response
      response.status(200).send(fs.readFileSync(bookmarksFile));
    } else {
      response.status(204).send(`${bookmarksFile} is not found.`);
    }
    response.end();
  });
}
