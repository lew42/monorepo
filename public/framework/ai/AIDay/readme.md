# AIDay `ai/AIDay/`

The day page, at `/framework/ai/<YYYY-MM-DD>/`: every task of the day as a check-mark list, ✅ landed or ⬜ open, a task under its parent task under its session, each row with the time, the title and the first line of its outcome. Open first, then newest first. Each session block has an Approve button (the session page's, via `AISession/Approvals`), and today's page lists what is ready to merge (`merge/ReadyToMerge`) above the sessions. Below it: the owner's dictations of the day, the day's log lines, and a link to the same day by origin (`AIDashboard`).

| Piece | Job |
|---|---|
| `AIDay.js` (`AIDay extends View`) | asks the `tasks` source twice, for `landed_day == this day` (work that landed today in an older session's folder) and then `day == this day` (this day's folders; asked last, because the server pushes changed rows for the last query only), builds the tree from each row's folder path, repaints on every pushed row |
| Approve (in `AIDay.js`) | `find_snaps()` finds each session's snapshot in its folder's day `index.json` by folder name; Approve calls `Approvals.of_day(snap.day).approve([snap])`, the same call as the session page: one line in the session's `session.jsonl`, one in that day's `day.jsonl`. No snapshot found: no button, one muted line saying so |
| Ready to merge (in `AIDay.js`) | `new ReadyToMerge()`, drawn only when the page's day is today (the list is live, wrong on a past day) |
| `AIDay.css` | `aid-` rules, one column at 400 px |
| `Server/SessionIndex.mjs` | registers the `tasks` query source over the sessions store; whether a task landed is `AIIndex.fold`'s call, never this page's |

Data path: `sessions/YYYY/MM/DD/**/task.jsonl|session.jsonl` → `SessionIndex` → `QueryServer` → socket → `AIDay`. The dictations are the `chat` lines with `from.kind: "owner"` in the records of rows that have chats; the log lines are `sessions/YYYY/MM/DD/day.jsonl`. Nothing here reads the retired `ai/<date>/` folders.

## Watch out

- Approve needs the day's `index.json` (generated, git-ignored) and the dev server to write; a fresh worktree has neither until the server has built them.
- Ready to merge asks Servex's `/api/ready-to-merge`, so it says in words when Servex does not answer.
- Needs the dev server (a static host has no socket); the page says so.
- A task counts as landed only when its own record says so (`complete`, or a landing line from `finish-task`); a minion's `ready:` line or a parent's log line is not a landing.
- A session from an older day shows its start day beside its name and links to its own dated folder.
- A task that lands today in an older folder appears on reload, not live: the server pushes changes for the last query only, and that is the folder-day ask. One query with an "any of" clause in `ext/Query` would make both live; it needs a dev server restart.
- Spend is shown only when a row carries `usd`; task rows rarely do, so most days show none.
- A depth-1 folder of the day is a session; every row below it is a task.
