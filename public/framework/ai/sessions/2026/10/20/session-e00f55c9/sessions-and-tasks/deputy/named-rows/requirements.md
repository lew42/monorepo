# Sessions page: a named agent's row opens a working page

Budget: $3. Load the `minion` skill first.

## Why

On the sessions page (`/framework/ai/sessions/`), a row for a named agent (for example `reviewer-session-report`, or any `reviewer-*` or `minion-*` agent) links to `/framework/ai/sessions/<name>/`. That page breaks:
- it asks for `/framework/ai/sessions/<name>/prompts.jsonl`, which is a 404;
- it asks for `/ai-logs/<name>` and `/ai-logs/<name>/session`, which answer 400, because the transcript route wants a session uuid.

The deputy saw this on the main site on 2026-10-24. The same rows also fail every merge smoke test seeded at `/framework/ai/sessions/`. The todo line is in [ai/todo.md](/framework/ai/todo.md) ("A named agent's row on the sessions page").

## What to do

1. Reproduce it on current `michael/dev`, headless.
2. Find where a named row's link and its page's loads come from: `AISessionDetail.load_row` (`public/framework/ai/AISession/AISessionDetail.js:356`), `log_urls()`, and the transcript and prompts loads.
3. Make the page work. Either resolve the name to its session uuid and dated folder before loading anything (the agent registry and `AISession.locate()` know both), or link the row to its dated folder. Pick one, and log a `decision` line naming the alternative.
4. Nothing on the page may ask for a file that is not there; `names(dir)` in `core/Router/listing.js` says what a folder holds.

## Check it

- Before and after: the 404 and 400 counts on `/framework/ai/sessions/reviewer-session-report/` and on one `minion-*` row, loaded headless.
- One shot at 1920 of the fixed page, in `named-rows/shots/`.
- `node Server/smoke.mjs <your worktree> /framework/ai/sessions/` shows no FAIL caused by a named row.

## Deliverable

- A branch from the pool worktree Servex gives you (`take_worktree`). Commit at every working step.
- One `show:` line in this folder's `session.jsonl`: the before and after counts and the shot.
- Then `ready: <branch> <sha> <one line>`, and stop.

## Fences

- **Yours:** `public/framework/ai/AISession/*` (except `SessionOverview.*`, `SessionStats.js` and `SessionTaskRow.js`, which just landed), plus the sessions page's row link code if it lives elsewhere.
- **Not yours:** `core/Page/*` and `core/Router/*`, which belong to mastermind-page. Send it a message if you need a change there.

## Never

Never kill or restart the dev server. Never drive the owner's tabs. Never `git stash`. Run `node --check` on every file you touch. Findings go in your `session.jsonl` as `log` lines.
