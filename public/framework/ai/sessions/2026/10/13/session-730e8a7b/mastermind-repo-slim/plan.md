# Plan: the repo-slim run

Current structure: one monorepo, 51 worktrees (47 fully merged), `.git` 752 MB, `public/` 2 GB of which the sessions store is 1.4 GB. The framework code is ~60 MB. Tooling already exists for most of this: `Server/worktree-prune.mjs` (merged-only prune), `Servex/LogSweeper.js` (commits records, needs a restart), `Server/PastWork.mjs`, the Inbox class in `core/Page/ext/Inbox`.

Decisions made by the mastermind (overturnable, see task.jsonl `decision` lines):
- Backup = plain copy + git bundle on E:, before any change. Done 15:53.
- Five tasks, one task mastermind each, fences in each `requirements.md`: worktree-cleanup (Opus), repo-size-plan (Opus), tidy-git-status (Sonnet), past-work-followup (Sonnet), inbox-ranking (Sonnet).
- No restructuring or history rewrite this run; repo-size-plan writes the phased plan and the owner decides phase 3.
- Compaction, archive location and the framework's future shape are written up, not built.
