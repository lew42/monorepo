# pg-tree — migrate the Playground tree pane to ux/Tree

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. A SIBLING MASTERMIND IS GATED ON THIS — it lands early, small, and loud.

## Mission

Migrate ext/Playground's tree pane from the old `ui.tree` to `ux/Tree`. Exactly two call sites (verified this morning): `Playground.js:170` (`tree()` render + its select listener wiring) and `Playground.js:184` (`.select()` marking on selection change) — line numbers may have drifted a few lines with today's edits; the calls are what they are. Behavior must be identical: pane renders the doc hierarchy, clicking a row selects the node (sidebar follows), selection marks follow programmatic selects, and the pane survives an add/remove cycle.

- `ux/Tree` is **READ-ONLY**: import it, never edit it. Read its readme/page.js first for the real API. If the migration genuinely needs a Tree change, STOP that path: document exactly what is missing (API + one-line use case) in your task.jsonl and report it — the sibling owns Tree and the supervisor relays. Do not work around with a fork or a patched copy.
- Styling: keep the pane looking sane in `playground.css` (you own it this run) — minimal adjustments only, every rule in a layer, class names prefixed `pg-` (`new-css-class` skill for any new name).

## Prove it (ui-test; two numbers that must agree: gestures scripted = pngs taken)

Runner: `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json` against `http://localhost:8917/framework/ext/Playground/` (throwaway server up; if dead, background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"`, wait 2s; port-80 dev server DOWN — never touch it). ⚠ NEVER click "New Document" headless. `click sel` no-ops on hover-revealed children — `hover` + coordinate `move/down/up` (skill documents it now). Ignore `ws://` console noise.

- (a) pane renders the seeded hierarchy (png + eval the row count vs `doc.toJSON()` node count — must agree);
- (b) click a tree row → that node selected, sidebar shows it (eval `pg.selected.id`);
- (c) canvas-select a node → tree mark follows;
- (d) add a child via hover `+`, then remove it (toolbar ×) → tree shows it then loses it, no dead listeners (console clean both steps).

## Fences + conventions

- You OWN: `ext/Playground/Playground.js`, `playground.css`, + this task dir. NOT `documents.js`/`toolbar.js` (sibling running NOW — if your Playground.js edit needs a toolbar/documents seam, log it and report, don't edit). NOT `canvas.js`/`items.js`/`properties.js` unless a one-line seam, logged. `ux/Tree` read-only.
- Load `code` + `css` skills before editing. No DOM after an `await`. No backtick inside `css(...)`. `**/` closes a block comment. Imports resolve against `import.meta`.
- Task log `task.jsonl` line 1 via Write tool: `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-tree", "group": "panels", "request": "migrate Playground tree pane to ux/Tree (2 call sites); sibling gated on it", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.40}, "now": "starting", "steps": ["read ux/Tree API", "migrate call sites", "ui-test proofs", "report"], "step": 1}}` — clock-read timestamps in the writing command; ASCII-only Add-Content appends; forward slashes; never backslash-escape backticks or `$`.
- The INSTANT your proofs pass, append a log line: `TREE MIGRATION LANDED - ui.tree retirement unblocked` (before the doc tidy, before the landing line).
- **Safety, absolute:** never kill/restart any server; never start anything on port 80; never drive the owner's live tabs; never `git stash`/commit/push; scratch in the scratchpad prefixed `pg-tree-`. Skill let you down → `skill-improvement`, one line.

## Report back (one screen)

Landed or blocked (if blocked: the exact missing Tree API). File:line of both migrated call sites, the four proofs with png paths (≤3 pngs copied here), any styling notes. Cut order: (d)'s remove half, then (c) — never (a)/(b).
