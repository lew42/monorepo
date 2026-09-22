# AITask — the AI working log, rendered: one task's page, a day's dashboard, the highlights wall the front opens with, and the board over every task

## Use
```js framework/ai/<date>/<slug>/page.js
import { AITask, md } from "/app.js";

export default new AITask({
    meta: import.meta,
    title: "Panel system",
    icon: "receipt_long",
    extra(){ md("what this one uniquely needs to say"); },
});
```
A task's page is up to five tabs — **Asks · Requirements · Decisions · Report · Session**: `report()` is the outline — `asks` builds Asks; `outcome`, `links`, `status`, `checklist`, `extra`, `shots`, `figures` build Report; `chat` + `log` build Session; `head` builds Requirements; `decisions` builds Decisions, and only when the log carries any — override any one. **Asks is first and opens by default whenever the log carries any** — what the owner asked for outranks what a session did about it; without asks, Report opens. A task dir is never declared in `children:` either way: no `page.js` of its own gets this template through its day's `route()` fallback, and one WITH its own `page.js` is found the same way, ahead of the fallback.

A landing that produced something worth going back to adds one more line, and the front page grows a card for it:

```json ai/<date>/<slug>/task.jsonl
{"assign": {"highlight": {"icon": "explore", "title": "The layouts encyclopedia", "line": "Thirteen named layouts, defined, drawn and tagged to point at.", "url": "/layouts/"}}}
```

A session writes down what the owner asked for as `ask` lines, and they become that first tab — one preview card each, linked back to the sentence they were said in:

```json ai/<date>/<slug>/task.jsonl
{"ask": {"id": "session-as-chat", "at": "…", "summary": "one plain sentence",
  "quote": "what they actually said, verbatim", "prompt": "<uuid of their message>",
  "status": "open|building|landed", "tasks": ["<slug>"]}}
```

A worker writes down the choices it made as `decision` lines, and the owner presses Approve or Improve on each — that is the Decisions tab, and an Improve comes back as a line in the skill's `improvements.md`:

```json ai/<date>/<slug>/task.jsonl
{"decision": {"id": "option-cards", "at": "…", "about": "the question, one line",
  "options": [{"id": "boxes", "say": "one line", "why": "one line"},
              {"id": "bullets", "say": "one line", "why": "one line"}],
  "chose": "boxes", "because": "one sentence",
  "rule": "layout#boxes-padding-and-contrast", "status": "open"}}
```

Anything only the owner can do says so, and says how long it will take — those lines are the **Needs you** strip at the top of the board and of that task's Asks tab. Any of these lists can then be dragged into the order that matters, and the order is one more line:

```json ai/<date>/<slug>/task.jsonl
{"ask": {"id": "sqlite-status", "needs": {"owner": "Cloudflare login and wrangler d1 create", "minutes": 5}}}
{"rank": {"list": "asks", "at": "…", "order": ["owner-items-first", "threaded-lists", "rank-the-asks"]}}
```

