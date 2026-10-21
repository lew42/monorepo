# AIDay `ai/AIDay/`

The day page, at `/framework/ai/<YYYY-MM-DD>/`: every task of the day as a check-mark list, ✅ landed or ⬜ open, a task under its parent task under its session, each row with the time, the title and the first line of its outcome. Open first, then newest first. Below it: the owner's dictations of the day, the day's log lines, and a link to the same day by origin (`AIDashboard`).

| Piece | Job |
|---|---|
| `AIDay.js` (`AIDay extends View`) | asks the `tasks` source for `day == this day`, builds the tree from each row's folder path, repaints on every pushed row |
| `AIDay.css` | `aid-` rules, one column at 400 px |
| `Server/SessionIndex.mjs` | registers the `tasks` query source over the sessions store; whether a task landed is `AIIndex.fold`'s call, never this page's |

Data path: `sessions/YYYY/MM/DD/**/task.jsonl|session.jsonl` → `SessionIndex` → `QueryServer` → socket → `AIDay`. The dictations are the `chat` lines with `from.kind: "owner"` in the records of rows that have chats; the log lines are `sessions/YYYY/MM/DD/day.jsonl`. Nothing here reads the retired `ai/<date>/` folders.

## Watch out

- Needs the dev server (a static host has no socket); the page says so.
- A task that landed on this day from an older day's folder is not listed (the query is by folder day).
- Spend is shown only when a row carries `usd`; task rows rarely do, so most days show none.
- A depth-1 folder of the day is a session; every row below it is a task.
