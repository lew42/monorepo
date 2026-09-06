-- worker/schema.sql — the users table, /notes/auth/ §4 unchanged. Nothing more:
-- no likes, no teams — this harness only needs identity. No email column
-- (identity.md ruling 7): the provider hands back the handle and avatar for free.

CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY,
    provider     TEXT NOT NULL,
    provider_id  TEXT NOT NULL,
    handle       TEXT NOT NULL,
    avatar_url   TEXT,
    token_epoch  INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL,
    UNIQUE (provider, provider_id)
);

-- The like: the smallest thing a stranger can write, and the D1 half of
-- data.md's Phase 2. /notes/auth/ §4 verbatim, including its two rules:
--   · `url` is a url, not a page id — there is no page table and there should
--     not be one (a rename orphans a page's likes; accepted, and named there).
--   · PRIMARY KEY (user_id, url) is what enforces one like per user per page.
--     A constraint the database holds cannot be forgotten by application code.
-- No `points` column anywhere: the count is COUNT(*), computed on read (§5).
CREATE TABLE IF NOT EXISTS likes (
    user_id    INTEGER NOT NULL REFERENCES users(id),
    url        TEXT    NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, url)
);
CREATE INDEX IF NOT EXISTS likes_url ON likes(url);
