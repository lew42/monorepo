# Why the day folder came back (2026-10-13)

The day folders (`public/framework/ai/YYYY-MM-DD/`) were retired on 2026-10-12 ([task-folders.md](../../../../../../../../doc/task-folders.md)). On 2026-10-13 one was made again, and the Inbox sent the owner to a `/framework/ai/2026-10-13/…` link that 404s. This page says what did it, why the retirement did not stop it, and the change that does.

## What wrote `ai/2026-10-13/` today

| When | Code | Who ran it | What it made |
|---|---|---|---|
| 16:54 | `Server/crawl.mjs:50` (before `03d19d718`): `path.join(root, "public/framework/ai", dateStr(), "crawl")` | the `architecture-md` task mastermind, a one-off crawl ("my accidental crawl left an untracked public/framework/ai/2026-10-13/ folder", its landing card) | `ai/2026-10-13/crawl/` (crawl.jsonl, shots) |
| ~16:54 | `Server/council.mjs:140` (before `03d19d718`): `path.join(root, "public/framework/ai", now().slice(0, 10), "feedback-council")` | `Server/on-landing.mjs:44`, which spawns `council.mjs maybe` after every task landing | `ai/2026-10-13/feedback-council/` |
| 16:55 on | the dev server's file watcher | automatic | `ai/2026-10-13/files.jsonl` (the folder listing, with "gone" lines once the two folders moved) |

The `session-dup-check` task fixed both scripts and moved both folders into the store at 17:31 (`03d19d718`, `274b0e643`), still by hand-joining a date.

**Still writing it, found in this audit:** `Server/plugins/Start.js:41-65` (a task started from the board's compose box) makes `ai/<date>/<slug>/` and `ai/<date>/day.jsonl` and returns a `/framework/ai/<date>/<slug>/` url. Untouched since 2026-08-15.

## The link the owner clicked

`/framework/ai/2026-10-13/repo-size-plan/` is not a folder anybody wrote. It is a **reader** building a url from the day log: `public/framework/ai/rail/inbox.js:540` makes `/framework/ai/${date}/${task}/` for every landing in `day.jsonl`. The day log line names only the slug, so a task born in the store (`ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/repo-size-plan/`) gets an address that never existed. The router only redirects old addresses that are in the move log. About 30 readers build the same shape (`ai/rail/*.js`, `ext/AITask/*.js`, `ai/v/*`, `Server/ai2-overview.mjs`); `Server/on-landing.mjs:98` builds `/framework/ai/<parent folder>/<slug>/`, also wrong.

## Why the 10-12 retirement did not stop it

1. **It fixed the doors it knew about, not every door.** `TaskDirs` became the one path builder, and `new-task`, `append.mjs` and Servex's `open_task` were routed through it. No census looked for other scripts that join `public/framework/ai` with a date, so `crawl.mjs`, `council.mjs` and `Start.js` kept the old shape.
2. **Nothing refuses the old shape.** `append.mjs` silently re-homes an old path; a script calling `fs.mkdirSync` directly is never checked. A wrong path does not fail, so nobody notices.
3. **Readers were left for later.** The move log redirects tasks that moved; a task that was never in a day folder has no entry, so a reader's guessed url 404s.

## The one change that stops it for good

`TaskDirs.refuse(path)`: any path under `public/framework/ai/YYYY-MM-DD/` that is not a known moved folder throws, with a message naming where it goes (`ai/sessions/YYYY/MM/DD/…`, `node Server/TaskDirs.mjs --new <slug>`). `append.mjs` calls it, and `node Server/TaskDirs.mjs --census` lists every day folder on disk and every code line that still hand-joins one, so the next stray writer shows up in one command (the census is part of `TaskDirs.test.mjs`). Behind that: every writer builds its path with `TaskDirs`, and the readers resolve a slug to its real folder instead of guessing.
