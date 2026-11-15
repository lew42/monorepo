-- The whole D1 schema, one file. users is /notes/auth/ §4 plus role and last_login (identity.md: one row is the identity and the profile).
-- Roles are can.js's rows: owner, admin, founder, moderator, member. Providers: 'google' (real sign-in), 'dev' (local seed), 'seed' (staging fakes).
CREATE TABLE users (
    id           INTEGER PRIMARY KEY,
    provider     TEXT NOT NULL,
    provider_id  TEXT NOT NULL,
    handle       TEXT NOT NULL,
    avatar_url   TEXT,
    role         TEXT NOT NULL DEFAULT 'member',
    token_epoch  INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL,
    last_login   INTEGER NOT NULL DEFAULT 0,
    UNIQUE (provider, provider_id)
);

-- The like: /notes/auth/ §4 verbatim. `url` is a url, not a page id; PRIMARY KEY (user_id, url) enforces one like per user per page.
CREATE TABLE likes (
    user_id    INTEGER NOT NULL REFERENCES users(id),
    url        TEXT    NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, url)
);
CREATE INDEX likes_url ON likes(url);

-- worker/pages.js: a page stored as a row. Independent of likes (likes survive a page rename on purpose).
CREATE TABLE pages (
    path    TEXT PRIMARY KEY,
    json    TEXT NOT NULL,
    updated INTEGER NOT NULL
);

-- The list of live documents. Each document's content lives in its own Room (worker/room.js); this table only names them.
CREATE TABLE docs (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    owner_id   INTEGER NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL
);
