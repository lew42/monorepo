# Review: the sessions list as the owner's review page (a variant, shape only)

[/framework/ai/sessions/v/review/](/framework/ai/sessions/v/review/) lists recent sessions, each nested under the session that spawned it. It shows the last day by default; a **Today ▾** pill switches to Week, Month or Year. Each session shows its state and an **Approve** button. The head card adds up the window's dollars in three boxes, **approved**, **waiting** and **leaking**, and offers **Approve all finished**. It is a shape for the owner to approve before anything is built on the real sessions page.

## Files

| File | Class | Job |
|---|---|---|
| `page.js` | | builds `ReviewList`; a session id under `v/review/` opens the phone session page |
| `ReviewList.js` | `ReviewList extends MobileAll` (`../mobile/`) | reads the window, nests by parent, judges each state, draws the head card and the list, writes approvals |
| `ReviewRow.js` | `ReviewRow extends MobileRow` | one row: plain title, state word, what it belongs to, the slug small, Approve |
| `review.css` | | prefix `rv-`, on top of `../mobile/mobile.css` |

## Data

- **Sessions:** `sessions/YYYY/MM/DD/index.json` through `MobileData.days()` (writer: `AISessionIndex`). **Parent:** `session-tree.json`, else the snapshot's `parent` agent name joined to the session that agent ran.
- **Approve** writes two lines through `FsFile.append` (`ai/AIDashboard/Approvals.js`): `{"approve":{"at","by":"owner"}}` in the session's own `<day>/<folder>/session.jsonl`, and a pointer `{"log":{…,"approve":{"session","record","by"}}}` in that day's `day.jsonl`. The page streams only the day logs, one file per day, because most sessions have no record of their own and probing each one is a 404.
- **Approving a parent approves everything under it.** This is computed when the page reads, not written per child.

## The leak rule (numbers in `ai/AIDashboard/Review.js`, tune them there)

A session is **working** while it was active in the last hour (`FINISHED_MS`). After that it is **waiting** for you. It becomes a **leak** (red) once it is unapproved, cost more than $0.50 rolled up with its children (`LEAK_USD`), and finished more than a day ago (`LEAK_AGE_MS`). Leaks are listed first.

## Watch out

- Year reads at most 60 day files for now (`ReviewList.WINDOW`).
- `Approvals` and `Review` still live in `ai/AIDashboard/`, from the first try of this task. They move beside this page once its shape is approved.
