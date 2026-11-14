-- The list of documents. Each document's content lives in its own Durable Object (src/doc.js); this table only names them.
CREATE TABLE docs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL
);
