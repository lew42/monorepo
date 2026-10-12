# Minion D — questions.json stays in its own tree; merge.mjs refuses a page change with no report

Load the `minion` skill, then `code`. Parent: task-mastermind-review. Task: `public/framework/ai/2026-09-30/review/requirements.md`.

**Work ONLY in the worktree `C:/Code/lew42/worktrees/review`.** Commit by exact path (the worktree has ~230 unrelated dirty files.jsonl files: never `git add .` or `commit -a`). Every spawn sets `windowsHide: true`.

## Deliverables (two separate commits)
1. **`Server/review.mjs` `--questions`** (commit 1):
   - It must read the skills from, and write `public/framework/ai/review/questions.json` into, the tree THIS review.mjs lives in (resolve from `import.meta.url`), never the main root computed from `--git-common-dir`. Today a worktree's review.mjs run with `--range` wrote an empty `questions.json` into the main tree (0 systems, because the main tree has no questions.md yet).
   - Write the file only when the systems/questions changed (compare everything except `generated_at`), so a review run doesn't dirty git with a new timestamp every time.
   - Check: `node Server/review.mjs --questions` twice in the worktree — the second run says "unchanged" and `git status public/framework/ai/review/questions.json` is clean.
2. **`Server/merge.mjs`, the review gate only** (`reviewGate`, commit 2, on its own): when the branch's diff touches a page (reuse `pageUrlFor` from review.mjs — import it next to `sizeOf`) and the review line found (`best`) has no `report`, or `path.join(best.td, best.e.review.report)` doesn't exist, return `refused: ${branch} changes a page and its review has no report (review/report.md, with shots at 400/1200/1920/3440); run: ${cmd}`. Keep every other line of merge.mjs as it is (another agent edits its smoke path). Update the REVIEW GATE paragraph of the header comment in one sentence. Add one sentence to `Server/doc/review.md`'s "The merge gate" section.
   - Check: `node --check Server/merge.mjs`; then a dry reasoning check: my branch `worktree/review` touches `public/framework/ai/review/page.js`, so it now needs a report. Do NOT run merge.mjs itself.

Reply one line per commit (hash + what), then stop.
