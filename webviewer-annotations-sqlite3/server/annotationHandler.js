// WARNING: In this sample, the query inputs are not sanitized. For production use, you should use sql builder
// libraries like Knex.js (https://knexjs.org/) to prevent SQL injection.

const fs = require('fs');
const SQLite3 = require('sqlite3').verbose();
const TABLE = 'annotations';

module.exports = (app) => {
  // Create a database if it doesn't exist
  if (!fs.existsSync('server/xfdf.db')) {
    fs.writeFileSync('server/xfdf.db', '');
  }

  // Create annotations table with columns documentId, annotationID and xfdfString
  const db = new SQLite3.Database('server/xfdf.db');
  db.run(`CREATE TABLE IF NOT EXISTS ${TABLE} (documentId TEXT, annotationId TEXT PRIMARY KEY, xfdfString TEXT)`);
  db.close();

  // Handle POST request sent to '/server/annotationHandler.js'
  app.post('/server/annotationHandler.js', (req, res) => {
    const documentId = req.query.documentId;
    const annotationId = JSON.parse(req.body).annotationId;
    const xfdfString = JSON.parse(req.body).xfdfString.replace(/\'/g, `''`); // To escape single quote character in SQLite

    const db = new SQLite3.Database('server/xfdf.db');
    db.serialize(() => {
      const isDeleteCommand = /<delete>(.*)<\/delete>/s.test(xfdfString);

      let query;
      if (isDeleteCommand) {
        // Instead of saving the delete command, we can remove the row from the database
        query = `DELETE FROM ${TABLE} WHERE annotationId = '${annotationId}'`;
      } else {
        // Save document ID, annotation ID and XFDF string to database
        query = `INSERT OR REPLACE INTO ${TABLE} VALUES ('${documentId}', '${annotationId}', '${xfdfString}')`;
      }

      db.run(query, err => {
        if (err) {
          res.status(500);
        } else {
          res.status(200);
        }
        res.end();
      });
    });
    db.close();
  });

  // Handle GET request sent to '/server/annotationHandler.js'
  app.get('/server/annotationHandler.js', (req, res) => {
    const documentId = req.query.documentId;

    const db = new SQLite3.Database('server/xfdf.db');
    // Read from the database and send the rows as a response
    db.all(`SELECT annotationId, xfdfString FROM ${TABLE} WHERE documentId = '${documentId}'`, (err, rows) => {
      if (err) {
        res.status(204);
      } else {
        res.header('Content-Type', 'application/json');
        res.status(200).send(rows);
      }
      res.end();
    });
    db.close();
  });
}
