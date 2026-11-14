-- Fake people for staging only (safe to re-run). Real Google accounts are added by signing in.
INSERT OR IGNORE INTO users (google_sub, email, name, avatar_url, role, created_at, last_login) VALUES
  ('seed:alice', 'alice@example.test', 'Alice Example', NULL, 'user', 1760000000000, 1760000000000),
  ('seed:bob',   'bob@example.test',   'Bob Example',   NULL, 'user', 1760100000000, 1760100000000),
  ('seed:carol', 'carol@example.test', 'Carol Example', NULL, 'user', 1760200000000, 1760200000000),
  ('seed:dave',  'dave@example.test',  'Dave Example',  NULL, 'user', 1760300000000, 1760300000000);
