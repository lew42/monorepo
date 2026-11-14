-- users: one row per Google account. google_sub is the stable id and is the same in every stage.
CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub  TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user',
  created_at  INTEGER NOT NULL,
  last_login  INTEGER NOT NULL
);

-- sessions: the cookie holds a random token; only its SHA-256 is stored, so a leaked table cannot be replayed.
CREATE TABLE sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);
