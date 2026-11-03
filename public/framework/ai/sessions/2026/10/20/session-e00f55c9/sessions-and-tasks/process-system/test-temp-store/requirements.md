Budget: $3

# Tests must not write fake agents into the real store

`public/framework/ai/sessions/2026/10/22/spawned/` holds 36 folders made by tests: minion-dead, minion-held, minion-race, minion-starting, minion-stuck, minion-v, minion-x, minion-y, task-mastermind-z (and -2, -3, -4 copies), plus minion-lib-h1-page-nvidia-…. Agents.js puts a spawn with no task under `ai/sessions/<day>/spawned/<id>/` (Agents.js ~line 252, `DatedFiles.sessions.day_dir()`).

1. Find which tests spawn these ids (grep the names in `Servex/**/*.test.mjs`, `Servex/*.test.mjs`).
2. Give those tests a temp store: one switch that points the sessions root (DatedFiles / TaskDirs) at a temp dir, set before Agents.js is imported, e.g. an env var the store already honours or a small static override. Prefer one fix in the store over editing every test; then set it in each of those tests.
3. Add one check in one of those tests: after it runs, no new folder appears under the real `ai/sessions/<today>/spawned/`.
4. Move the 36 existing folders aside (never delete): a node script with a dry run that moves them to the session scratchpad or a `.moved-aside/` folder, and say where in your reply.

Commit in your worktree; do not merge. Final reply: commits, which tests, pass counts.
