-- Fake people for staging only (safe to re-run). Real Google accounts are added by signing in. Nobody can log in as these: provider 'seed'.
INSERT OR IGNORE INTO users (provider, provider_id, handle, avatar_url, role, created_at, last_login) VALUES
  ('seed', 'alice', 'Alice Example', NULL, 'member', 1760000000, 1760000000),
  ('seed', 'bob',   'Bob Example',   NULL, 'member', 1760100000, 1760100000),
  ('seed', 'carol', 'Carol Example', NULL, 'member', 1760200000, 1760200000),
  ('seed', 'dave',  'Dave Example',  NULL, 'member', 1760300000, 1760300000);
