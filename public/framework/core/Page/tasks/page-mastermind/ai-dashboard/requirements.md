Budget: $7

# AI dashboard: /framework/ai/ opens on what matters most

Load the `minion` skill first, then `past-work`, then `page` (it sends you to the `/framework/design/` readme chain), then `code`. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`).

**The owner (2026-10-24):** the words are in the prompt log, [`ai/sessions/2026/10/20/session-e00f55c9/page.jsonl`](/framework/ai/sessions/2026/10/20/session-e00f55c9/) line 402. In short: the root AI screen "is still the inbox that is horribly broken… rethink how that inbox is working… The framework/AI default page should maybe default to a dashboard, and then figure out what we can put on there that's most useful… the place where you should be able to kind of put what I'm saying." The task is `ai-dashboard-framework-ai-opens-on-a-das` in [`../task.jsonl`](../task.jsonl).

**Read before you design:** [`ai/doc/dashboard-layout-asks.md`](/framework/ai/doc/dashboard-layout-asks.md). The owner has asked about this page's layout 7 times: no tall toolbar, no scroll box inside the page scroll, one normal page scroll on a phone, more controls go on a tab or one click down. Then [`ai/AIDashboard/readme.md`](/framework/ai/AIDashboard/readme.md), [`ai/doc/one-dashboard.md`](/framework/ai/doc/one-dashboard.md) and [`ai/priority.md`](/framework/ai/priority.md).

## 1. What the owner sees today, and what is broken (a log, 3–5 lines with numbers)

- `/framework/ai/` draws `AIDashboard` (since 2026-10-19): usage bars, a row of pills, then a long sessions list. `/framework/ai/inbox/` is the old Inbox. Shoot both, at 1920 and 390, headless, into `shots/before-<place>-<width>.png`.
- Find what is "horribly broken": page errors, console errors, empty or wrong numbers, the layout. One check worth making: the "Ready to merge" pill read 0 on 2026-10-24 at 20:15; compare it with what the ready-to-merge source actually holds.
- Log each finding as one line, with the measurement.

## 2. One dashboard shape, built small enough to be the picture

Build the proposal as a real working view in your worktree, not a mock-up: if the owner likes the shot, the merge is the whole job. Smallest working version; reuse what exists (law 6) rather than building new pieces.

What the page should give the reader, in this order (your judgment on the exact shape; follow the design readmes):
1. **A place to say something:** the dictation or "say something" box the site already has, reused.
2. **What needs the owner:** waiting on you, and ready to merge (the owner's one decision), each with its real count.
3. **The big things now:** the rows of `priority.md` with their "Now" line.
4. **What is running:** agents at work right now, with state and cost.
5. **The task queue:** the count and the top 3, linking to [`/framework/ai/queue/`](/framework/ai/queue/).
6. **Usage pace:** one line.

The sessions list moves one click down: the Sessions tab already exists.

⚠ **Only one live `QueryClient` per page.** `ext/Query/QueryClient.js` keeps one static `current`, so a second live query on the same page takes the first one's pushes away (filed in `ext/Query/improvements.jsonl`). Use one live source, or read the others once without live updates, and say which you chose.

**Shots:** 1920 and 390 in `shots/<width>.png`. The 1920 shot is the deliverable. Cut items 5 and 6 first if you run short.

## Done

- `node --check` every changed file.
- Smoke from the main tree shows no FAIL: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs <your worktree> /framework/ai/ /framework/ai/inbox/ /framework/ai/queue/`.
- Bring `ai/AIDashboard/readme.md` current, plus one line in `ai/doc/dashboard-layout-asks.md` naming this change.
- Log `ready: <branch> at <sha> <what each section reads from; before/after shots>`. Then stop. The mastermind reviews it, shows the owner the 1920 shot and merges.

## How

- Work in the worktree named in your first message. Commit after part 1's log (if any code changed) and after part 2.
- Never kill or restart the main dev server or Servex. Headless only, never the owner's tabs. Never stash: diff, don't stash. Leave `files.jsonl` churn alone and commit only your files (`git add <your paths>`, never `git add -A`).
- **Resolve, don't park.** Anything you leave out gets a log line with the reason.
