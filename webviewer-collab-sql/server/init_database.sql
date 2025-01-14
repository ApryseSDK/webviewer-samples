CREATE TABLE IF NOT EXISTS users (
  userName TEXT,
  email TEXT,
  password TEXT,
  status TEXT,
  type TEXT,
  customData TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER
);
CREATE TABLE IF NOT EXISTS documents (
  name TEXT,
  authorId TEXT NOT NULL,
  isPublic INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER,
  FOREIGN KEY (authorId) REFERENCES users (id)
);
CREATE TABLE IF NOT EXISTS annotations (
  xfdf TEXT,
  annotContents TEXT,
  authorId TEXT,
  annotationId TEXT,
  documentId TEXT,
  pageNumber INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER,
  inReplyTo TEXT,
  FOREIGN KEY (authorId) REFERENCES users (id)
  FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS annotationMembers (
  userId TEXT,
  documentId TEXT NOT NULL,
  annotationId TEXT NOT NULL,
  lastRead INTEGER,
  annotationCreatedAt INTEGER,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES users (id)
  FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
  FOREIGN KEY (annotationId) REFERENCES annotations (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS documentMembers (
  userId TEXT,
  documentId TEXT NOT NULL,
  lastRead INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES users (id)
  FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentions (
  userId TEXT,
  documentId TEXT NOT NULL,
  annotationId TEXT NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES users (id)
  FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
  FOREIGN KEY (annotationId) REFERENCES annotations (id) ON DELETE CASCADE
);