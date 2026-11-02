# Worktree dev servers are never stopped (you are a mastermind, on Sonnet)

**Found 2026-11-01 at 21:45 by vscode-mastermind:**
- **67 `node server.js` processes (about 1.7 GB)** are running. 63 of them were started by `cmd.exe /d /c node server.js >> C:\Code\lew42\monorepo\.worktree-logs\<name>.log` for worktrees as old as 10-23: `merge-latest`, `readme-pages`, `chat-v2`, `qf-6`, …
- **Servex's own worktree list** says several worktrees can't be removed: "git refused to remove it: … Directory not empty". A live server holding the directory is a likely cause.
- **The owner asked for no zombie processes** ("Servex being able to shut these down when not used").
- **Free RAM is about 2 GB,** which holds back new agents.

## Do (worktree; review; merge with `Server/merge.mjs`)
1. **Find the code that starts these servers.** Grep for `.worktree-logs` (it's likely `Server/worktree*.mjs`, `merge.mjs`, `review.mjs`, `smoke.mjs` or Servex's worktree tools).
2. **Fix the lifecycle so a worktree's dev server always stops:**
   - when the worktree is merged, returned to the pool, or removed;
   - after N minutes with no request (idle stop, like Whisper's 10 minutes); a worktree site is cheap to start again.
   - Record each server's pid in one place, so a stop never has to guess.
3. **For the servers already leaked,** write `Server/worktree-servers.mjs`:
   - `--list` (the default, a dry run) shows each server's worktree, pid, age, MB, and whether its worktree is still active (in use, open, or gone);
   - `--stop-stale` stops only the ones whose worktree is merged, gone or pooled.
   - **Don't run `--stop-stale` yourself.** The tab's attempt to stop them was refused by Claude Code's safety check, so the owner runs it in the morning. Put the exact command in your report.
4. **Document it** in the readme of whatever module owns worktrees (Law 9).

**Fences:**
- never kill a process yourself, and never stop the main `monorepo` server or Servex;
- commit by path; no `python -`.

**Budget:** about $10. Report to vscode-mastermind in 3 lines.
