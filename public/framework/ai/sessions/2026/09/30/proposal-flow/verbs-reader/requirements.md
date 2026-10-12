Budget: $5

# verbs-reader — the reader knows every legitimate verb; flat lines render plain

Item 12(b) of [../requirements.md](../requirements.md). Loading `/framework/ai2/` prints `JSONL: unknown verb …` for lines that parse but do not fit: flat lines (`{"at","task","msg"}` in day.jsonl; `{"type":"launch"}`, `{"type":"decision"}` in old task logs) and verbs the skills teach but the reader lacks (`experiment`, `review`).

## Fence
`public/framework/ext/JSONL/` (JSONL.js, readme.md, doc/, its page.js and demos). If the task-line renderer lives elsewhere (follow `static verbs` in JSONL.js to the subclass that draws a task log), name that file on the card before touching it, and keep the change to the render of the two new verbs.

## Build
1. Register `experiment` and `review` and render each in one line: experiment → "try → measure → result"; review → "review: found N, real M, fixed K".
2. A line with no known verb but a `msg` or `text` (and a `type` or `at`) renders as a plain log line — no warning. Keep the warning for a line that fits nothing.
3. The validated-writes minion is adding the same verb lists to `.claude/hooks/jsonl-schema.mjs`; keep JSONL.js's `static verbs` arrays as plain literal arrays so its test can read them.

## Proof (on the card)
- Headless load of `/framework/ai2/` and `/framework/ai/` in the worktree: zero `unknown verb` warnings in the console (paste the count before and after).
- A shot showing an `experiment` and a `review` line rendered.

## How you work
- Load the `minion` skill first, then the `code` skill. Read the readme chain for every directory you touch (`/framework/ai/readmes/`).
- Work ONLY in the worktree `C:/Code/lew42/worktrees/proposal-flow` (branch `worktree/proposal-flow`, its server `http://localhost:62566/`). Never edit the main tree. Other minions share this worktree with their own fences — touch only your files.
- Commit each piece as soon as it works, by exact path, on this branch. Do not merge: say "ready to merge" on the card and the mastermind merges.
- Every look is headless (`mcp__site__shot` or Playwright). Never touch the owner's tabs.
- Log with the validated route only: `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` or Servex `append_log`. Never `echo >>`.
- Report on the card `2026/09/30/proposal-flow-main-is-production-then-pr` (card_reply): two sentences at start, at "ready to merge" with the proof links, and if blocked. Nothing else goes to the mastermind.
- The owner's words are verbatim in `public/framework/ai/2026-09-30/proposal-flow/owner-words.md` (last section). Re-read them before you start; build what they say.
