# A per-module log view (a note, not built)

The owner's idea (2026-10-24, item 8 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)): every module gets a page that shows **everything done in that module**, filterable like a database.

## What it would show

One row per thing done in the module's folder: a task started or landed, a commit, a session that touched it, an inbox note, a merge. Each row has a **type** and a **date**.

- **Filter by type and date**, the way a database view filters. A date range (day, week, month) and one or more types.
- **Control over the columns**: show, hide and reorder them, as the inbox and the sessions grid already do.
- Live: new rows stream in from the log, like the rest of the AI pages (CLAUDE.md, "Stream, don't poll").

## What already exists (build on it, law 6)

- **`node Server/ModuleLog.mjs <path> --by week|day|month`** joins the task logs, `git log -- <path>` and the task folders for one path, and grades each task (landed and committed, committed never closed, never started). It prints text; the data is already computed. This is the source for the rows. Doc: the [past-work skill](../../../../.claude/skills/past-work/SKILL.md), "One module's history".
- **The `tasks` query source and the sessions grid** (the [sessions page](../sessions/readme.md)): a filterable table with chosen columns, fed by a query source and pushed rows.
- **The Inbox** ([core/Page/ext/Inbox](/framework/core/Page/ext/Inbox/)): a list view with filters and column control.

So the view is a new query source over `ModuleLog`'s join plus the existing grid, not a new table class. Its natural home is a tab on the module's own page; the module audit's `audit.md` ([module-audit.md](module-audit.md)) would link to it.

Not built, not queued. Pick it up when the module audit has run on a few modules and the log view would answer a question the audit raised.
