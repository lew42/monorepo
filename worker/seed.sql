-- worker/seed.sql — five fake identities. Local D1 persists across restarts
-- (Wrangler v3+), and dev.mjs re-runs this file on every `npm run dev`, so it
-- has to be safe to apply to a database that is already seeded.
--
-- ⚠ It used to open with `DELETE FROM users;`. That stopped working the moment
-- worker/schema.sql gained `likes` — D1 ENFORCES foreign keys (verified
-- 2026-09-06: the delete failed with SQLITE_CONSTRAINT_FOREIGNKEY as soon as
-- one like existed), so the second `npm run dev` after anybody liked anything
-- would have died before the harness started. The upsert below is the fix, and
-- it buys the better behaviour anyway: **likes survive a restart**, which is
-- the whole difference between a D1 row and a browser's `store()`.
--
-- Roles and the ban flag are NOT columns here (schema.sql is /notes/auth/ §4,
-- unchanged) — worker/dev.js maps handle -> role/banned at login time and signs
-- it into the session payload. This table only holds who they are, not what
-- they may do.
--
-- `token_epoch` and `created_at` are deliberately left out of the DO UPDATE:
-- bumping token_epoch is how /notes/auth/ §3 revokes every session, so a plain
-- restart must never touch it, and created_at is the day they first existed.

INSERT INTO users (id, provider, provider_id, handle, avatar_url, token_epoch, created_at) VALUES
    (1, 'dev', 'alice', 'alice', NULL, 0, strftime('%s', 'now')), -- owner
    (2, 'dev', 'bob',   'bob',   NULL, 0, strftime('%s', 'now')), -- moderator
    (3, 'dev', 'carol', 'carol', NULL, 0, strftime('%s', 'now')), -- member
    (4, 'dev', 'dave',  'dave',  NULL, 0, strftime('%s', 'now')), -- member
    (5, 'dev', 'eve',   'eve',   NULL, 0, strftime('%s', 'now'))  -- banned
ON CONFLICT (id) DO UPDATE SET
    provider    = excluded.provider,
    provider_id = excluded.provider_id,
    handle      = excluded.handle,
    avatar_url  = excluded.avatar_url;

-- Anything a previous, differently-shaped seed left behind.
DELETE FROM users WHERE id > 5;
DELETE FROM likes WHERE user_id NOT IN (SELECT id FROM users);
