# Repo junk census: what are 450 changed files?

**Goal:** count every kind of file git shows, say what writes it, and rank what to ignore, stop writing, commit or archive. **Read-only: change nothing.**

Expected cost: about $1.50. Haiku. Follow [findings-method.md](../findings-method.md); write only `findings.md` and your log.

The owner's words: "There are so many bullshit files in this repo... what the fuck are you guys doing?" They saw far more changed files in git than they expected.

## Measured at 22:51 on 2026-11-04, so start from here

- `git status`: 450 paths. 264 untracked, 170 modified, 16 deleted. By name: 101 `task.jsonl`, 72 `past-work.md`, 56 `session.jsonl`, 27 `page.js`, 19 `review.md`, 17 `log.jsonl`, 15 `requirements.md`.
- 26,538 tracked files, of which 3,947 are `files.jsonl` folder listings. About 15,500 are under `public/framework/ai/`.
- Temp junk in the repo root: `Temp_*` files from 10-24.

The owner remembers about 1,000 modified and 1,000 untracked. Check whether that was real: `processes.jsonl` won't say, so look for what changed recently, and count what `git status` shows in each registered worktree. VS Code's Source Control panel may add worktrees together.

## Answer with a script

1. **Every tracked and untracked file, by kind.** A table: pattern, count, total size, what writes it (name the code, `path:line`), what reads it, and whether it's in `.gitignore`.
2. **For each machine-written kind:** does the static production site need it? `public/` deploys as is, so `files.jsonl` may be read there; prove it either way from the reader's code. Is it derivable, so that it needn't be in git?
3. **Why do untracked task files stay untracked?** `public/framework/ai/sessions/doc/commit-rule.md` says records are committed. `Servex/LogSweeper.js` denies all `.md` and `.js`, and new task folders hold `past-work.md`, `page.js`, `review.md` and `requirements.md`. Who is meant to commit those?
4. **`deleted` lines (16):** voice logs under `<module>/ai/`. Are they meant to be gone? Would a `.gitignore` rule cover them?

## End with

A ranked list of undeniable changes, biggest reduction first: what to ignore, what to stop writing, what to commit, what to archive. For each: files removed from `git status`, files removed from the repo, what would prove nothing broke, and what generates them again if not fixed. Change nothing.
