# AITask — the AI working log, rendered: one task's page, a day's dashboard, and the board over every task, for the owner and the agents that log to it

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
A task's page is three tabs — **Requirements · Report · Session**, Report open by default: `report()` is the outline — `outcome`, `links`, `status`, `checklist`, `extra`, `shots`, `figures` build Report; `chat` + `log` build Session; `head` builds Requirements — override any one. A task dir is never declared in `children:` either way: no `page.js` of its own gets this template through its day's `route()` fallback, and one WITH its own `page.js` is found the same way, ahead of the fallback.

## Watch out
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
- [Overview](/framework/ext/AITask/) · [`doc/decisions.md`](./doc/decisions.md) — the record: the time-spine board, the file table, every trap in full, open items, where replays come from
- [`doc/manifest.md`](./doc/manifest.md) the schema · [`doc/effort.md`](./doc/effort.md) the `group` tag · [`doc/pace.md`](./doc/pace.md) the usage rail · [`doc/template.md`](./doc/template.md) `report()` and its override · [`doc/starting-work.md`](./doc/starting-work.md) `rpc:start` · [`doc/waves.md`](./doc/waves.md) how it got here
- Files that matter: `AITask.js` (the task template), `dashboard.js` (rail, day board, the `day.jsonl` timeline fold), `card.js` (one task row), `stats.js` (pure derivations)
