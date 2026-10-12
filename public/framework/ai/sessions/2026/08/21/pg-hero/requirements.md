# pg-hero — the zero-to-hero proof + doc consolidation

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. The deliverable is three gesture-counted filmstrips; the count is the score.

## The goal (owner, verbatim)

"here's the thing, we want the Playground to be able to produce ANY type of layout, as quickly as possible."

## What the waves landed (all proven; do not re-litigate)

One `+` toolbar button; hover `.pg-add` placeholder in every box that adds an in-place child; minimal modular sidebar (7 always-on fields; auto|flex|grid toggles that CONVERT the node in place; flex/grid sections conditional; parent-context item fields); per-axis `hug|fill|fixed`; pad 0 renders 0.25em, quick-add 1em; bg theme-token dropdown; drag handles between flex children (grow distribution; fixed-basis when one flank has a length). Baseline (old UI) scored **9 structural gestures** to a holy-grail shell.

## Part 1 — the proofs (the deliverable)

Script the MINIMAL-gesture path from empty to each layout, with the ui-test skill (`node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json`, page `http://localhost:8917/framework/ext/Playground/`). One plan per layout; drive.mjs shoots after every step, so **gestures scripted = numbered pngs — the two numbers that must agree.**

- **Empty start:** "New Document" HANGS headless at 8917 (Socket.ready — baseline-proven, never click it). Force empty via `eval` using the doc's own remove/data API — read `Playground.js` for the real calls (baseline forced `pg.selected=null` the same way). An eval that resets state counts as gesture 0, not a gesture.
- **(a) Holy-grail app shell:** header / row(nav · main · aside) / footer. Then one drag widening `main` via the resize handle.
- **(b) 3-column dashboard:** three fill columns with gap under a header, bg tokens on the cards.
- **(c) Mobile stack:** at the 400 preset — a column of 4 padded boxes with gap.

Gesture = one click, one drag, or one typed value (typing "header" = 1). Report the three counts and compare (a) against the baseline's 9. If a path is clumsier than the old UI anywhere, SAY SO with the step number — that is a first-class finding, not a failure.

## Part 2 — doc consolidation (after the proofs)

Run the `documentation` skill for ext/Playground. The pg-placeholder wave deferred its doc lines; pg-sidebar/pg-resize already updated readme/decisions/schema — verify currency, fold the placeholder + one-toolbar-+ story in, keep the readme index-shaped (what · Use · Watch out · More) and SHORT. `page.js`: only touch if it misrepresents the current UI (run `new-page` skill if you do). No code changes — a bug a proof exposes gets logged and reported, never fixed here (a truly one-line fix: log it with before/after and do it).

## Fences + conventions

- You OWN: `public/framework/ext/Playground/readme.md`, `doc/*.md`, `page.js` (docs only) + this task dir. Module code (`*.js` except page.js, `playground.css`) is read-only for you. Everything outside Playground read-only.
- Server: 8917 up now; if dead, background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"`, wait 2s. The owner's port-80 dev server is DOWN — never touch port 80. Ignore `ws://` console noise; quote multi-token CSS selectors; drags = `move x y steps` with steps ≥ 10; `click sel` no-ops on hover-revealed children — use `hover` + coordinate `move/down/up` (pg-resize-proven).
- Task log: `task.jsonl` line 1 via the Write tool (never Out-File/Set-Content; ASCII only in appends): `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-hero", "group": "panels", "request": "zero-to-hero gesture-counted proofs for 3 layouts + doc consolidation", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.24}, "now": "starting", "steps": ["read state", "holy-grail proof", "dashboard proof", "mobile proof", "doc pass", "report"], "step": 1}}` — `log` lines, clock timestamps, forward slashes, never backslash-escape backticks or `$`.
- Copy into this task dir: the final png of each layout + the most telling mid-flow png (≤6, prefixed `pg-hero-`). Scratch stays in the scratchpad prefixed `pg-hero-`.
- **Safety, absolute:** never kill/restart any server; never start anything on port 80; never drive the owner's live tabs; never `git stash`, commit, or push. Skill let you down → one line via `skill-improvement`.

## Report back (one screen)

Three gesture counts (+ the baseline-9 comparison) · gestures-scripted vs pngs-taken per plan (must agree) · the final pngs' paths · any clumsy step, by number · doc files touched. Cut order if pace bites: (c) mobile, then the (a) resize-drag flourish — never the counts themselves.
