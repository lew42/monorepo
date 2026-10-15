# AITask — the AI working log, rendered: one task's page, a day's dashboard, the highlights wall the front opens with, and the board over every task

## Use
- Moved verbatim to [doc/api.md](./doc/api.md): the API.
- The Session tab is a **chat**: talk in the stream, every tool call folded to one line, a rail of the owner's prompts beside it. `?m=<uuid>` opens it at one message — [doc/file/conversation.js.md](./doc/file/conversation.js.md).
- The prompts rail names itself, times every row and hides itself below two prompts — and `el.hidden` needed a `[hidden]` rule of its own, because `display: flex` beats the browser's — [doc/file/conversation.js.md](./doc/file/conversation.js.md).
- A task page sits on the `wide` track, and `ext/tabs` sets `--measure: none` inside a `.tab-panel` — so a prose cap read from the token in there silently does nothing until `ai.css` hands the measure back — [doc/file/ai.css.md](./doc/file/ai.css.md).
- The front (`/framework/ai/`) is the **highlights wall**; every task of every day is [`/framework/ai/log/`](/framework/ai/log/), forty at a time. `url` is THE THING, never the task page — [doc/highlights.md](./doc/highlights.md).
- A task holding only a legacy `session.json` cannot take a highlight: creating a `task.jsonl` beside it HIDES the session snapshot, outcome and all — [doc/highlights.md](./doc/highlights.md).
- A `.md` deliverable beside the task dir is a page: a link to `audit.md` in `outcome` or `requirements.md` opens at `audit/`, rendered. The `links:` pills are plain anchors, not markdown — write those urls as the route (`…/audit/`) yourself. [`/framework/core/Page/doc/declaring.md`](/framework/core/Page/doc/declaring.md)
- Pace, not percentage: the usage bar is spend and the ▼ is the clock — on pace while used% ≤ elapsed%, over once the fill passes the marker — [doc/pace.md](./doc/pace.md).
- `session_id` is the one `task.jsonl` field that matters; without it there is no session log — [doc/manifest.md](./doc/manifest.md).
- **A task's live log — the one an agent should `follow()` — is its `task.jsonl`, never a `page.jsonl` in the same folder.** `task.jsonl` is what a minion actually writes to while it works (`assign`, `log`, `decision`, `step`) and what a fresh agent resumes from; `page.jsonl`, where one exists, is the ai2 dashboard card's own log for the owner and mostly just points back at `task.jsonl` with a `{"file":"task.jsonl"}` line. Decided 2026-09-29: the `decision` line in `ai/sessions/2026/09/30/voice-sessions/voice-sessions/c-roles/task.jsonl`.
- A task runs only once it carries `requested_at`, and `landed_at` wins — a landing line lost to a bad escape leaves it rendering as running, and "N unparsed lines" is the only symptom — [doc/decisions.md](./doc/decisions.md).
- Log timestamps mix `Z` and `-05:00`: order by `Date.parse`, never as text, and build a day from its parts (`new Date("2026-08-15")` is UTC midnight) — [doc/decisions.md](./doc/decisions.md).
- The card is a container query, and `ai.css`'s mobile rules needed floors (`minmax(0, 1fr)`, a scoped rail height) before phones could scroll — [doc/decisions.md](./doc/decisions.md).
- The chat forks on its first message (`chat_session_id`), and transcripts stream from `~/.claude/projects/` on the dev server only — off localhost the replay says "unavailable" — [doc/decisions.md](./doc/decisions.md).
- Starting a task from the board is still `framework/ai/`-only; the `<page>/ai/<slug>/` move is half-landed — [doc/starting-work.md](./doc/starting-work.md).
- `has_page_js()`'s cache is `undefined` until a day's `dashboard()` has warmed it — a cold direct link to a task with its own `page.js` gets the generic viewer once, not a break — [doc/decisions.md](./doc/decisions.md).
- A day page scrolls in `.pages`, like every other page: `ai.css` releases the catalog's bounded split once a day or task is routed (the rail is already hidden by then). Release it and the region needs `flex: 1 1 auto`, or it collapses to 0 below 64em — [doc/decisions.md](./doc/decisions.md).

## More

- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why
- [`doc/asks-notes.md`](./doc/asks-notes.md) — asks tab design and layout
- [Overview](/framework/ai/AITask/) · [Task tree](/framework/ai/AITask/tree/) a day's tasks as a tree (also the Tree tab on a task page: [`doc/views.md`](./doc/views.md) lists every view and who uses it), with [`doc/nested.md`](./doc/nested.md) the model · [`doc/asks.md`](./doc/asks.md) the Asks tab and the `ask` verb · [`doc/decisions-tab.md`](./doc/decisions-tab.md) the Decisions tab, the verdict seam and the CLI that files an Improve back into its skill · [`doc/decisions.md`](./doc/decisions.md) — the record: the time-spine board, the file table, every trap in full, open items, where replays come from
- [`doc/ranking.md`](./doc/ranking.md) the Needs-you strip, the `rank` verb, what threaded means and the pairwise alternative · [`doc/highlights.md`](./doc/highlights.md) the front page's wall · [`doc/manifest.md`](./doc/manifest.md) the schema · [`doc/effort.md`](./doc/effort.md) the `group` tag · [`doc/pace.md`](./doc/pace.md) the usage rail · [`doc/template.md`](./doc/template.md) `report()` and its override · [`doc/starting-work.md`](./doc/starting-work.md) `rpc:start` · [`doc/waves.md`](./doc/waves.md) how it got here
- Files that matter: `AITask.js` (the task template), `asks.js` (the Asks tab), `decisions.js` (the Decisions tab), `decisions.mjs` (the CLI that closes the loop), `conversation.js` (the transcript as a chat), `dashboard.js` (rail, day board, the `day.jsonl` timeline fold), `card.js` (one task row), `highlights.js` (the front page's wall), `needs.js` (the owner-items strip), `rank.js` (the grip and the `rank` line), `stats.js` (pure derivations), `cost.js` (one task's dollars), `module-spend.js` (a day's two-currency totals + module breakdown, fed by `Server/DaySpend.mjs`)

- Notes: [doc/AITask-notes.md](doc/AITask-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/dashboard-notes.md](doc/dashboard-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/day-prompts-notes.md](doc/day-prompts-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/rank-notes.md](doc/rank-notes.md) — history and lessons moved out of the code comments.
