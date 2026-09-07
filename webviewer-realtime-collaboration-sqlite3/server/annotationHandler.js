const fs = require('node:fs');
const sqlite3 = require('sqlite3').verbose();
const TABLE = 'annotations';
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8181 });
const DB_PATH = 'server/xfdf.db';

const annotationHandler = (app) => {

  // Create and initialize database
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '');
  }
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ${TABLE} (documentId TEXT, annotationId TEXT PRIMARY KEY, xfdfString TEXT)`);
  });

  // Connect to WebSocket client
  wss.on('connection', ws => {
    // When message is received from client
    ws.on('message', rawMessage => {
      let payload;
      try {
        payload = JSON.parse(rawMessage.toString());
      } catch (error) {
        console.warn('Skipping invalid WebSocket payload', error);
        return;
      }

      const { documentId, annotationId, xfdfString } = payload;
      if (!documentId || !annotationId || !xfdfString) {
        return;
      }

      // Persist annotation payload
      db.run(
        `INSERT OR REPLACE INTO ${TABLE} (documentId, annotationId, xfdfString) VALUES (?, ?, ?)`,
        [documentId, annotationId, xfdfString],
        (err) => {
          if (err) {
            console.warn('Failed to persist annotation payload', err);
          }
        },
      );

      const message = JSON.stringify(payload);
      wss.clients.forEach((client) => {
        // Broadcast to every client except for the client where the message came from
        if (client.readyState === WebSocket.OPEN && ws !== client) {
          client.send(message);
        }
      });
    });
  });

  app.get('/server/annotationHandler.js', (req, res) => {
    const documentId = req.query.documentId;
    db.all(`SELECT annotationId, xfdfString FROM ${TABLE} WHERE documentId = ?`, [documentId], (err, rows) => {
      if (err) {
        res.status(204);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(rows);
      }
      res.end();
    });
  });
};

module.exports = annotationHandler;
