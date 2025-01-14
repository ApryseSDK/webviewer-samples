import fs from "fs";
import sqlite3 from "sqlite3";

let db: sqlite3.Database;

export default function getDB(): Promise<sqlite3.Database> {
  if (db) return Promise.resolve(db);

  return new Promise((resolve) => {
    // Read query file
    const initDatabaseQuery = fs
      .readFileSync(`${__dirname}/init_database.sql`)
      .toString();

    // Create and initialize database
    if (!fs.existsSync("./server/collab.db")) {
      fs.writeFileSync("./server/collab.db", "");
    }
    // Connect to SQLite database
    db = new sqlite3.Database("./server/collab.db", (err: any) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("🚀 Connected to the in-memory SQlite database.");
      resolve(db);
    });
    const dataArr = initDatabaseQuery.split(");");
    db.serialize(() => {
      // db.run runs your SQL query against the DB
      db.run("PRAGMA foreign_keys = ON;");
      // Loop through the `dataArr` and db.run each query
      dataArr.forEach((query) => {
        if (query) {
          // Add the delimiter back to each query before you run them
          // In this case the it was `);`
          const restoredQuery = `${query});`;
          db.run(restoredQuery, (err) => {
            if (err) throw err;
          });
        }
      });
    });
  });
}