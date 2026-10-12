# pg-baseline — the before-picture

**Three laws (CLAUDE.md rules all):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** your report to the mastermind is one screen; findings are `log` lines in your task.jsonl, never a findings.md. Copy at most 4 decisive pngs into this dir.

## Mission

Drive the CURRENT ext/Playground headless and document the zero-to-hero flow as it exists. Every later change is measured against this. You change NOTHING in the Playground — read-only on all of `public/` except this task dir.

## Setup (proven, use as-is)

- The owner's dev server (port 80) is DOWN. A throwaway static server is already running at **http://localhost:8917** (serves `public/` with index.html fallback). If it answers nothing, start it: `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"` in background. NEVER touch port 80.
- ui-test runner (load the `ui-test` skill): `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json`. Page: `http://localhost:8917/framework/ext/Playground/`. `.pg-canvas` exists (smoke-tested); `.playground` does not.
- Expected console noise at 8917: `WebSocket connection to 'ws://localhost:8917/' failed` — LiveReload, ignore it. Any OTHER console error is a finding.
- Plans + out dirs in the session scratchpad, prefixed `pg-baseline-`. Scratch never goes in the repo.

## Experiments (in order; each = one plan, pngs after every step)

1. **Selection + sidebar.** Click boxes in the canvas and in the left tree; eval the selected element + dump which sidebar sections/fields are visible. What does selecting nothing show?
2. **The owner's called shot — sibling vs child.** For each of +FLEX, +GRID, +BOX: press it with (a) nothing selected, (b) a top-level box selected, (c) a nested box selected. After each press, eval the tree structure (parent/child of the new box). Produce a 9-cell table: button x selection state → where the new box landed. Consistent or not is THE headline.
3. **Zero-to-hero count.** From a fresh/empty document (find how — the "untitled" doc dropdown; note if you can't get to empty), build a holy-grail shell (header / left main right / footer) with the current UI. Count every gesture (click, type, select). The count is the score.
4. **Resize/drag.** Is there ANY resize affordance on boxes or columns today? Try dragging a box edge. Expect nothing; record what happens.
5. **Persistence note.** Saves go to the dev server which is down — note whether save failures throw and whether they break interaction (don't fix anything).

## Task log

This dir already exists. Write `task.jsonl` line 1 yourself (Write tool, NEVER Out-File/Set-Content): `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-baseline", "group": "panels", "request": "baseline the current Playground zero-to-hero flow", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.0}, "now": "starting", "steps": ["setup+selection", "sibling-vs-child table", "zero-to-hero count", "resize+persistence", "report"], "step": 1}}`. Append findings as `{"log": {"at": "<clock ISO>", "msg": "..."}}` with Add-Content. Timestamps from the clock. Forward slashes in JSON paths. Never backslash-escape backticks or `$`.

## Safety (absolute)

Never kill or restart the dev server. Never start anything on port 80. Never drive the owner's live browser tabs (drive.mjs has its own browser). Never `git stash`, commit, or push. If a skill misleads you, one evidence line via the `skill-improvement` skill.

## Report back (one screen)

The 9-cell table · gesture count to holy-grail · sidebar inventory (which fields always show) · any real console errors · paths to your out dirs + the ≤4 pngs you copied here. Cut experiment 4 first if time bites.
