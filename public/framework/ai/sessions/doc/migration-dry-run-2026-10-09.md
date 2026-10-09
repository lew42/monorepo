# Folder migration — dry run on the main data (2026-10-09)

Nothing was moved. `node Server/session-migrate.mjs --repo <main checkout>` (the default is a dry run) counted:

- 7,784 session folders.
- 4,089 cards join a session by id (466 other cards are not session cards and stay).
- 271 tasks join a session by `session_id` (795 orphan tasks stay). 28 of those name more than one session and move with the first.
- 16 sessions have more than one task; none has more than one card.
- Folder names come from: task name 232, title 35, first prompt 7,431, `session-<id8>` 86.
- 6,582 names collide on a day and get the id8 appended.
- 12,143 moves planned: 7,783 session, 4,089 card, 271 task.

Apply waits for the owner's go-ahead. Undo is `--undo` (the manifest is `ai/sessions/migration-manifest.json`). The ignored `cache.jsonl` files move by rename, not `git mv`, so the real run is on the main checkout.
