# A clean `git status` on michael/dev, always

Budget: $10. Load the `sub-mastermind` skill first. The owner's raw words are in `../requirements.md` (ask 7, dictation 2: "when I type git status, I'd prefer if everything was just always kind of committed"). Your log is this dir's `task.jsonl`. CLAUDE.md laws apply: never destructive, compute don't recall.

## What dirties the main tree today (2026-10-13 15:40, `git status --porcelain`)

- `public/framework/ai/sessions/2026/10/09/index.json`, seven `.../session-f155ecbd/figma-claude-designs/kit/*/task.jsonl` (agents logging while they work in the main tree), `public/framework/ai/usage.jsonl`, `public/framework/ext/Figma/doc/files.jsonl`, `public/framework/ux/Dictate/doc/files.jsonl`, one untracked task dir.
- `Servex/LogSweeper.js` exists for exactly this (commits machine-written records in batches, only ALLOW paths); it landed 2026-10-12 (session-housekeeping) and needs a Servex restart to run. The rule is `public/framework/ai/sessions/doc/commit-rule.md`.

## Deliverable

1. **Prove what LogSweeper covers**: run it `dry` against the current status and log which of today's dirty paths it would commit, which it would not, and why. Check the Servex log for whether it is actually running (`server_logs`, the `sweeper` log); if it needs the restart, say so on the card as a needs-you item with the one command (`node Servex/sustain.mjs --restart`, which refuses while agents work) rather than restarting yourself.
2. **Close the gaps**: extend ALLOW for records that are legitimately machine-written (the `index.json` of a sessions day, `files.jsonl` under any `doc/`), with a one-line reason each; anything that is a cache goes to `.gitignore` with a reason. Keep `usage.jsonl` committed (184 KB, the owner wants the history) unless `repo-size-plan` (a sibling task) decides otherwise; link its doc.
3. **The workflow question**: the owner asks why agents do not simply always work in worktrees and merge clean branches. Answer it in `public/framework/ai/sessions/doc/commit-rule.md` (a short section): which writers must hit the main tree (Servex itself, logs the live site reads) and which should not (any agent editing code); what already enforces it (`main-site-is-production`, `take_worktree`, `merge.mjs`, the git-guard hook) and the one gap that still lets an agent edit code in the main tree. Fix that gap if it is a one-line hook change; otherwise write it as a decision with the fix spelled out.
4. **Leave the main tree clean**: at the end, every file you touched is committed; the pre-existing dirty records are committed through the sweeper's own path (or by path, same commit message style) so the owner's next `git status` is empty. Do NOT commit another agent's code edits; records only. Never `git stash`, never `git clean`.
5. Report on your card: before/after `git status --porcelain | wc -l`, what the sweeper now covers, the needs-you line if a restart is required.

Fence: `Servex/LogSweeper.js` (+ its test), `.gitignore`, `public/framework/ai/sessions/doc/commit-rule.md`, `.claude/hooks/git-guard.mjs` only for a one-line gap fix, this task dir. Servex code is tested in a worktree with its tests before it lands; the live Servex is not restarted by you.
