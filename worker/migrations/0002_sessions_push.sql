-- One row per sign-in. The cookie carries the row's id (`sid`); a row that is ended, or gone, reads as signed out.
-- A cookie with no sid (the dev login before this migration, latency.mjs's minted ones) is still honoured: it fails only on token_epoch.
CREATE TABLE sessions (
    id          TEXT PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    created_at  INTEGER NOT NULL,
    ended_at    INTEGER,
    user_agent  TEXT
);
CREATE INDEX sessions_user ON sessions(user_id);

-- One row per browser push subscription (PushSubscription.toJSON()). In D1, not UserDO, so the weekly cron reads every subscriber in one query.
CREATE TABLE push_subs (
    endpoint    TEXT PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    p256dh      TEXT NOT NULL,
    auth        TEXT NOT NULL,
    created_at  INTEGER NOT NULL
);
CREATE INDEX push_subs_user ON push_subs(user_id);
