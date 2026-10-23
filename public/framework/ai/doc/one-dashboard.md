# One AI dashboard: a proposal to agree on before anything is built

**What you said (2026-10-17, 22:45):** no new pages unless we agree on their structure; not another AI dashboard; one dashboard that just works, with filters to find exactly what you are looking for: recents, olds, past work, new work, live cards for real-time collaboration. Then: the data structure matters, not the UI. The data structure now exists: [one-state.md](one-state.md) (`Server/AIIndex.mjs`, `ai/index.json`, self-checked, 46 = 46 on 10-17). This doc is the UI half, as a proposal. Nothing here is built.

## What exists today (the pages that each show a slice)

| Page | Shows | Fed by |
|---|---|---|
| `/framework/ai/` (Inbox) | cards, notes, waiting-on-you, by importance and recency | `cards.jsonl`, the owner notes |
| `/framework/ai/tasks/` | in flight, queued, landed (7 days) | `index.jsonl` from `State` |
| `/tasks/` | every task in the module homes, by state | `/tasks/task.jsonl` index |
| `/live/` | pointer cards for real-time work | the logs |
| `/framework/ai/sessions/` | every session, cost, model | `session.jsonl` files |
| `/framework/ai/asks/undone/` | asks never built, by module | `undone.json` |
| `/framework/ai/log/`, Dashboard, System, Tests tabs | older views | their own readers |

Seven surfaces, each with its own reader until tonight. That is why none of them "just worked".

## The proposal: the Inbox becomes the one dashboard, everything else is a filter

One page, `/framework/ai/`, one list, one detail pane (the `Browse` shape the Inbox and the tasks page already use). One row type for everything: a task, a card, a session, an ask, a live card, each with `{kind, title, state, when, who, home, url}`, all read from `ai/index.json` (tasks, sessions, agents) plus the cards and asks folded into the same structure by `State`.

Filter chips across the top, several at once, every combination a URL:

- **Live**: agents working now, live cards, anything that changed in the last 10 minutes; updates as a stream.
- **New**: queued and idle tasks, today's cards and asks nobody picked up.
- **Recent**: landed today, yesterday, this week.
- **Older**: landed by week and month, the past-work search box (`PastWork`) in the same list.
- **Needs you**: the owner notes waiting, asks marked needs-owner.
- **Kind**: task, card, session, ask. **Home**: a module. **Who**: an agent or a session.

What happens to the others: `/framework/ai/tasks/`, `/tasks/`, `/live/` and `/asks/undone/` keep their URLs and become saved filters of the one list (a redirect with the chips preset), so nothing you bookmarked dies and no second reader survives. Sessions keep their grid, reached from a row.

## Alternatives, and why not

- **Keep the seven pages and add links between them.** Cheapest, but it is what we have, and you have said for months it does not work.
- **A new page beside the seven.** Rejected: an eighth dashboard.

## What agreeing means

Yes to the shape above, or amend it (which chips, which page is the one). Then the build is three steps, each small: (1) `State` folds cards and asks into the same structure with the same self-check; (2) the Inbox list reads `index.json` and gets the chips; (3) the other pages become saved filters. No step adds a page.

## Built

**Built: steps 1, 2 and 3 (2026-10-19, last code commit 38628861d).** `State` folds cards and asks, each counted two ways ([Server/doc/ai-index.md](/Server/doc/ai-index.md)); the Inbox list in `/framework/ai/` reads `index.json` through the one stream, with the chips as urls (`?live&new`, `?recent=today`, `?older=month`, `?needs`, `kind=task,card`) and the red check line under them. A landing reaches the list in under a second with no agent writing anything. Step 3: `/framework/ai/tasks/` forwards to the Inbox with its chips on; `/tasks/` no longer forwards (the bare `/framework/ai/` is the sessions dashboard, which ignores the chips) and draws `core/Task/TasksPage.js` again, 2026-10-23 (`DashChips.SAVED`, `tasks/SavedFilter.js`); Lanes reads the same state; `TasksPage.js` is gone. `/framework/ai/asks/undone/` keeps its module view (it reads `undone.json`, 1167 asks, which `index.json` does not fold yet) and links to `?kind=ask`; `/live/` is left for the owner. Plan and proof shots: [one-dashboard task](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/plan.md).
