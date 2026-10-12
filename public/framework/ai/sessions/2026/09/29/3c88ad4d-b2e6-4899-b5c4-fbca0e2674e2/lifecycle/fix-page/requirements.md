# Lifecycle study page: the review's fixes

Load the `minion` skill first, then `page`. Parent: task-mastermind-lifecycle. The owner's words and brief: `public/framework/ai/2026-09-29/lifecycle/requirements.md`. The review: `public/framework/ai/2026-09-29/lifecycle/review.md` (you own findings 2, 3, 4, 5, 6, 10, 11 and 12). Worktree **C:\Code\lew42\worktrees\lifecycle**, branch worktree/lifecycle; commit there by exact path. Never commit `page.jsonl` files (the server writes those). Fence: public/framework/servex/lifecycle/ and public/framework/servex/page.js.

1. **Before and after, first.** Put the four numbers in one row at the top, each with **before → after**, followed by one line saying the reaper closed them. The after numbers come from the first real sweep, at 18:03 (evidence: `lifecycle/build/first-real-sweep.txt` and the `experiment` lines in `lifecycle/task.jsonl`). Dev-server wrappers went 20 → 9, `run.js` 13 → 8, node 45 → 29, and idle agents holding claude 14 → 4. Show servers and agents as "of those running now", not "of all ever made" (finding 6). Tasks never landed and worktrees orphaned keep their study numbers, with no after value, because the reaper doesn't change those.
2. **Replace the stale text** saying the reaper doesn't exist yet (finding 2). Write one line on what it does now, and link `Servex/doc/lifecycle.md`.
3. **Cut the pool section to two lines** (finding 4). Line one: the salvage branches exist, and `Pool.salvage()` stops the slot's server before it commits. Line two: the `page.jsonl` proposal, which is the owner's decision, with a link to the doc.
4. **Chart** (finding 5): memory only. Leave disk out, or give it a separate small bar.
5. **Layout** (findings 10 and 11): at 1920 and 3440, put the numbers row and the chart side by side above the fold, with the worst-ten table below them. The page title reads "Lifecycle", not "Servex". Also fix the duplicate Overview/Docs in the sidebar if it comes from this page's own children.
6. **Finding 12:** in servex/page.js, replace the bottom section with one bullet in "Its parts" that links to the Lifecycle page.
7. Shoot the page with `mcp__site__shot` at 1920 and 3440 on `http://127.0.0.1:54967/framework/servex/lifecycle/`, judge each shot, and save both paths in your log.
Land your log with `landed_at`, outcome 60 words at most, and message your parent.
