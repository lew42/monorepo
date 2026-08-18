# Make a task page say where it is right now

**Laws first: less is more (ASAP), clarity is the one exception, prioritize.**
**Length budget: the change is small. `AITask.js` is 179 lines and should not grow
by more than ~15. Your log entry is a screen, not an essay.**

## The problem, in one line

Mike opened a task page and saw a seven-hour-old status. **A task page has no
current-status line at all.**

## What already exists — read before writing

- `ext/AITask/AITask.js:151` renders the folded `outcome` as markdown. **That is
  the report**, and `finish-task` already mandates it. Don't rebuild it.
- `ext/AITask/card.js:24` — `const current = m => m.now ?? …`. **The card already
  shows `assign.now`. The page does not.**
- The manifest is the fold of every `assign` line, so `now` is always the latest.
  The run task `ai/2026-08-16/mastermind-layout/task.jsonl` has **22 `now` lines
  across 298 entries** — a live worked example to test against.

## The job

**Give the task page a current-status line, above the fold**, from the same
`m.now` the card uses. It should answer "where is this right now" before any
history.

Judgement calls, yours:

- What it shows when a task has **landed** — `now` is stale then, and `outcome` is
  the truth. Prefer showing nothing over showing something wrong.
- What it shows when a task has **no `now`** — most tasks don't write them.
  Nothing is an acceptable answer; a placeholder is not.
- Where "above the fold" actually is, given the existing progress checklist and
  manifest table. ⚠ Don't add a second thing that says what the checklist already
  says — **deleting beats adding.**

⚠ **Do not touch `assign.now`'s meaning or the log format.** This is a rendering
change only.

## Verify

- Against the real run task (`/framework/ai/2026-08-16/mastermind-layout/`) — it
  has 22 `now` lines and is **live right now**, so its status should read as the
  current one.
- Against a **landed** task (any under `ai/2026-08-17/`) and a task with **no
  `now`** — three states, three screenshots, at 1280.
- Zero console errors. `node --check` anything you edit.

## Files you own

- `public/framework/ext/AITask/**`
- `public/framework/ai/2026-08-17/task-status/**` — your task dir.
- `usage.json`, `2026-08-17/day.jsonl` — the `new-task` skill's own writes.

**Fenced:** everything else. ⚠ Another agent is writing a report page under
`ai/2026-08-17/report/`; don't edit it. ⚠ Do not regenerate the audit baselines.

## Deliverables

1. The status line, working across the three states, with the screenshots.
2. `ext/AITask/readme.md` updated if it describes what a task page shows.

Short on room? Cut 2. Never ship 1 unverified against a landed task — showing a
stale `now` as if current is the exact bug you are fixing.

Findings go in your own `task.jsonl` as `log` lines, never a `findings.md`.

## Notes

- Foreground is the default; if you background something, poll it.
- Capturing is synchronous — no DOM after an `await`; fill inside a callback.
- ⚠ CSS: every rule inside a layer. Per the current CLAUDE.md **the layer order
  lives once, in `framework.css`** — do not restate it in a module stylesheet.
- Reuse the dev server on port 80; don't restart it. Assert
  `document.visibilityState === "visible"` before a screenshot.
