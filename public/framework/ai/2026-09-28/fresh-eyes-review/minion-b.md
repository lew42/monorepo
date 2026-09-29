# Minion B — the review's doc and its one-line skill edits

Load the `minion` skill first, then the `content` skill (everything you write, the owner reads). The task: `public/framework/ai/2026-09-28/fresh-eyes-review/` — read `requirements.md` there first, then `minion-a.md` beside it: minion A is building `Server/review.mjs` and the `merge.mjs` gate to exactly that interface, at the same time as you. Describe that interface; do not wait for A's code. The card with the raw conversation: `public/framework/ai/2026/09/28/fresh-eyes-review-built-into-every-task/`.

**Work only in the worktree** `C:\Code\lew42\worktrees\fresh-eyes-review` (branch `worktree/fresh-eyes-review`). Commit there, only your own files (`git add <your files>`, never `-A`: minion A commits in the same tree). Do not merge. Log to the MAIN tree's `C:\Code\lew42\monorepo\public\framework\ai\2026-09-28\fresh-eyes-review\task.jsonl` with `node .claude/hooks/append.mjs`.

**Fence (the only files you write):** `Server/doc/review.md` (new), `Server/readme.md` (one short paragraph), `.claude/skills/finish-task/SKILL.md`, `.claude/skills/sub-mastermind/SKILL.md`, `.claude/skills/minion/SKILL.md` — one line each in the skills, where they already talk about landing.

## Deliverables

1. **`Server/doc/review.md`** — one screen. Its picture is the three-sizes table from requirements.md (none / light / full: when, who reviews, what it looks at). Then, in plain sentences: why a fresh agent (the owner's reason: the author agrees with itself); the one command (`node Server/review.mjs <taskdir> [<worktree>]`); how findings are answered (`{"review":{"answer":{"n":2,"reply":"fixed"}}}` or `"declined: <why>"`, the task mastermind judges declines, no second round unless a decline is doubted); that merge.mjs refuses a light/full branch without a current review or with an unanswered fix finding, and prints the command; `--status` gives the phrase the card shows. A "Later" line: `--model` is there so the reviewer can be another model family (OpenRouter).
2. **`Server/readme.md`**: a short paragraph in the same style as the others, `**node Server/review.mjs <taskdir>**` — what it does in one sentence, link to `doc/review.md`.
3. **Skills, one line each:**
   - `finish-task`: before the landing line, run `node Server/review.mjs <taskdir> <worktree>` (sizes none/light/full, see Server/doc/review.md), answer every finding, then put `node Server/review.mjs --status <taskdir>`'s phrase ("reviewed: pass" / "reviewed: 2 fixed, 1 declined") and a link to review.md in the outcome.
   - `sub-mastermind`: when splitting the task, decide its review size; after the minions deliver and before merge.mjs, run the review and judge any declined finding.
   - `minion`: a reviewer's finding is answered in task.jsonl as `fixed` or `declined: <why>`, never debated.
4. Reply to your parent with the paths you changed. Length budget: the doc under 60 lines; each skill edit one line.
