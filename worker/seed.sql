-- worker/seed.sql — five fake identities. Local D1 persists across restarts
-- (Wrangler v3+), so this deletes first rather than assuming a clean start.
-- Roles and the ban flag are NOT columns here (schema.sql is /notes/auth/ §4,
-- unchanged) — worker/dev.js maps handle -> role/banned at login time and signs
-- it into the session payload. This table only holds who they are, not what
-- they may do.

DELETE FROM users;

INSERT INTO users (id, provider, provider_id, handle, avatar_url, token_epoch, created_at) VALUES
    (1, 'dev', 'alice', 'alice', NULL, 0, strftime('%s', 'now')), -- owner
    (2, 'dev', 'bob',   'bob',   NULL, 0, strftime('%s', 'now')), -- moderator
    (3, 'dev', 'carol', 'carol', NULL, 0, strftime('%s', 'now')), -- member
    (4, 'dev', 'dave',  'dave',  NULL, 0, strftime('%s', 'now')), -- member
    (5, 'dev', 'eve',   'eve',   NULL, 0, strftime('%s', 'now')); -- banned
