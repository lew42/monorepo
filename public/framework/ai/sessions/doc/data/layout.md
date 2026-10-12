# Session folder layout, and the migration dry-run

<!-- merged from layout.md (original kept in archive/) -->
## Where a session's files live

A Claude session has **one folder**, in the sessions store, under the day it started:

```
ai/sessions/2026/10/03/1a2b3c4d-…full-session-id/
    session.jsonl   the hand-written record: tags, notes, alerts, weight, closed, questions, links. Tracked in git, append only.
    cache.jsonl     the computed cost summary and audits. Gitignored, rebuilt freely.
    trace.json      the per-tool-call detail, only for a few sessions (the index lists which).
```

The day is the day of the session's first message (`first_at`, UTC). The index, `session-index.json`, has a `day` column, so the browser can build any session's path without looking at the disk.

### The rules

1. **One folder per session.** Nothing about a session is stored in a second place. Older shapes are only read, never written.
2. **Only code writes the path.** `Session.locate(id, first_at)` (node) decides it and moves an older folder in. `Session.dir_url(id)` (browser) reads the day from the index. Nobody builds the path by hand.
3. **The listing is never written.** The dev server does not create a `files.jsonl` inside a session folder (`Server/plugins/PageFiles.js`), and `.gitignore` keeps the computed files out of git, so thousands of folders cannot dirty the tree.
4. **One route.** Every row opens `/framework/ai/sessions/<id>/`, whichever shape the data is stored in.

### Old paths still load

The flat `ai/sessions/<id>/` is the older shape. `Session.locate` finds a session under either, and the first writer that touches a flat folder moves it into the date tree. To move everything at once, with a record of every move:

```
node Server/session-place.mjs --dry     # say what would move; changes nothing
node Server/session-place.mjs           # renames only; writes moves.jsonl (id, from, to) so a script can reverse it
```

The script is safe to run again, and never overwrites a file. The one thing it deletes is the stray `files.jsonl` listing a dev server once wrote into each cache folder (rebuilt on demand; git history keeps the tracked ones).

### Two other places a session's data sits

Some cards (a Servex agent's `page.jsonl`) live in the task date folders, `ai/2026/10/03/session-<id8>/` and `ai/2026-10-03/<task>/`. They are cards, not session records. The Sessions page lists them from `sessions.json` and opens them in the same detail view. The full table of patterns is in [`patterns.md`](patterns.md).

### Tasks live here too (2026-10-12)

A task folder sits inside the session that ran it, `YYYY/MM/DD/<session>/<task>/`, routed by its path (`AISession/StoreFolder.js`). Only `Server/TaskDirs.mjs` builds that path. [../../../doc/task-folders.md](../../../doc/task-folders.md).

### Decided and not yet built

- **Children inside the parent's folder** (`parent/child/`): the owner's rule (2026-10-08 evening). A child can start on a later day than its parent, so the child's folder sits under the parent's day, not its own. This needs the index to carry the path rather than the day. Queued; the grid already nests children from `session-tree.json`.
- **The ai/YYYY/MM/DD/session-<id8>/ shape** was built first (earlier on 2026-10-08) and replaced the same evening by the layout above. The code for it is in git history.

### Why ids, not task names

A task folder (`ai/sessions/2026/10/08/3f5a5fec-dbf0-4a4b-8573-560f281a0be3/session-class/`) is a unit of work with a human name. A Claude session is one transcript. They are not one to one: a task can take several sessions (a mastermind, its minions, a resumed run), and most sessions (every VS Code tab, every SDK run, every reviewer) have no task at all. The session id is the only key all of them share.

The task folder holds the work (`task.jsonl`, the brief, the findings). The session folder holds the money and the record. They join by id: a task's launch line in `task.jsonl` names its `session_id`, and the Servex registry maps an agent's name and parent to its `session_id`.


---

<!-- merged from migration-dry-run-2026-10-09.md (original kept in archive/) -->
## Folder migration — counts and what was applied (2026-10-09)

`node Server/session-migrate.mjs --repo <checkout>` is a dry run: it counts and changes nothing. `--apply` moves, `--undo` reverses it from `ai/sessions/migration-manifest.json`. Counts on the main data:

- 7,784 session folders: 7,783 move; 1 has no first_at day, so it stays.
- 4,555 card folders: 4,089 join a session by id8 and move; 466 are not session cards and stay. (4,089 + 466 = 4,555.)
- 1,066 task folders: 271 join a session by `session_id`; 795 are orphans and stay. (271 + 795 = 1,066.) 28 of the 271 name more than one session and would go with the first; 16 sessions have more than one task; none has more than one card.
- Folder names come from: task name 232, title 35, first prompt 7,431, `session-<id8>` 86.
- 6,582 names collide on a day. The id8 is appended; if that still clashes (test fixtures share an id8) the full id is used, so no collision is left unresolved.

### Decision: tasks stay where they are (superseded 2026-10-10: finished tasks now move, see [tasks-in-sessions.md](tasks-in-sessions.md))

Applied in a worktree with tasks included, the smoke test failed: a task is a page tree, and a page exists only while its parent names it, so a task moved under `sessions/…/<slug>/task/` has no route (404 "nothing matches"), and the day pages `ai/<day>/page.js` still declared the moved names. Fixing it means 5,497 rewritten URLs in 562 files plus routing for every folder level under `sessions/`. That is its own piece of work, so tasks move only with `--tasks`. Session folders and cards move now; a session's `links.task` still points at the task's original place.

### Applied

Session folders (`<uuid>/` → `<slug>/`) and cards (`session-<id8>/` files → `<slug>/`) are moved. The ignored `cache.jsonl` files move by rename, not `git mv`, so the real run is on the main checkout.