## Watch out
- The Asks tab IS the requirements report — a card's own line is its status and `n of m tasks landed`, counted from the serving tasks' `landed_at`, and the two can disagree on purpose — [doc/asks.md](./doc/asks.md).
- **An ask's `conclusion` outranks everything else as the card's title** — the owner's own words, "lead with the conclusion as the title; if I'm curious I drill down and see what I asked" — and `summary` moves down to the sheet under "you asked" once it does. `minutes` is a second, separate field from `needs.minutes`: how long the CARD takes to read, not how long the owner's own errand takes — [doc/asks.md](./doc/asks.md).
- The Asks wall is grouped by an ask's optional `topic`, in the order the topics first appear; each band is its own grid, so each has its own detail sheet and closing has to sweep all of them — [doc/asks.md](./doc/asks.md).
- A press on **Approve / Improve** appends a `verdict` line to that task's own log and never edits the decision; the row updates over the socket with no reload. Both those buttons and the rank grips follow the site's one edit switch (`ext/Ask/edit.js`'s `edit()`) — not drawn off the dev server, or with the dev rail's "edit" checkbox off — [doc/decisions-tab.md](./doc/decisions-tab.md).
- The **rule chip is not a link**: skills live in `.claude/skills/`, outside `public/`, and nothing serves them — which is also why filing an Improve is a CLI, `decisions.mjs`, run at harvest — [doc/decisions-tab.md](./doc/decisions-tab.md).
- A tab's panel is not built until it is first selected, so the live-stream callback is guarded **per panel** (`streamed()`) — the old `this.$live &&` guard meant a task opening on Asks streamed nothing at all — [doc/decisions-tab.md](./doc/decisions-tab.md).
- The **Needs you** strip's off switch is `needs.done`, never the ask's own `status` — a landed ask can still be waiting on a login, and that is exactly the item you must not drop — [doc/ranking.md](./doc/ranking.md).
- **Ranking is a grip, never the whole card**: both an ask card and a decision row open on a click, and `ext/Draggable` starts a drag on the first `pointerdown` — [doc/ranking.md](./doc/ranking.md).
- A drop writes the **whole** list's order, band after band, into one `rank` line; each topic band is its own drop zone, because dragging across bands would be a change of topic, not an order — [doc/ranking.md](./doc/ranking.md).
- **The bands themselves rank too** — `rank: {list: "topics"}` — and a band can carry a **`fold`**, tucking its tangential tail under "N more" without nesting the hidden cards (they stay plain grid items, CSS-hidden, so the grip on every one keeps working) — [doc/ranking.md](./doc/ranking.md).
- The Asks tab redraws on a streamed append **only when something it shows changed** (the ranks, or the owner items) — rebuilding the wall re-fetches every serving manifest and closes the open sheet — [doc/ranking.md](./doc/ranking.md).
- The Asks tab is an **iceberg**: the card, then a sheet that opens under that card's own row, then a fold per task for the full report. Level 2 was nine screens before it was three levels — [doc/asks.md](./doc/asks.md).
- A card's picture is a logged `shot`, else the first image in a serving task's outcome — no task on the run it was built against had logged a single `shot`, so the whole wall was text — [doc/asks.md](./doc/asks.md).
- A task's `links` are relative to ITS OWN dir, so `card.js` resolves them against `TaskJSONL.url` — the Asks tab draws one task's links inside another task's page — [doc/asks.md](./doc/asks.md).
- The Session tab is a **chat**: talk in the stream, every tool call folded to one line, a rail of the owner's prompts beside it. `?m=<uuid>` opens it at one message — [doc/file/conversation.js.md](./doc/file/conversation.js.md).
- The prompts rail names itself, times every row and hides itself below two prompts — and `el.hidden` needed a `[hidden]` rule of its own, because `display: flex` beats the browser's — [doc/file/conversation.js.md](./doc/file/conversation.js.md).
- A task page sits on the `wide` track, and `ext/tabs` sets `--measure: none` inside a `.tab-panel` — so a prose cap read from the token in there silently does nothing until `ai.css` hands the measure back — [doc/file/ai.css.md](./doc/file/ai.css.md).
- The front (`/framework/ai/`) is the **highlights wall**; every task of every day is [`/framework/ai/log/`](/framework/ai/log/), forty at a time. `url` is THE THING, never the task page — [doc/highlights.md](./doc/highlights.md).
- A task holding only a legacy `session.json` cannot take a highlight: creating a `task.jsonl` beside it HIDES the session snapshot, outcome and all — [doc/highlights.md](./doc/highlights.md).
- A `.md` deliverable beside the task dir is a page: a link to `audit.md` in `outcome` or `requirements.md` opens at `audit/`, rendered. The `links:` pills are plain anchors, not markdown — write those urls as the route (`…/audit/`) yourself. [`/framework/core/Page/doc/declaring.md`](/framework/core/Page/doc/declaring.md)
- Pace, not percentage: the usage bar is spend and the ▼ is the clock — on pace while used% ≤ elapsed%, over once the fill passes the marker — [doc/pace.md](./doc/pace.md).
- `session_id` is the one `task.jsonl` field that matters; without it there is no session log — [doc/manifest.md](./doc/manifest.md).
- A task runs only once it carries `requested_at`, and `landed_at` wins — a landing line lost to a bad escape leaves it rendering as running, and "N unparsed lines" is the only symptom — [doc/decisions.md](./doc/decisions.md).
- Log timestamps mix `Z` and `-05:00`: order by `Date.parse`, never as text, and build a day from its parts (`new Date("2026-08-15")` is UTC midnight) — [doc/decisions.md](./doc/decisions.md).
- The card is a container query, and `ai.css`'s mobile rules needed floors (`minmax(0, 1fr)`, a scoped rail height) before phones could scroll — [doc/decisions.md](./doc/decisions.md).
- The chat forks on its first message (`chat_session_id`), and transcripts stream from `~/.claude/projects/` on the dev server only — off localhost the replay says "unavailable" — [doc/decisions.md](./doc/decisions.md).
- Starting a task from the board is still `framework/ai/`-only; the `<page>/ai/<slug>/` move is half-landed — [doc/starting-work.md](./doc/starting-work.md).
- `has_page_js()`'s cache is `undefined` until a day's `dashboard()` has warmed it — a cold direct link to a task with its own `page.js` gets the generic viewer once, not a break — [doc/decisions.md](./doc/decisions.md).
- A day page scrolls in `.pages`, like every other page: `ai.css` releases the catalog's bounded split once a day or task is routed (the rail is already hidden by then). Release it and the region needs `flex: 1 1 auto`, or it collapses to 0 below 64em — [doc/decisions.md](./doc/decisions.md).

## More
- [Overview](/framework/ext/AITask/) · [`doc/asks.md`](./doc/asks.md) the Asks tab and the `ask` verb · [`doc/decisions-tab.md`](./doc/decisions-tab.md) the Decisions tab, the verdict seam and the CLI that files an Improve back into its skill · [`doc/decisions.md`](./doc/decisions.md) — the record: the time-spine board, the file table, every trap in full, open items, where replays come from
- [`doc/ranking.md`](./doc/ranking.md) the Needs-you strip, the `rank` verb, what threaded means and the pairwise alternative · [`doc/highlights.md`](./doc/highlights.md) the front page's wall · [`doc/manifest.md`](./doc/manifest.md) the schema · [`doc/effort.md`](./doc/effort.md) the `group` tag · [`doc/pace.md`](./doc/pace.md) the usage rail · [`doc/template.md`](./doc/template.md) `report()` and its override · [`doc/starting-work.md`](./doc/starting-work.md) `rpc:start` · [`doc/waves.md`](./doc/waves.md) how it got here
- Files that matter: `AITask.js` (the task template), `asks.js` (the Asks tab), `decisions.js` (the Decisions tab), `decisions.mjs` (the CLI that closes the loop), `conversation.js` (the transcript as a chat), `dashboard.js` (rail, day board, the `day.jsonl` timeline fold), `card.js` (one task row), `highlights.js` (the front page's wall), `needs.js` (the owner-items strip), `rank.js` (the grip and the `rank` line), `stats.js` (pure derivations)
