Budget: $14

# Merge approvals: a "ready to merge" list with a Merge button

Build the **smallest slice** in `plan.md` beside this file (items 1–3), exactly as written there. Read `Server/merge.mjs` (header), `Server/review.mjs` (`status()`), and `Servex/Servex.js` around `/api/item` (the loopback guard and `cors`) first.

Rules:
- The Merge button only ever runs `Server/merge.mjs`; never `git merge` or anything else. A refusal from merge.mjs is shown in the card, not retried.
- Servex code changes need a restart to go live: do NOT restart Servex; log "needs restart" in this task's record. Test the route handler as a plain function (a `.test.mjs`), and test the page against a stubbed fetch or by pointing it at `node Server/ReadyToMerge.mjs --json` output.
- Page: follow the `page` and `ui` skills; check with `check_page` at 400 and 1200 on your worktree url.
- Docs: a short `public/framework/ai/merge/readme.md` (what it is, on-disk structure, who writes, who reads), one line in `public/framework/ai/readme.md`, and `Server/readme.md` gets the new script's one line.

**Land:** work in a worktree (`take_worktree`), commit, run `node Server/review.mjs <this task dir> <your worktree>` FROM THE WORKTREE, answer every finding, confirm `node Server/review.mjs --status <this task dir>`, then log `ready: <branch> <sha>` here (your own row should then appear in your own list — say if it does) and stop. Do not merge.
