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

**`node Server/ModuleLog.mjs <path> [--by day|week|month]`** prints one folder's work log: tasks graded landed-and-committed, committed-never-closed, never-started or landed-no-path-commit, plus commits that belong to no task. It joins `SessionIndex`, `LandingCheck` and `git log`, beside `PastWork.mjs` (topic search); see the `past-work` skill.

**`node Server/health.mjs`** is a separate, optional "is it working" watcher — not a
plugin, no port of its own, safe to run beside any of these servers or none: it
headless-checks a page after the file that could have broken it changes, and tells
the editing agent at its very next write. `HEALTH_BASE` picks which server to load
pages against (default `http://localhost:8123`, the mastermind's). Full story:
[`public/framework/ai/health/readme.md`](/framework/ai/health/).

**`node Server/layout-check.mjs <url...>`** shoots pages at four widths by default (`--widths` picks others) and flags wasted space; **`Server/on-landing.mjs`** runs it by itself on every task landing (the ledger hook spawns it) and logs the result to the task, and flagged pages to `servex-mastermind`.

**`node Server/merge.mjs <worktree>`** now finds the pages a branch changed by itself (every `page.js`/`page.jsonl` in its diff, mapped to its site url) and hands them to `Server/smoke.mjs`, which follows every same-origin link it finds one level deep instead of only loading the pages it was told about — the gap that let 7 broken concept-tile links land unnoticed; a NEW page in the diff also gets a 1920 screenshot into `.merge-shots/`. [`public/framework/ai/sessions/2026/09/28/b784a919-ce8c-4785-90d5-92b615b91d7c/smoke-links/`](/framework/ai2/2026-09-28/smoke-links/).

**`--quick`** is `merge.mjs`'s fast path for a one-line voice fix: no reviewer agent, allowed only for ≤20 changed lines in one module. It takes the one screenshot `review.mjs`'s `widthsFor` says the change needs (not always four), then merges exactly as above. Its last line of stdout is one JSON object: `merged`, `shot`, `width`, `ms`. Detail and the exit codes: the file's own header comment, and [`doc/review.md`](./doc/review.md#which-widths).

**`node Server/window-lint.mjs`** answers one question about the whole repo: **which
`spawn`/`exec`/`execFile`/`fork`/`Start-Process` call is missing `windowsHide: true` (or
`-WindowStyle Hidden`)**, the flag that stops a process popping a visible console in front of
the owner. The same per-call check runs on every Edit/Write, live, in
`.claude/hooks/syntax-guard.mjs`'s `hidden_guard`; this is the repo-wide sweep version. It's
advisory (never throws, always exits 0) and can flag a same-named method definition or a
prose mention as a false positive — read the hit before editing anything.
[`public/framework/ai/sessions/2026/09/28/b42621ed-33f7-41f0-b19b-12c679306b9a/hidden-windows/`](/framework/ai2/2026-09-28/hidden-windows/).
Same idea, one launcher: every script starts Chromium through
[`Server/Browser.mjs`](./Browser.mjs), never `chromium.launch(` on its own — window-lint and
syntax-guard's `browser_guard` both flag a stray one too. `node Server/window-watch.mjs` is the live catcher —
an always-on `EnumWindows` probe that logs any NEW visible console or browser window (scoped so
the owner's own Chrome never counts). [`doc/browser.md`](./doc/browser.md).

**`node Server/padding-check.mjs <url>`** answers one question about one page, and
exits non-zero when the answer is no: **does any text on it sit at 0 from an edge** —
the nav rail, the window, the ToC column, or the border of any box that paints a
ground of its own. The owner made that a law of the whole system on 2026-09-22.
Four widths by default (`--width 3440` for one; `--base` picks the server), because
the bug that prompted it only appears above 1312px and `health.mjs` was looking at
1280 alone. `health.mjs` now imports the same measurement, so the watcher checks it
too — one definition, three callers. The before/after over 107 pages:
[`/framework/ai/sessions/2026/09/22/session-2e26b182/padding-law/`](/framework/ai/sessions/2026/09/22/session-2e26b182/padding-law/).

**`Server/on-landing.mjs`** runs automatically the first time the ledger hook sees a task with
`landed_at`: text-check (walls of text), layout-check and padding-check on the pages the landing
names, and — new in the task-loop work — **`Server/doc-check.mjs`**, which checks every module
the task touched (the nearest directory at or above a touched file that has its own `page.js`,
skipping a task's own `ai/**` notebook) for a `readme.md`, a `doc/` dir, and readme links that
actually resolve. Each check appends one line to the task's own log; a dirty doc-check also
posts one nag line on the task's card (Servex's `card_reply`, over its `/mcp` door) so the owner
sees it without opening the log. ⚠ It is a plain file/dir existence check, so a module whose
`page.js` routes some of its readme's links to *virtual* children (declared in code, no matching
directory on disk) can flag those as dead when the site actually serves them fine — it does not
understand the router, on purpose, to stay this simple.
[`public/framework/ai/sessions/2026/09/28/task-loop/task-loop/landing-checks/`](/framework/ai2/2026-09-28/task-loop/landing-checks/).

**`Server/owner-check.mjs`** (2026-10-01) is the last check on-landing.mjs runs: does the landed
task do what the OWNER actually asked, item by item — not just match its own requirements.md? It
finds the owner's dictated words (an `owner-words.md`, a parent task's, or one quoted in the
brief), splits them into items, and asks one fresh Sonnet reviewer to verdict each one done /
partly / missing against the real files. Detail: [`doc/on-landing.md`](./doc/on-landing.md).

