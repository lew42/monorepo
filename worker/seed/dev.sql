-- Local only (the dev script applies it after the migrations; safe to re-run). Seven fake people for the dev login (zed exists to be deleted by api.test.mjs: DELETE /api/me). Roles live in the
-- role column; eve is "banned" by worker/dev.js (a cookie flag here, the KV key in production). token_epoch and created_at are left out
-- of the update on purpose: a restart must never revoke sessions.
INSERT INTO users (id, provider, provider_id, handle, avatar_url, role, token_epoch, created_at, last_login) VALUES
    (1, 'dev', 'alice', 'alice', NULL, 'owner',     0, strftime('%s', 'now'), 0),
    (2, 'dev', 'bob',   'bob',   NULL, 'moderator', 0, strftime('%s', 'now'), 0),
    (3, 'dev', 'carol', 'carol', NULL, 'member',    0, strftime('%s', 'now'), 0),
    (4, 'dev', 'dave',  'dave',  NULL, 'member',    0, strftime('%s', 'now'), 0),
    (5, 'dev', 'eve',   'eve',   NULL, 'member',    0, strftime('%s', 'now'), 0),
    (6, 'dev', 'admin', 'admin', NULL, 'admin',     0, strftime('%s', 'now'), 0),
    (7, 'dev', 'zed',   'zed',   NULL, 'member',    0, strftime('%s', 'now'), 0)
ON CONFLICT (id) DO UPDATE SET provider = excluded.provider, provider_id = excluded.provider_id, handle = excluded.handle, role = excluded.role;

-- Three page rows under /imagine/cms/d1/ (worker/pages.js's proof).
INSERT INTO pages (path, json, updated) VALUES
    ('/imagine/cms/d1/one/',   '{"title":"One","description":"A row in D1 -- path, title, description, icon, nothing else.","icon":"looks_one"}',  strftime('%s', 'now')),
    ('/imagine/cms/d1/two/',   '{"title":"Two","description":"Same table, same route, a different row.","icon":"looks_two"}',                      strftime('%s', 'now')),
    ('/imagine/cms/d1/three/', '{"title":"Three","description":"Three rows, one query -- GET /api/pages?under=.","icon":"looks_3"}',                strftime('%s', 'now'))
ON CONFLICT (path) DO UPDATE SET json = excluded.json, updated = excluded.updated;
