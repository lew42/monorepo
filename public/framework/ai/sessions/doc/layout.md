# Where a session's files live

A Claude session has **one folder**, in the sessions store, under the day it started:

```
ai/sessions/2026/10/03/1a2b3c4d-…full-session-id/
    session.jsonl   the hand-written record: tags, notes, alerts, weight, closed, questions, links. Tracked in git, append only.
    cache.jsonl     the computed cost summary and audits. Gitignored, rebuilt freely.
    trace.json      the per-tool-call detail, only for a few sessions (the index lists which).
```

The day is the day of the session's first message (`first_at`, UTC). The index, `session-index.json`, has a `day` column, so the browser can build any session's path without looking at the disk.

## The rules

1. **One folder per session.** Nothing about a session is stored in a second place. Older shapes are only read, never written.
2. **Only code writes the path.** `Session.locate(id, first_at)` (node) decides it and moves an older folder in. `Session.dir_url(id)` (browser) reads the day from the index. Nobody builds the path by hand.
3. **The listing is never written.** The dev server does not create a `files.jsonl` inside a session folder (`Server/plugins/PageFiles.js`), and `.gitignore` keeps the computed files out of git, so thousands of folders cannot dirty the tree.
4. **One route.** Every row opens `/framework/ai/sessions/<id>/`, whichever shape the data is stored in.

## Old paths still load

The flat `ai/sessions/<id>/` is the older shape. `Session.locate` finds a session under either, and the first writer that touches a flat folder moves it into the date tree. To move everything at once, with a record of every move:

```
node Server/session-place.mjs --dry     # say what would move; changes nothing
node Server/session-place.mjs           # renames only; writes moves.jsonl (id, from, to) so a script can reverse it
```

The script is safe to run again, and never overwrites a file. The one thing it deletes is the stray `files.jsonl` listing a dev server once wrote into each cache folder (rebuilt on demand; git history keeps the tracked ones).

## Two other places a session's data sits

Some cards (a Servex agent's `page.jsonl`) live in the task date folders, `ai/2026/10/03/session-<id8>/` and `ai/2026-10-03/<task>/`. They are cards, not session records. The Sessions page lists them from `sessions.json` and opens them in the same detail view. The full table of patterns is in [`patterns.md`](patterns.md).

## Decided and not yet built

- **Children inside the parent's folder** (`parent/child/`): the owner's rule (2026-10-08 evening). A child can start on a later day than its parent, so the child's folder sits under the parent's day, not its own. This needs the index to carry the path rather than the day. Queued; the grid already nests children from `session-tree.json`.
- **The ai/YYYY/MM/DD/session-<id8>/ shape** was built first (earlier on 2026-10-08) and replaced the same evening by the layout above. The code for it is in git history.

## Why ids, not task names

A task folder (`ai/2026-10-08/session-class/`) is a unit of work with a human name. A Claude session is one transcript. They are not one to one: a task can take several sessions (a mastermind, its minions, a resumed run), and most sessions (every VS Code tab, every SDK run, every reviewer) have no task at all. The session id is the only key all of them share.

The task folder holds the work (`task.jsonl`, the brief, the findings). The session folder holds the money and the record. They join by id: a task's launch line in `task.jsonl` names its `session_id`, and the Servex registry maps an agent's name and parent to its `session_id`.