**Landing needs an outcome.** The ledger hook (`.claude/hooks/ledger.mjs`) refuses a `landed_at`
with an empty or missing `outcome` — it blocks the stop, every time, and logs the refusal to the
task once (not on every retry), so `landed_at` alone can never read as done.

**node Server/review.mjs <taskdir> [<worktree>]** gets a fresh agent — one that never saw the
author's conversation — to read the brief and the diff and say pass or fix, before `merge.mjs`
will take a `light` or `full` branch. Full story: [`doc/review.md`](./doc/review.md).

**`node Server/Audit.mjs <taskdir...> [--out <path.json>]`** (2026-10-02) is law 7 for a task
audit: given several `audit.jsonl` files (one line per model that graded a landed task on
complete/obedience/utility, written through `.claude/hooks/append.mjs` against the schema in
`jsonl-schema.mjs`), it COMPUTES the consensus — never an AI writing it from memory. Per task:
real objective checks (do the files it touched exist, do they parse, do its URLs answer 200),
the median and agreement of every score, the union of `missing` items 2+ auditors named, a
`value = quality ÷ cost` number from the task's own real spend, a `FAILED` flag when the
complete/obedience median hits -2 or worse, and each model's distance from the median (the
model-ladder ranking). Writes one `consensus.json` per task. Dedupes a model to one vote per
task — a dequeued minion can still land its turn moments later, producing a duplicate. Built
for, and proven on, the first pilot: [`public/framework/ai/sessions/2026/10/03/task-audit/task-audit/report.md`](/framework/ai/sessions/2026/10/03/task-audit/task-audit/).

**`Server/AskEach.mjs`'s `askOnce()`** now takes an optional `env` (and `disallowedTools`) —
the same OpenRouter env swap `Agents.js` uses (`ext/openrouter/provider.js`'s `env_for`) — so a
script can call a cheap OpenRouter model directly, one Q&A turn at a time, without spawning a
minion or waiting on a pool worktree slot. ⚠ The SDK's own `result.total_cost_usd` prices an
OpenRouter turn against ANTHROPIC's table under the wrong model name — wildly wrong for a cheap
**`Server/Crawl.mjs`** (2026-10-06) is the **nightly full site crawler** for every page under `/framework/` at viewport 1920: follows all same-site links, traps HTTP 404s, page load errors, and console errors, captures 1920 screenshots into `<outDir>/shots/`, and runs `Server/padding-check.mjs`'s padding measurement on every loaded page. Writes `crawl.jsonl` and `summary.md`. Machine time only, zero tokens. Only discovered failures are posted to `public/framework/ai/todo.md`. Builds on `smoke.mjs` and `padding-check.mjs`.

**`Server/Council.mjs`** (2026-10-06) is the **Feedback Council collector and runner**: gathers the owner's verbatim words since the last run from `.claude/prompts/<day>.jsonl` and AI 2 card `page.jsonl` files (filtering out Servex agent sessions via live `/api/agents`, `lifecycle.jsonl`, and task logs) into `words.jsonl`. Runs detached on task landings via `node Server/Council.mjs maybe` (`windowsHide: true`), checking the 10-landings / 24-hour rhythm. Dispatches the council mastermind over Servex MCP, and merges checker vote JSONs into `public/framework/ai/council/asks.jsonl` (`node Server/Council.mjs merge <run-dir>`). Off switch: `public/framework/ai/council/off` or `COUNCIL=off`.

## Moved to a doc (verbatim)

The supervisor, watching `public/`, holding reloads, what a browser can ask, the loopback-only socket, and the MCP tools: [doc/readme-sections-2026-10-13.md](doc/readme-sections-2026-10-13.md).

## More

[`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`RefineQueue.mjs`](../public/framework/ext/Refine/doc/refine-queue.md) — refines the owner's past prompts, one Haiku call per prompt, N at once, onto each session page's Coverage tab (`public/framework/ext/Refine/doc/refine-queue.md`)

- **Scripts census** (what every script under `Server/`, `Servex/`, `.claude/hooks/` is, who uses it, which are stale): [doc/scripts.md](doc/scripts.md)
