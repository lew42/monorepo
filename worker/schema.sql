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
