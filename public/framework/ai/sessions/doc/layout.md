# Where a session's files live

A Claude session has **one folder**, in the same date tree as every AI card:

```
ai/2026/10/03/session-1a2b3c4d/      "session-" + the first 8 characters of the session id
    page.jsonl      the card's page, if the session has one (Servex and VS Code cards do)
    session.jsonl   the hand-written record: tags, notes, alerts, weight, closed, questions, links. Tracked in git, append only.
    cache.jsonl     the computed cost summary and audits. Gitignored, rebuilt freely.
```

The day is the day of the card folder if one exists, else the day of the session's first message (`first_at`, UTC). The full id is written inside the files, so the short name is only a label.

## The three rules

1. **One folder per session.** Nothing about a session is stored in a second place. The older shapes below are only read, never written.
2. **Only code writes the path.** `Session.locate(id, first_at)` (node) decides it and moves an older folder in. `Session.dir_url(id)` (browser) reads the day from the `day` column of `session-index.json`. Nobody builds the path by hand.
3. **The listing is never written.** The dev server does not create a `files.jsonl` inside a session folder (`Server/plugins/PageFiles.js`, `in_session_cache`), and `.gitignore` keeps `cache.jsonl` and everything but `session.jsonl` out of git, so thousands of folders cannot dirty the tree.

## Old paths still load

Two older shapes exist: the flat `ai/sessions/<id>/` and the interim `ai/sessions/YYYY/MM/DD/<id>/`. `Session.locate` finds a session under any of them. The first writer that touches an older folder moves it into the date tree. To move everything at once, with a record of every move:

```
node Server/session-place.mjs --dry     # say what would move; changes nothing
node Server/session-place.mjs           # renames only; writes moves.jsonl (id, from, to) so a script can reverse it
```

If the card's folder already exists, the cache is moved in beside its `page.jsonl`; no file is overwritten. A folder with no known day (an empty session, a test fixture) stays where it is. The script is safe to run again. The only thing it deletes is the stray `files.jsonl` listing a dev server once wrote into each cache folder.

## Two things to know

- **A read can move a folder too.** In node, `read_text` calls `Session.locate`, so even a read renames an older folder into place. That keeps one rule, "the path comes from `locate`", at the price of a surprising side effect on reads.
- **The browser finds the folder through `session-index.json`.** A session missing from the index reads from the flat path and shows nothing until the index is rebuilt (`node Server/session-summary.mjs --index`). Every session the table lists is in the index, so the table itself is not affected.

## Why this layout, and the alternative

- **Chosen: the date tree, `ai/YYYY/MM/DD/session-<id8>/`.** The owner's preference (2026-10-08): the cards already live there, so a session and its card are one folder and the site has one place to look.
- **Alternative, rejected: `ai/sessions/YYYY/MM/DD/<id>/`.** It was the first answer, and it kept session data apart from the cards, which is the split being removed.
- **Not built yet: child sessions as subdirectories (`parent/child`).** The grid already nests children under their parent from `session-tree.json`. The folder rule is queued in `2026-10-08/session-class/findings.md` section 14, with the reason: a child can start on a later day than its parent.
- The day-partitioned index in that file's section 12 (`sessions/index/YYYY/MM/DD.jsonl`, by day of update) is a different thing from where a session's folder lives and does not collide with it.

## Why ids, not task names

A task folder (`ai/2026-10-08/session-class/`) is a unit of work with a human name. A Claude session is one transcript. They are not one-to-one: a task can take several sessions (a mastermind, its minions, a resumed run), and most sessions (every VS Code tab, every SDK run, every reviewer) have no task at all. The session id is the only key all of them share.

A session is not stored twice, because the two folders hold different things: the **task folder** holds the work (`task.jsonl`, the brief, the findings), and the **session folder** holds the money and the record. They join by id. A task's launch line in `task.jsonl` names its `session_id`, and the Servex registry (`agents.jsonl`, read by `registry_rows()` in `Server/session-summary.mjs`) maps an agent's name and parent to its `session_id`. The Sessions table shows the name from that mapping.
