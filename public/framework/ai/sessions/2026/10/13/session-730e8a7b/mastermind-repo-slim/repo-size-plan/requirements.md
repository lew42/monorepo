# Repo size: what is committed, what should be, and the phased plan to slim it

Budget: $20. Load the `sub-mastermind` skill first; you are the task mastermind. The owner's raw words are in `../requirements.md` (asks 3, 4, 5, 9 and the usage.jsonl question in dictation 2). Your log is this dir's `task.jsonl`. CLAUDE.md laws apply: **never destructive, compute don't recall, plan before surgery.** This task does NOT restructure anything; it measures, decides what it can, and writes the plan. The owner said: "don't do any massive restructuring until we think it through."

## The facts (mastermind survey, 2026-10-13)

- `.git` is 752 MB. `public/` is 2.08 GB, of which `public/framework/ai/sessions` is 1.38 GB and `public/framework/ai/2026-10-12` 96 MB. The framework code itself (`core`, `ext`, `styles`, `ux`, `ui`, `web`) is about 60 MB. `public/notes` is 422 MB.
- `usage.jsonl` is 184 KB / 1,410 lines: not a size problem. Say so and whether to keep committing it.
- `.gitignore` already excludes `**/shots/`, recordings, snapshots. Check what large committed blobs remain anyway.
- A backup of the full repo (working tree + .git + a `--all` bundle) is at `E:/Projects/lew42/monorepo-2026-10-13/`, taken 2026-10-13 before any change.

## Deliverable: `public/framework/ai/doc/repo-size.md` (one screen, then sections) linked from `public/framework/ai/readme.md`

1. **Measure, by script** (`Server/repo-size.mjs`, a class if it has state; Haiku minions may run pieces, but the numbers come from the script): (a) committed history by top-level path: walk `git rev-list --objects --all` through `git cat-file --batch-check`, sum blob sizes per directory 2–3 levels deep, top 25; (b) working tree by directory; (c) the 30 largest committed files and their type; (d) how much of `.git` is sessions, screenshots, notes, code. Two numbers that must agree (pack size vs summed blobs, roughly) in the log.
2. **Decide what should not be committed** (a `decision` line each): per category (session task.jsonl, page.jsonl, files.jsonl, screenshots, transcripts, usage.jsonl, notes, health logs): record or machine state? The rule already written is `public/framework/ai/sessions/doc/commit-rule.md`; check it against the numbers and amend it if the numbers say so. Add `.gitignore` lines only for pure machine state with a one-line reason; move nothing.
3. **The phased plan**, each phase with its GB saved, risk, and reversibility: phase 1 stop the bleeding (ignore machine state, LogSweeper or similar for records); phase 2 archive old sessions out of the working tree (where: E: drive, Cloudflare R2/Pages static, or a compacted summary in-repo; the owner wants the trade-offs: cost over time, queryable by a server or not, forgotten-bill risk); phase 3 history rewrite (`git filter-repo` of the sessions store into a `legacy/` branch or a separate archive repo) as an owner decision with exact commands, what breaks (every clone, worktree, GitHub PRs), and the GitHub limits actually in play (100 MB file, 5 GB recommended repo, push size).
4. **Compaction** (ask 4): a short section, not a build: when a JSONL log may be compacted (a landed task with no surprises), what a compacted record keeps (decisions, outcome, links, the delta count), what it loses, and the one rule that keeps the decision path. Mark it a proposal.
5. **The framework's future shape** (ask 9): record both options the owner named (clone a blank-state monorepo vs an npm package that Servex sets up) in `doc/repo-size.md` under "open", with what each needs; no decision, the owner's.
6. Report on your card: the five biggest numbers, the phase-1 actions taken, links.

Fence: `Server/repo-size.mjs`, `public/framework/ai/doc/repo-size.md`, `public/framework/ai/readme.md` (one link line), `public/framework/ai/sessions/doc/commit-rule.md`, `.gitignore`, this task dir. Do not move, delete or rewrite history. Work in a worktree (`take_worktree`) and land with `merge.mjs`. Never measure while the worktree-cleanup task is removing worktrees: measure the MAIN tree's `.git` and `public/` only, which that task never touches.
