# Minion: name what emptied node_modules at 13:46 on 2026-09-29

Load the `minion` skill first. Parent task: `public/framework/ai/2026-09-29/node-modules-guard/` — read its `requirements.md` (the owner's brief, verbatim) start to finish; the "Already found" paragraph lists every suspect and every evidence source.

**Read-only investigation. You edit nothing in the repo except files inside `public/framework/ai/2026-09-29/node-modules-guard/cause/`.** Never run npm, git worktree remove, rm, or anything that writes, in any tree. Scratch goes in your session scratchpad.

## Deliver
1. `cause/cause.md`: the cause named at file:line plus the exact command that ran, with the evidence quoted (log line, reflog entry, mtime, task.jsonl line, each with its path). If not provable, rank every suspect from the brief with a credence (0–1) and the one fact that raised or lowered it. Top: one screen, plain sentences. A timeline table 13:30–15:30 (time · what · source).
2. One line in your own task.jsonl per finding as you go.

## Where to look (from the brief)
- every `public/framework/ai/2026-09-29/*/task.jsonl` around 13:30–13:55
- `.worktree-logs/` (main tree), `%LOCALAPPDATA%\lew42\servex\logs\`
- `git reflog --date=iso` in main and each worktree under `C:/Code/lew42/worktrees` and `.claude/worktrees`; `git worktree list`
- mtimes of `node_modules`, `Servex/node_modules` and their children (what was restored when, what survived)
- the Claude Code session transcripts under `C:\Users\mike\.claude\projects\` whose mtime spans 13:40–13:55: grep them for `npm ci`, `npm install`, `worktree remove`, `rmSync`, `rm -rf`, `ExitWorktree`, `node_modules`
- `Server/worktree-up.mjs`, `worktree-down.mjs`, `worktree-sweep.mjs`, `Server/merge.mjs`, `Servex/Pool.js`

Any process you start sets `windowsHide: true`. Model Opus; stop when cause.md is written, then end your turn with a two-line summary.

