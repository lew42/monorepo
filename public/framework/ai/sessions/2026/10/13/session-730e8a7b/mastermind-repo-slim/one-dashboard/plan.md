# Plan: the Inbox list reads the one state, with filter chips

Built in `/framework/ai/` (the Inbox). No new page, no new folder. Agreed shape: [one-dashboard.md](/framework/ai/doc/one-dashboard.md). Data: [one-state.md](/framework/ai/doc/one-state.md).

## The one row

`{kind, id, title, state, bucket, when, day, who, home, url, line, needs}`. `kind` is `task | card | session | ask`. `when` is the row's last change (a landed task: its landing). `day` is that time's local calendar day. `home` is a module path or null. `who` is an agent, a session or an owner.

| Kind | Comes from | Made by |
|---|---|---|
| task | `state.tasks` (already folded by `Task.replay`) | `DashRow.of_task`, in the browser |
| session | `state.sessions`, only sessions with 2 or more tasks (a one-task session is its task) | `DashRow.of_session`, in the browser |
| card | `ai/cards.jsonl`, latest line per id | `State` writes `state.cards` (new) |
| ask | `ai/asks.jsonl`, `AskFold.fold` | `State` writes `state.asks` (new) |

`DashRow` (`ai/rail/DashRow.js`) is plain code with no DOM: node (`State`) and the browser both import it, so one mapping exists.

## The check (written into `state.check`, counted two ways)

- `check.cards`: rows after folding = the sum of the five buckets (`open working needs done archived`) = distinct ids found by a plain text scan of the file (no JSON parse).
- `check.asks`: rows after `AskFold` = the sum of the six buckets (`queued working waiting stalled done closed`) = distinct titles found by a plain text scan.
- `check.sessions`: the tasks counted in `state.sessions` = the task rows that carry a session.
- `check.ok` is false if any differs; the page turns the red line on and names the numbers.

## The chips (a url each: `?live&new&kind=ask`)

Groups combine like facets: within **When** a chip adds (any of), across groups both must hold.

| Chip | Selects exactly |
|---|---|
| **Live** (`live`) | tasks in flight; any row whose `when` is within 10 minutes of `state.at` |
| **New** (`new`) | tasks queued, or idle for 7 days or less (an older idle task is under Older); cards open or working and created today; asks queued (nobody has picked them up), however old: every queued ask is new, not only today's |
| **Recent** (`recent=today\|yesterday\|week`, default today) | landed tasks, done cards, done asks, by their local `day` (the tasks page's three windows) |
| **Older** (`older=week\|month`, default week) | landed (or left idle) more than 7 days ago: 8 to 34 days (`week`), older (`month`) |
| **Needs you** (`needs`) | tasks waiting on the owner, cards with a `needs-you` owner note or status, asks waiting (`WaitingOnYou` now uses the same `DashRow` rules for cards and asks, so the pin and the chip agree; a `parked` ask does not wait) |
| **Kind** (`kind=task,card,session,ask`) | only those kinds (several) |

No chip: the newest 150 rows of everything, with the total said ("newest 150 of N"). The search box (title or line) stays; it searches all rows, so on **Older** it is the past-work search over the state rows (`Server/PastWork.mjs` is a command-line report with no browser reader; the same words run over the same rows).

The count each chip shows and the red check line sit above the list.

## What the rail keeps

The detail pane (a card opens beside the list as today), owner notes pinned at the top (`WaitingOnYou`), Now / Today / Yesterday / Your prompts pinned rows, search, routes of every day page. A card row is the old rail item (so its detail page draws as before) joined to its state row. Old per-score floor and blocking/review/fyi chips go: the new chips replace them.

## Stream

`TaskStateLog` (the tasks page's own class) tails `ai/tasks/state.jsonl`; each new line refetches `ai/state.json` (written first, so the line always points at fresh data) and repaints. `State.watch` now wakes at once when a log file or `cards.jsonl` / `asks.jsonl` changes, instead of waiting out the 5 s tick.

## decision

```json
{"decision":"project tasks and sessions into the one row in DashRow and have State fold only cards and asks","rejected":["write a duplicate `rows` array of all 3,000 rows into state.json: +1 MB and a second copy of every task","build the rows only in the browser: a script or a model could not read the same cards and asks, and the two-way check would not exist"]}
```
