# What emptied node_modules at 13:46, and guards so it can't again

**What happened:** Servex crash-looped from 13:53 to 15:02 on 09-29 ("Cannot find package 'express'", then "@anthropic-ai/claude-agent-sdk"). The repo-root `node_modules` was empty (dir mtime 13:46), and `Servex/node_modules` was damaged. servex-mastermind-opus restored both with npm install. Nearly every agent died.

**Already found (mastermind-servex-4):** five old worktrees still had `node_modules` as a JUNCTION into the main tree: live-card-wide, live-preview, live-reply, servex-crash and servex-monitor, all under C:/Code/lew42/worktrees. They were made before the 09-22 fix in `Server/worktree-up.mjs:117`. Those links were removed (link only) at about 15:20. Deleting through a junction, or running `npm ci` or `npm install` inside a worktree whose node_modules is a junction, empties the main tree. Suspects for 13:46, to check: `worktree-up.mjs` or `npm ci` run in one of those five; `git worktree remove` or worktree-down of one of them; Claude Code's EnterWorktree/ExitWorktree (the chip-context-fix worktree in .claude/worktrees was removed at about 13:53, but it was made at 13:46); Pool.js take/return/prune; merge.mjs cleanup; a resumed check-consensus or recursive-pairs (their worktree dirs changed at 13:45). Evidence: task.jsonl files for 09-29, `.worktree-logs/`, `%LOCALAPPDATA%\lew42\servex\logs\`, the git reflog, and the mtimes of `Servex/node_modules`.

## Do
1. Name the cause with evidence, at the level of file:line and the command that ran. If it can't be proven, rank the suspects with a credence each.
2. **Guard 1:** before any `rm`/`rmSync` recursive, `git worktree remove`, or `npm ci` in a worktree script (worktree-up/down, Pool.js, merge.mjs), refuse if any path in it is a reparse point that resolves into the main checkout.
3. **Guard 2:** in `Servex/sustain.mjs`, before each respawn, check that `node_modules/express` and `Servex/node_modules/@anthropic-ai/claude-agent-sdk` resolve. If they don't, run `npm install` (hidden, with windowsHide) in that directory, log it, then respawn. A crash loop must never last an hour again.
4. A sweep script `Server/junction-check.mjs` lists every junction under the worktrees root. Run it from worktree-up.

Prove each guard on a scratch copy, never on the main tree. Don't touch sustain.mjs's `--restart` path; task `restart-outside-tree` owns it, so coordinate with it through send_to_agent if it's running. Land: merge.mjs, a note in `Server/doc/worktrees.md`, finish-task. Model: Opus, medium.

