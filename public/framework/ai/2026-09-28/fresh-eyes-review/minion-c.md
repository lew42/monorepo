# Minion C — answer the fresh-eyes review of this task

Load the `minion` skill first. Task dir: `public/framework/ai/2026-09-28/fresh-eyes-review/` (main tree, C:\Code\lew42\monorepo). Read `requirements.md`, then `review.md` there — a fresh Opus reviewed this task's own branch and found what follows. Work ONLY in the worktree `C:\Code\lew42\worktrees\fresh-eyes-review` (branch `worktree/fresh-eyes-review`); commit there with `git add <file>` by name (`Server/smoke.mjs` sits there untracked on purpose — never add it). Do not merge.

**Fence:** `Server/review.mjs`, `Server/merge.mjs` (the review lines only, and keep every line of the main tree's `C:\Code\lew42\monorepo\Server\merge.mjs` verbatim in yours — additions only, never rewording, or the landing conflicts), `Server/doc/review.md`. Every spawn keeps `windowsHide: true`.

## Do

- **Findings 1, 2, 3, 4 (the `[fix]` ones):** fix each as the review says. For 3: pass the reviewer every file `requirements.md` names as the owner's words (a line containing "Owner's words" and a backticked path, resolved under `public/framework/ai/`), besides the card dir.
- **Notes 7, 8, 10, 11:** do them. 8: when no review exists, guess the task dir as `public/framework/ai/<a recent day>/<slug>` where the branch is `worktree/<slug>` and that dir exists; print the full command. 10: export `pageUrlFor`, `worktreeBase` and the diff parsing from review.mjs once and import them in merge.mjs — but merge.mjs's existing lines must stay verbatim (add the import; leave its own copies if removing them would reword a main-tree line, and say so).
- **Notes 5 and 6:** one sentence each in `Server/doc/review.md` (why an ancestor review with every fix answered counts as current — no second round, per the brief; the card phrase comes from `--status` at landing).
- Then answer every finding in the MAIN tree's task.jsonl with `node .claude/hooks/append.mjs`, one line each: `{"review":{"answer":{"n":N,"reply":"fixed"}}}` or `"declined: <why>"`. Decline 9 (on-landing.mjs does write `<taskdir>/layout-check/<slug>/`, so the reuse path matches after a landing; merge.mjs's 1920 shot is of the final head, a different moment) and 12 (a cost report, nothing to change).
- Prove: `node Server/review.mjs --status <taskdir>` prints `reviewed: 10 fixed, 2 declined`; rerun `node Server/merge.mjs . --dry-run --no-review "dry run"` from the worktree — every file WRITE, none conflict. Paste both outputs in your report to your parent.

Length budget: about 40 changed lines.
