# Day page: approve a session in one press, and what is ready to merge

Budget: $6 (Sonnet, one worktree, one review by the deputy).

Load the `minion` skill first, then the `page` skill (this is a page the owner looks at).

## Why

Priority 1 in [priority.md](/framework/ai/priority.md) reads: "One page per day where the owner sees every session, opens a demo, and approves a whole session with one press … What is ready to merge sits on the same page." The day page ([/framework/ai/2026-10-24/](/framework/ai/2026-10-24/), class `ai/AIDay/AIDay.js`, readme `ai/AIDay/readme.md`) now lists every session and what landed. It has no Approve button and no merge list. Both already exist elsewhere, so this task reuses them (CLAUDE.md law 6: one of everything). It builds nothing new.

## What to build

1. **Approve, per session, on the day page.** Each session block on the day page (`AIDay.session()`) gets the same Approve button the session page has. Once pressed, it shows the same approved state.
   - Reuse `ai/AISession/Approvals.js` (`Approvals.of_day(day)`, `.approve(snaps)`, `.of(id)`, `.on(fn)`). See how `ai/AISession/SessionWork.js:105-111` and `:147-148` call it.
   - Approving must write exactly what the session page writes: one line in the session's record and one line in that day's `day.jsonl`.
   - ⚠ The ids must match. `Approvals` keys by the session snapshot's `id`, while the day page's session root is a folder (`rel`, `day`). Find the snapshot the session page uses for the same folder. Prove it with one session: approve it on the day page, then open its session page; it shows approved. The reverse must hold too.
   - A session whose snapshot cannot be found shows no button, plus one muted line saying why. Never show a button that writes to a guessed path.
2. **Ready to merge, on today's day page only.** Add a "Ready to merge" section with `new ReadyToMerge()` from `ai/merge/ReadyToMerge.js`. It is a live list of what is ready now, so it is wrong on a past day: draw it only when the page's day is today.
   - Place it above the session list, under the "N landed · M open" line.
   - An empty list says so in one line.
3. **Readme:** the `AIDay/readme.md` table row and Watch out list. Also the `ai/readme.md` AIDay line, if it no longer holds.

Not in scope: spend and leaks on the day page (the rows rarely carry `usd`), the time filter.

## Where

- Worktree `C:/Code/lew42/worktrees/qf-2`, branch `worktree/qf-2`, its server at http://127.0.0.1:58948/. It is already taken for you.
- Files you may edit: `public/framework/ai/AIDay/*` and `public/framework/ai/readme.md` (that one line only).
- Read but do not edit: `AISession/*` and `merge/*`. If one of them needs a change, say what and why in your reply instead.
- Your log is this folder's `task.jsonl`. Findings go there as `log` lines.

## Check it

- Shots of the worktree day page at 1200 and 1920, for today and for 2026-10-20 (no merge list on that one). Save them in `shots/` in this folder.
- Approve one session on the worktree's day page. **Use a session from the worktree only, and say which one.** The approve writes into the worktree's files, so check `git diff` shows exactly the two lines, then revert them with `git checkout -- <those two files>` inside the worktree.
- `node Server/smoke.mjs C:/Code/lew42/worktrees/qf-2 /framework/ai/2026-10-24/ /framework/ai/2026-10-20/` shows no FAIL.
- Commit in the worktree at each working step. Reply `ready: <sha>`, the smoke line and the shot paths.

Never kill or restart the dev server, never `git stash`, never drive the owner's tabs (headless only), and never edit the main tree's site files.
