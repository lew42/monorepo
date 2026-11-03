# Folder migration — counts and what was applied (2026-10-09)

`node Server/session-migrate.mjs --repo <checkout>` is a dry run: it counts and changes nothing. `--apply` moves, `--undo` reverses it from `ai/sessions/migration-manifest.json`. Counts on the main data:

- 7,784 session folders: 7,783 move; 1 has no first_at day, so it stays.
- 4,555 card folders: 4,089 join a session by id8 and move; 466 are not session cards and stay. (4,089 + 466 = 4,555.)
- 1,066 task folders: 271 join a session by `session_id`; 795 are orphans and stay. (271 + 795 = 1,066.) 28 of the 271 name more than one session and would go with the first; 16 sessions have more than one task; none has more than one card.
- Folder names come from: task name 232, title 35, first prompt 7,431, `session-<id8>` 86.
- 6,582 names collide on a day. The id8 is appended; if that still clashes (test fixtures share an id8) the full id is used, so no collision is left unresolved.

## Decision: tasks stay where they are (for now)

Applied in a worktree with tasks included, the smoke test failed: a task is a page tree, and a page exists only while its parent names it, so a task moved under `sessions/…/<slug>/task/` has no route (404 "nothing matches"), and the day pages `ai/<day>/page.js` still declared the moved names. Fixing it means 5,497 rewritten URLs in 562 files plus routing for every folder level under `sessions/`. That is its own piece of work, so tasks move only with `--tasks`. Session folders and cards move now; a session's `links.task` still points at the task's original place.

## Applied

Session folders (`<uuid>/` → `<slug>/`) and cards (`session-<id8>/` files → `<slug>/`) are moved. The ignored `cache.jsonl` files move by rename, not `git mv`, so the real run is on the main checkout.
