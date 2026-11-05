# Keep `git status` clean: fix the causes

**The owner, 2026-11-05:** "When I type git status, I like to see it clean." On 2026-11-05 the main tree was cleaned by hand (commit 0a0231e27): 260 loose files were committed, ignored or moved aside, and 12 merged worktrees were archived to `C:/Code/lew42/worktree-archive/2026-11-05/` and removed. Your job is to make sure it doesn't fill up again. Work in a worktree, test, then land with `merge.mjs`.

## Deliverables, each its own commit

1. **The sweeper commits generated records.** `Servex/LogSweeper.js` has a `DENY` list that skips every `.md` and `.js` file. So the records that tools write into task and session folders never get committed, and nobody else commits them either: `review.md`, `diff.patch`, `requirements.md`, `report.md`, and the generated task `page.js` stubs under `**/tasks/<slug>/page.js`. Let the sweeper commit these kinds, but only inside `public/framework/ai/sessions/**` and `**/tasks/**`. Keep real code (any other `.js`, `.mjs` or `.css`) denied. Update `public/framework/ai/sessions/doc/commit-rule.md` to match, and add a test.
2. **Find and fix the doubled-path writer.** Something writes `page.jsonl` and `files.jsonl` under `public/public/framework/...`, with the repo prefix doubled. It was seen as recently as 2026-11-03, and the folder is now ignored. Find the path join that does it (likely in `Server/plugins/PageFiles.js`, `Server/ModuleLog.mjs` or a page tool that joins `public/` onto a path that already starts with `public/`) and fix it, with a test.
3. **`close_task` records the real caller.** `Servex/TaskLoop.js:509` always writes `closed_by: "owner"` and ignores the `by` it is given. Change it to `closed_by: by || "unknown caller"`. Skip the append when the record already has a close line. Fix the tool description at `Servex/Servex.js:1129` and `Servex/Heartbeat-landed.test.mjs:28` to match. The full finding is in [../completion-truth/resume.md](../completion-truth/resume.md).
4. **A landed agent stops answering "done, idle".** An agent whose task has landed, here the task system check, answered every reply from its parent tab with the same "done: I'm idle" message, 140 turns and about $20. Find why its own reply woke it again (the `reply_to: log agent-…` wrapping, or the follow on its parent's log). Make sure a message from a landed agent that repeats its previous one is not delivered again, or that the agent goes dormant and stays that way.

## Don't
- Don't touch `CLAUDE.md`.
- Don't remove the `qf-*` pool slots.
- Don't run `git restore` or `git checkout --` in the main tree.

## Finish
Write `report.md` here (one screen: what changed, the commit for each item, the test commands). Land everything, and close anything you started.
