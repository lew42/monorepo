# Ask 7 — fix round report

All 11 review findings answered in `task.jsonl` (`review.answer` lines). 10 fixed, 1 noted (punctuation, item 1 — the
seat's own job, not this view's). Detail and history: [`ux/Dictate/doc/question-cards.md`](/framework/ux/Dictate/doc/question-cards.md).

## What changed (branch `worktree/voice-qcards`)

- **744656305** — live answer redraw (`find_answered_ids`), refs box never drifts mid-chat (insert-before-refs), real "far-off" (`{threshold, max}`), reference only for a drawn card, `check(..., true)` folded into a real check. `ext/Chat/v3/{placement,ChatV3}.{js,test.mjs}`.
- **2a56f0fae** — a repeated Question links (`also_from`) instead of refusing; sibling lines in the same write are never dropped. `Servex/agents/page_tools.js`, `public/framework/core/Task/Question.js`, `Servex/agents/Question-dedupe.test.mjs`, `Question.test.mjs`.
- **f4015eb79** — `ux/Dictate/doc/question-cards.md` (new); stale lines fixed in `ext/Chat/v3/readme.md`, `ux/Dictate/readme.md`, `Servex/agents/session-smart.md`.
- `plan.md` copied into this folder (finding 7).

## Tests (run for real, this session, against the worktree's own server — port from `.worktrees.json`)

- `placement.test.mjs` — **37/37**
- `ChatV3.test.mjs` (headless Playwright) — **36/36**, screenshots at 400/1200 (`/tmp/ask7-fix4-shots/`, local to the run)
- `Question.test.mjs` — **8/8**
- `Servex/agents/Question-dedupe.test.mjs` — **15/15**
- `Servex/agents/item_tool.test.mjs` — **118/118** (unaffected, re-checked)

## Unproven / left as noted

- Item 1's punctuation fix: real, but lives in the smart seat's brief, not this view — no test here (finding 8).
- A root-level Question add (not nested under a Prompt) never reaches the dedupe guard — not the documented usage shape, noted in `question-cards.md`.
- V1's own Question row (move-to-end) is untouched — a separate, already-reviewed decision.
