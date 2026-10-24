# AIDay `ai/AIDay/`

The day page, at `/framework/ai/<YYYY-MM-DD>/`: every task of the day as a check-mark list, ✅ landed or ⬜ open, a task under its parent task under its session, each row with the time, the title and the first line of its outcome. Open first, then newest first. Below it: the owner's dictations of the day, the day's log lines, and a link to the same day by origin (`AIDashboard`).

| Piece | Job |
|---|---|
| `AIDay.js` (`AIDay extends View`) | asks the `tasks` source twice, for `landed_day == this day` (work that landed today in an older session's folder) and then `day == this day` (this day's folders; asked last, because the server pushes changed rows for the last query only), builds the tree from each row's folder path, repaints on every pushed row |
| `AIDay.css` | `aid-` rules, one column at 400 px |
| `Server/SessionIndex.mjs` | registers the `tasks` query source over the sessions store; whether a task landed is `AIIndex.fold`'s call, never this page's |

Data path: `sessions/YYYY/MM/DD/**/task.jsonl|session.jsonl` → `SessionIndex` → `QueryServer` → socket → `AIDay`. The dictations are the `chat` lines with `from.kind: "owner"` in the records of rows that have chats; the log lines are `sessions/YYYY/MM/DD/day.jsonl`. Nothing here reads the retired `ai/<date>/` folders.

## Watch out

- Needs the dev server (a static host has no socket); the page says so.
- A task counts as landed only when its own record says so (`complete`, or a landing line from `finish-task`); a minion's `ready:` line or a parent's log line is not a landing.
- A session from an older day shows its start day beside its name and links to its own dated folder.
- A task that lands today in an older folder appears on reload, not live: the server pushes changes for the last query only, and that is the folder-day ask. One query with an "any of" clause in `ext/Query` would make both live; it needs a dev server restart.
- Spend is shown only when a row carries `usd`; task rows rarely do, so most days show none.
- A depth-1 folder of the day is a session; every row below it is a task.
