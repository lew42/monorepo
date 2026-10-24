# AITask — the page template for one session task, and the day and board views of the AI log

`class AITask extends Page` (`AITask.js`) renders one task folder as a page: its `task.jsonl` through `TaskJSONL` (`ext/JSONL`), a Session tab (the transcript as a chat), Asks, Decisions and Tree tabs, cost and progress. The other files are the views the AI front page is made of. It is the viewer for session-store tasks; module tasks use `TaskPage` in [core/Task](/framework/core/Task/) (two viewers, not merged). Counting tasks is not done here: [ai/tasks](/framework/ai/tasks/).

## Files by job

| Job | Files (all in this folder) |
|---|---|
| The task page | `AITask.js` (the class), `TaskViews.js` (tab list), `conversation.js` (chat), `asks.js`, `decisions.js` (+ `decisions.mjs`, a CLI that closes decisions), `plan.js`, `shots.js`, `replay.js`, `message.js`, `stats.js`, `cost.js`, `AICost.js`, `card.js`, `listing.js` |
| The tree | `tree.js`, `nested.js`, `tree/` |
| The day and the board | `dashboard.js` (`dashboard` is now one line that draws [`AIDay`](../AIDay/AIDay.js); `rail`, `log_board`, `timeline`, `monthPage` (day links only), `warm`), `board.js`, `highlights.js` (the front wall), `needs.js`, `rank.js`, `effort.js`, `usage.js`, `compose.js` (`module-spend.js` and `day-prompts.js` were removed 2026-10-20: they read the retired `ai/<date>/` layout) |
| This module's own page | `page.js` (a `Doc` page, then `new AITask({…})` samples), `ai.css`, `feed.css`, `nested.css` |

## Where the data comes from

- The task: its `task.jsonl` (written by `Agents.open_task`, `append.mjs`; see [ai/sessions](/framework/ai/sessions/)). `session_id` on line 1 is the field that matters: without it there is no transcript tab. A running task has `requested_at`; `landed_at` wins.
- Which files a task folder has: `AITask.has(url)` asks the folder's listing ([`core/Router/listing.js`](/framework/core/Router/listing.js), one request per folder to the dev server's `/api/folder-names`), so a missing `session.jsonl`, `task.jsonl`, `page.js` or `requirements.md` is never a 404. Off the dev server there is no listing and `has()` falls back to a HEAD probe. `session()` uses it to open `session.jsonl` when the folder has one, else `task.jsonl` (the two names are mixed in the store).
- The transcript: streamed from `~/.claude/projects/` on the dev server only; off localhost the Session tab says "unavailable".
- The day pages: `/framework/ai/` routes (`ai/page.js`) draw a day with `AIDay/` (the `tasks` query source over the session store); `dashboard.js` still serves the rail and log boards.
- The Report tab (`AICost.report`): it asks Servex's item tool (`POST /api/item`, the `summary` query) for the session's real cost, its child sessions and its task counts, so the page computes and copies no number itself. On a static copy or a worktree preview there is no Servex, and the tab says so in words.
- Highlights: an `assign` line carrying `highlight:{icon,title,url}` in a `task.jsonl` puts a task on the front wall ([doc/highlights.md](doc/highlights.md)).

## Used by

`ai/page.js` (the front, day, month pages), `ai/tasks/page.js` (a `2026~…` url opens an `AITask`), every session task's own page.

## More

[doc/architecture.md](doc/architecture.md) · [doc/api.md](doc/api.md) · [doc/views.md](doc/views.md) · [doc/manifest.md](doc/manifest.md) (the `task.jsonl` fields) · [doc/highlights.md](doc/highlights.md) · [doc/ranking.md](doc/ranking.md) · [doc/decisions.md](doc/decisions.md) (gotchas: timestamps mix `Z` and `-05:00`, order by `Date.parse`) · the readme before this rewrite, with its gotcha list: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).
