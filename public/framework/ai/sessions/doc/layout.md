# Where a session's files live

A Claude session has one folder, named by its session id, and the folder sits inside the **day the session first appeared**:

```
ai/sessions/2026/10/03/<session-id>/
    session.jsonl   the record: tags, notes, alerts, weight, closed, questions, links. Tracked in git, append only.
    cache.jsonl     the computed cost summary and audits. Gitignored, rebuilt freely.
```

The day is the date of the session's first message (`first_at`, in UTC), written `YYYY/MM/DD`. It is the same year/month/day tree the site's AI cards use, so a reader who knows one knows the other.

## The three rules

1. **The folder is cache plus record, nothing else.** Nothing here is a work log. A session's story lives in its task folder (see "Why ids, not task names" below).
2. **Only code writes the path.** `Session.locate(id, first_at)` (node) decides it and moves an old flat folder into its day. `Session.dir_url(id)` (browser) reads it from the day column of `session-index.json`. Nobody builds the path by hand.
3. **The listing is never written.** The dev server does not create a `files.jsonl` inside `ai/sessions/<id>/` or `ai/sessions/YYYY/...` (`Server/plugins/PageFiles.js`, `in_session_cache`), and `.gitignore` covers both, so thousands of session folders cannot dirty the git tree.

## Old paths still load

The old flat folders (`ai/sessions/<id>/`) are still read. `Session.read_text` tries the dated folder first and falls back to the flat one. The first writer that touches an old folder moves it. To move everything at once:

```
node Server/session-place.mjs --dry     # say what would move
node Server/session-place.mjs           # a plain rename; the only thing removed is the stray files.jsonl listings
```

A folder with no `first_at` anywhere (an empty session, a test fixture) stays flat. The script is safe to run again.

## Two things to know

- **A read can move a folder too.** In node, `read_text` calls `Session.locate`, so even a read renames an old flat folder into its day (and an id nobody knows gets today). That keeps one rule, "the path comes from `locate`", at the price of a surprising side effect on reads.
- **A move is a rename.** A reader that holds the old flat path gets an empty answer for one call while a writer moves the folder. For a cache that is fine; the next read finds it.
- **The browser finds a dated folder through `session-index.json`** (its `day` column). A session missing from the index reads from the flat path and shows nothing until the index is rebuilt (`node Server/session-summary.mjs --index`). Every session the table lists is in the index, so the table itself is never affected.

## Why this layout, and the alternative

- **Chosen: `ai/sessions/YYYY/MM/DD/<id>/`.** It keeps all session data in one module, it matches the card tree's shape, and `session-index.json` (the page's only fast read) carries the day, so the browser never lists a directory.
- **Alternative: `ai/YYYY/MM/DD/<id>/`.** Closer to the cards, but that tree is made of pages (each folder a card with a `page.jsonl`), and 7,700 machine-cache folders would sit among them. Rejected for that reason.
- The index design in `findings.md` (section 12) partitions the index by day of *update* in `ai/sessions/index/YYYY/MM/DD.jsonl`. That is a different thing from this layout (the day a session *began*, for its folder), and the two do not collide: `index` is not a year.

## Why ids, not task names

A task folder (`ai/2026-10-08/session-class/`) is a unit of work with a human name. A Claude session is one transcript. They are not one-to-one: a task can take several sessions (a mastermind, its minions, a resumed run), and most sessions (every VS Code tab, every SDK run, every reviewer) have no task at all. The Claude session id is the only key all of them share, so the cost cache is keyed by it.

A session is not stored twice, because the two folders hold different things:

- the **task folder** holds the work: `task.jsonl`, the brief, the findings.
- the **session folder** holds the money and the record: the cost cache, tags, alerts, closed.

They join by id. A task's launch line in `task.jsonl` names its `session_id`, and the Servex registry (`agents.jsonl`, read by `registry_rows()` in `Server/session-summary.mjs`) maps an agent's name and parent to its `session_id`. The Sessions table shows the name from that mapping. Naming a session after its task would only work for the minority that have one.
