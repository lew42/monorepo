# AITask — the API (moved from the readme)

<!-- moved verbatim from readme.md lines 4-72, 2026-10-12 readme audit -->
```js framework/ai/<date>/<slug>/page.js
import { AITask, md } from "/app.js";

export default new AITask({
    meta: import.meta,
    title: "Panel system",
    icon: "receipt_long",
    extra(){ md("what this one uniquely needs to say"); },
});
```
A task's page is up to five tabs — **Asks · Requirements · Decisions · Report · Session**: `report()` is the outline — `asks` builds Asks; `cost`, `outcome`, `links`, `status`, `checklist`, `extra`, `shots`, `figures` build Report; `chat` + `log` build Session; `head` builds Requirements; `decisions` builds Decisions, and only when the log carries any — override any one. **Asks is first and opens by default whenever the log carries any** — what the owner asked for outranks what a session did about it; without asks, Report opens. A task dir is never declared in `children:` either way: no `page.js` of its own gets this template through its day's `route()` fallback, and one WITH its own `page.js` is found the same way, ahead of the fallback.

To show a task's page inside another page — AI 2's card column does — draw it into whatever box you are building, with the same class and no copy of its view:

```js
div.c("my-box", () => { AITask.into("/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-groups/", { listing: ["task.jsonl"] }); });
```

`listing` is optional: the task dir's file names, when you have them, so a missing `requirements.md` is never fetched.

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
- **Nested tasks** read `parent_task` and `after` from a task's first line; older logs get their parent from the folder or the inbox instead, so a wrong parent there is a guess, not a bug in the view — [doc/nested.md](./doc/nested.md).
- **Cost is dollars from one `cost_usd` line, or "not tracked" — never $0.** `Server/task-cost.mjs` writes it (the task's Servex agent plus every agent under it); a tab or CLI session has none. Totals skip a task whose `cost.parent_task` is in the same total — [doc/cost.md](./doc/cost.md).
- **A day's cost is two currencies — Claude $ and real $ — plus which modules it touched.** `Server/day-spend.mjs <date>` writes `public/framework/ai/<date>/spend.json`; `module-spend.js` draws it on the day page and routes a click into a module (`/framework/ai/<date>/module/<slug>/`) — [doc/cost.md](./doc/cost.md).
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
