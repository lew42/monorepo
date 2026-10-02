# Line filter, built by one minion in a side-by-side trial

You are one of two minions building the SAME thing in separate worktrees. Your mastermind judges both and merges only the better one. Do your best work; nobody is waiting on you to finish first.

## The job
Build exactly what this brief says, the LINE MAP ONLY (skip its "Next" section):
[/framework/ai/2026-10-01/line-filter/requirements.md](../../../2026-10-01/line-filter/requirements.md) (the file is `public/framework/ai/2026-10-01/line-filter/requirements.md` in the repo).

## Your worktree (work ONLY here)
`C:/Code/lew42/worktrees/lt-cheap` on branch `worktree/lt-cheap`. Its own site is at `http://127.0.0.1:54338/`; the page goes at `http://127.0.0.1:54338/imagine/lines/`.
Read and write files only inside that folder. Do NOT touch `C:/Code/lew42/monorepo`, except to append lines to your own task log (below).

## Rules (these override the brief's own "Rules" section)
- **Do NOT merge, and do NOT run merge.mjs.** Commit your work in the worktree (`git -C C:/Code/lew42/worktrees/lt-cheap commit`). Your mastermind merges the winner.
- **Do NOT spawn minions,** and do NOT take a pool worktree.
- Read the readme chain first: `readme.md` (root), `public/framework/readme.md`, and the readme of each folder you work in.
- **Log as you go** in your task log, which is already open (its path is in your first message). Append lines with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`, never with shell redirection.
- **Check it works:** `node Server/smoke.mjs <your worktree> /imagine/lines/` (run from your worktree) must exit 0. Also load the page in a headless browser with no console errors. Save two screenshots in YOUR task folder: `shot-1200.png` and `shot-400.png`.
- When it's done, write `result.md` in your task folder: what you built, the files, what works, what doesn't. Five to ten plain lines. Then stop.
