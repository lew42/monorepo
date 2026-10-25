# Servex OOM crash loop (2026-10-25 04:03 onward)

Budget: $8. Load the `minion` skill first.

Since `sustain --restart` at 04:02, Servex exits 134 (JavaScript heap out of memory) about 75 s after every boot, and sustain restarts it, forever.
Evidence: `C:\Users\mike\AppData\Local\lew42\servex\logs\sustain.log` (grep -a "exited (134)"), node reports in `...\logs\reports\`.
Commits new since the last good boot (03:09): fd32ba0f4 (Servex/agents/PromptLines.js, Sessions.js: a Prompt per spoken thought) and dbcde67f0 (Servex/Pool.js heal_tree/restore batches, Crumbs lag watchdog CrumbsWatch.js).

Do:
1. Find which code allocates without bound (the Crumbs breadcrumb log, the reports, a private Servex on another port if needed; see Servex/doc/restart.md). Prime suspect: Pool heal/restore/dirt on a slot with ~40,000 deleted files (qf-7, qf-5), with git maxBuffer 256 MB.
2. Fix it in the main tree directly on michael/dev (a live fix; Servex is down): the smallest change that stops the loop. If you can't find it in 15 minutes, revert the guilty commit (`git revert --no-edit <sha>`), never reset.
3. Commit by path. Servex picks the code up on its next crash-restart by itself; confirm it stays up 5 minutes (sustain.log shows no new exit).
4. Log each finding and the result as `log` lines in this folder's task.jsonl (`node .claude/hooks/append.mjs <file> <json file>`).

Never: kill the dev server, stash, push, or drive the owner's tabs. You are NOT hosted by Servex, so its crashes don't kill you.
