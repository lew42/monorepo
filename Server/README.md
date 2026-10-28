# Server

Dev only — Servex starts it behind its proxy: `http://monorepo.localhost/` (port 80 is
Servex's since 2026-09-23). By hand: `PORT=<n> node server.js` (`PORT` defaults to 80, `HOST` to bind somewhere
other than `0.0.0.0` — Servex passes `HOST=127.0.0.1` to the servers it starts).
Reuse the one already running. ⚠ It used to pin a core (~130%) every few days;
**fixed 2026-09-06**, but a server started before that is still running the old
code — restart it. What it was: [`doc/spin.md`](./doc/spin.md).
Slow or crashing again (2026-10-09 first look): [`doc/perf-2026-10-09.md`](./doc/perf-2026-10-09.md).

Dictation failing while the page will not reload: Whisper died with a Servex restart, now fixed, with the loop that reproduces it: [`doc/transcription-crash-2026-10-12.md`](./doc/transcription-crash-2026-10-12.md).
Clear out landed worktrees, with a plan first and a manifest (`node Server/Worktrees.mjs --plan`): [`doc/worktrees.md`](./doc/worktrees.md).
Every task log held in memory and queryable (module, landed, text, raw-log paths): [`doc/session-index.md`](./doc/session-index.md).

The owner-facing server also starts `whisper-server` for dictation on its own —
[`plugins/Whisper.js`](./plugins/Whisper.js), `NO_WHISPER=1` to opt out; see
[`ux/Dictate`](/framework/ux/Dictate/).

## Routes the dev server adds for the pages

- `GET /api/folder-names?dir=/framework/ai/sessions/2026/10/20/` ([`plugins/FolderNames.js`](./plugins/FolderNames.js)) answers `{"names": [...]}`, the entry names of one folder under `public/`, always a 200 (a missing folder is `[]`). `ai/AITask/listing.js` asks it once per folder, so opening a task folder checks `session.jsonl`, `task.jsonl`, `page.js` and `requirements.md` without a 404 probe for each. It is a new route: a dev server started before it landed answers no listing, and the pages fall back to the old probes (and their 404s) until the server restarts.

## Scripts (one line each; the full paragraph for every one is in [`doc/script-notes.md`](./doc/script-notes.md))

- `node Server/ModuleLog.mjs <path>` — one folder's work log, graded against git; beside `PastWork.mjs`.
- `node Server/Deprecated.mjs` — the deprecation census: every `DEPRECATED (` mark in live code with its live caller count (dry run by default; `--json`, `--write <file>`); test `Deprecated.test.mjs`. The rule: [framework/doc/rules.md](/framework/doc/rules.md).
- `node Server/health.mjs` — optional watcher that headless-checks a page after a file that could break it changes ([health readme](/framework/ai/health/)).
- `node Server/layout-check.mjs <url...>` — shoots pages at four widths, flags wasted space; `on-landing.mjs` runs it on every landing.
- `node Server/merge.mjs <worktree>` — finds changed pages, smoke-tests them and their links, merges; `--quick` is the fast path for a one-line voice fix ([`doc/review.md`](./doc/review.md#which-widths)).
- `node Server/window-lint.mjs` — repo-wide sweep for a `spawn`/`exec` missing `windowsHide: true`; `Browser.mjs` is the one Chromium launcher; `window-watch.mjs` is the live catcher ([`doc/browser.md`](./doc/browser.md)).
- `node Server/padding-check.mjs <url>` — does any text sit at 0 from an edge; non-zero exit when it does.
- `Server/on-landing.mjs` — runs on the first `landed_at`: text-check, layout-check, padding-check, `doc-check.mjs` ([`doc/on-landing.md`](./doc/on-landing.md)); `Server/owner-check.mjs` is its last check. The ledger hook refuses a `landed_at` with no `outcome`.
- `node Server/ReadyToMerge.mjs [--json]` — the branches agents marked `ready:` (not yet in michael/dev), with review phrase and worktree; Servex serves it to the Merge button on [`/framework/ai/merge/`](/framework/ai/merge/) ([`ai/merge/readme.md`](../public/framework/ai/merge/readme.md)).
- `node Server/review.mjs <taskdir> [<worktree>]` — a fresh agent says pass or fix before `merge.mjs` takes a branch; run on `michael/dev` it reviews the task record's worktree or refuses, never a false pass ([`doc/review.md`](./doc/review.md)).
- `node Server/Audit.mjs <taskdir...>` — computes the consensus of several task audits; no AI writes it from memory.
- `Server/AskEach.mjs` `askOnce()` — one cheap Q&A turn, optionally on OpenRouter; ⚠ the SDK mis-prices an OpenRouter turn.
- `Server/Crawl.mjs` — nightly full-site crawl at 1920; failures go to `ai/todo.md`.
- `Server/Council.mjs` — Feedback Council collector and runner; off switch `COUNCIL=off`.
- `node Server/ReadmeOrphans.mjs` — lists every directory with a readme that the readme above it never names (the readme chain cannot reach it); the page-nav twin is `OrphanCheck.mjs`.
- `node Server/SessionIdentity.mjs <session uuid>` — read-only: which transcripts, folders, cost lines and child agents belong to one session; TrackingCheck's check 6 runs it; test `SessionIdentity.test.mjs` ([core/Session/doc/identity.md](../public/framework/core/Session/doc/identity.md)).
- `node Server/SessionConsolidate.mjs <session uuid> [--apply --manifest <file>]` — one session, one folder: folds a session's second folders into the oldest, with a dry run, a manifest and a moved-aside copy; `session-dir-clash.test.mjs` tests the folder lookup (`DatedFiles.session_dir`). `Servex/agents/turn-costs.test.mjs` tests a session's own turns.
- `node Server/DoneCheck.mjs [--dry|--list]` — Haiku check of completed owner asks, "marked done, not done" ([completion](../public/framework/core/Task/doc/completion.md)).
- `node Server/CloseoutWalk.mjs <session> [--dry|--apply|--counts]` — walks a session's open owner asks to done, stopped, or deferred with a home (same doc).
- `node Server/NavCheck.mjs <worktree>` — the click test: every page a branch adds must have an `a[href]` on its parent page, loaded headless; `merge.mjs` runs it and refuses an unlinked page, `--no-nav "why"` overrides ([`doc/nav-check.md`](./doc/nav-check.md)).
- [`git-hooks/`](./git-hooks/) — the git hooks every worktree shares, versioned here with a small installer.

## Moved to a doc (verbatim)

The supervisor, watching `public/`, holding reloads, what a browser can ask, the loopback-only socket, and the MCP tools: [doc/readme-sections-2026-10-13.md](doc/readme-sections-2026-10-13.md).

## More

[`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`RefineQueue.mjs`](../public/framework/ext/Refine/doc/refine-queue.md) — refines the owner's past prompts, one Haiku call per prompt, N at once, onto each session page's Coverage tab (`public/framework/ext/Refine/doc/refine-queue.md`)

- **Scripts census** (what every script under `Server/`, `Servex/`, `.claude/hooks/` is, who uses it, which are stale): [doc/scripts.md](doc/scripts.md)

- **Log lines** (`LogLine.mjs`: the one validated, stamped writer behind the `log` tool and `append.mjs`): [doc/log-line.md](doc/log-line.md)
