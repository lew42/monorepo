# The day page counts what landed that day

Budget: $2 (the deputy's own edit plus one review).

## Why

On 2026-10-24 the day page ([/framework/ai/2026-10-24/](/framework/ai/2026-10-24/)) said "0 landed · 0 open" although about ten tasks landed that day. It asked the store only for tasks whose folder is dated that day, and most work lands in an older session's folder (the VS Code session's folder is dated 2026-10-20). Its readme listed this as a known gap. Priority 1 in [priority.md](/framework/ai/priority.md) is one page per day where the owner sees the day's work.

A second cause: the deputy's own three tasks had no landing line in their records, so nothing could count them. They are now landed (`complete` plus a `finish-task` landing line).

## What changed

- `ai/AIDay/AIDay.js` `ask()`: two asks of the `tasks` source, `landed_day == day` and then `day == day`, merged by row id. The folder-day ask goes last because the server pushes changed rows for the client's last query only.
- A session root made up for a task from an older folder links to its own dated folder and shows "started <day>".
- Readmes: `AIDay/readme.md` (the table row, two Watch out lines), `AISession/readme.md` (named agent urls).

The alternative was an "any of" clause in `ext/Query` (one query, every pushed row live). It needs a dev server restart to reach the live site, so it waits; this version needs none.

## Check it

- The day page on the worktree shows a task from a 2026-10-23 folder as landed on 2026-10-24.
- `node Server/smoke.mjs <worktree> /framework/ai/2026-10-24/ /framework/ai/2026-10-20/` shows no FAIL.
