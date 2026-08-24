# pg-shift — Shift-click + adds a Flex; strict recount target ≤ 9

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. This is a small feature + a measurement — do not gold-plate.

## The decided rule (owner-approved, supervisor-chosen; do not re-litigate)

Explicit beats magic: **Shift-click on any `+` adds a Flex instead of a Box** (a Box holding two children stays legitimate — no auto-convert). Same modifier on the toolbar `+`. Long-press for touch ONLY if cheap AND provable headless — cut it first, a proven boundary beats a maybe.

## Context

- The hover `+` click branch lives in `canvas.js` (delegated listener, branches on `.pg-add` → `pg.add_to(owner, Type)`); the toolbar `+` is `toolbar.js` → `pg.add(Box)`. Read the event's `shiftKey`, pass `Flex` instead of `Box`. `add_to(into, Type)` already takes the Type (`Playground.js:227-240` this morning — may have drifted a few lines).
- History: the one-`+` toolbar made Flex creation cost add+convert (2 gestures, was 1 with the old `+FLEX`) — strict holy-grail count regressed 10 vs 9 (proof: `../pg-hero/`). Shift-click is the chosen fix.
- Document the modifier in the one place the `+` is documented: the `readme.md` Use line + the `pg-placeholder` section of `doc/decisions.md` (adjust the add+convert watch-out — it is now escapable).

## The measurement (the point of this task)

Re-run pg-hero's STRICT apples-to-apples holy-grail scenario — nested wrapper, NOT reusing the seeded flex root; read pg-hero's scenario definition from `../pg-hero/task.jsonl` + its scratchpad plans (`pg-hero-*`) so the comparison is honest — with Shift+ available. **Target ≤ 9 gestures** (the old UI's number). A Shift-click counts as ONE gesture. Report the strict count with the same gesture-counting rules (click/drag/typed-value = 1 each; state-reset evals = gesture 0). Gestures scripted = pngs taken, per plan.

Headless modifier mechanics: drive.mjs's `key` verb presses-and-releases — a HELD Shift during click may need new `keydown`/`keyup` verbs. The ui-test skill's own rule: copy `drive.mjs` to the scratchpad only if you need to change it — do that (`pg-shift-drive.mjs`), add held-modifier verbs there, never edit the skill's copy. If Playwright's `page.keyboard.down("Shift")` + coordinate `down/up` carries `shiftKey` into the pointer event (it should), that is the real gesture — prefer it over a synthetic eval-dispatched event; fall back to eval-dispatch (`new MouseEvent("click", {shiftKey:true, bubbles:true})`) only if held-modifier driving genuinely fails, and say so.

## Prove it

Server: `http://localhost:8917/framework/ext/Playground/` (up; if dead, background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"`, wait 2s; port-80 dev server DOWN, never touch). Known traps: quote spaced selectors; `type` sel is one bare token; `click sel` no-ops on hover-revealed children → hover + coordinate move/down/up on a SHALLOW leaf's + (nested-+ hover transit shifts targets — proven today); never click "New Document"… actually it no longer hangs (pg-save fixed it) but don't lean on it, force state via eval.

- (a) Shift-click a hover `+` → new child is a Flex (eval `type`), plain click still adds a Box — both proven in one plan;
- (b) Shift-click toolbar `+` → Flex under the add rule;
- (c) the strict recount, ≤ 9 or the honest number with the blocking step named;
- (d) the sidebar shows the flex section for the shift-added node (one png doubles as (a)'s evidence).
≤3 pngs copied into this task dir, prefixed `pg-shift-`.

## Fences + conventions

- You OWN: `ext/Playground/canvas.js`, `toolbar.js`, `readme.md`, `doc/decisions.md` + this task dir. NOT `Playground.js`, `playground.css`, `items.js`, `properties.js`, `documents.js` (one-line seam allowed in Playground.js ONLY if `add_to` truly can't take the Type — it can — log any seam).
- Load `code` skill before editing. Every CSS rule in a layer (you should write none). Task log line 1 via Write tool: `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-shift", "group": "panels", "request": "Shift-click + adds Flex; strict holy-grail recount target <=9", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.46}, "now": "starting", "steps": ["read canvas/toolbar", "shift branch", "proofs a-b-d", "strict recount", "docs+report"], "step": 1}}` — clock-read timestamps in the writing command; ASCII-only Add-Content appends; forward slashes; never backslash-escape backticks or `$`.
- **Safety, absolute:** never kill/restart any server; never start anything on port 80; never drive the owner's live tabs; never `git stash`/commit/push; scratch in the scratchpad prefixed `pg-shift-`. Skill let you down → `skill-improvement`, one line.

## Report back (one screen)

File:line of the two branches, proofs a/b/d png paths, the strict count vs 9 with the per-gesture list, whether held-Shift drove for real or eval-dispatch was needed, long-press shipped or cut.
