# pg-placeholder — the hover + that shows where the box will land

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. The deliverable is the working gesture, proven with ui-test pngs — not prose.

## Context (scan-verified)

The add rule is already consistent — toolbar buttons call `pg.add(Type)`; `Playground.js:229` picks `into = is_container(target) ? target : (target?.parent ?? this.doc)`; `is_container` = Flex||Grid (`Playground.js:13`). The owner's "unclear, maybe inconsistent" is a VISIBILITY problem: the destination is never shown. Your + placeholder makes the destination visible-before-click. Do NOT churn the add rule.

Selection: `this.selected` (`Playground.js:104,174`); canvas click select at `canvas.js:18-19`; `repaint()` at `Playground.js:151-156`; canvas renders recursive `.pg-node` divs with style attrs (`canvas.js:37-42`). Data IS the CSS — keep it that way: any new styling flows through the existing schema, chrome-only styling goes in `playground.css`.

## Build (in priority order)

1. **Hover +, every box.** Inside every `.pg-node`, a + placeholder: dashed ghost that resembles the default box it would create, in flow AFTER the last child (so the new child lands exactly where the + sits). Visible only while its box is hovered — CSS `:hover >` visibility, no JS hover tracking. Nested hover comes free: hovering a child keeps the parent hovered, so BOTH show their + (that is the owner's spec, not a bug).
2. **Click = add a child THERE.** Clicking a box's + adds one default Box as a child of THAT box — the + is the destination, selection irrelevant. Stop propagation so the click doesn't also select/re-target. New child gets default styling (current dashed look). Select the new child after add (so the sidebar shows it).
3. **Plain Box can parent.** `is_container` gates only the toolbar rule; canvas renders `items` recursively for every type. Verify a Box with children renders sanely; if it genuinely breaks, log the evidence and scope + to Flex/Grid only — but try first.
4. **Empty boxes stay hoverable.** An empty box must have hover area: give empty `.pg-node`s a min-height (~2em) in playground.css (chrome layer). Watch the owner's named failure: no strange void at the bottom of containers — the + must NOT reserve permanent space (hidden = no layout: `display:none` until hover, or absolutely-positioned overlay if in-flow appearance breaks; prefer in-flow `display:none → block` since the + should occupy the exact landing slot while visible).
5. **Toolbar: ONE + button.** Replace +FLEX / +GRID / +BOX with a single `+` button → `pg.add(Box)` under the existing rule. Leave Insert-layout, viewport presets, dup/×/{}/PASTE alone. (Type switching moves to the sidebar in the next wave — not yours.)

## Prove it (ui-test skill — the numbers must agree: gestures scripted = pngs taken)

Runner: `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json`. Page: `http://localhost:8917/framework/ext/Playground/` (throwaway static server, already up; owner's port-80 dev server is DOWN — never touch port 80; if 8917 is dead: background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"`). Ignore `ws://localhost:8917` console noise (LiveReload). FileSaver dev saves may fail against 8917 — not yours to fix.

Prove, with pngs: (a) hover shows +, unhover hides it; (b) click + → child appears exactly in the + slot, selected; (c) nested: hover a child — child's + AND parent's + both visible; (d) empty box is hoverable; (e) no bottom-void: a container with children and no hover shows no reserved gap (compare heights). Plans/out dirs in the session scratchpad prefixed `pg-placeholder-`; copy ≤4 decisive pngs into this task dir.

## Fences + conventions

- You OWN: `public/framework/ext/Playground/canvas.js`, `toolbar.js`, `Playground.js`, `playground.css` + this task dir. Everything else read-only — `ext/Panel` read-only, `ui/`/`ux/` belong to a sibling mastermind, `properties.js`/`items.js` belong to the NEXT wave (touch only if a one-line seam is unavoidable; log it).
- Load `code` and `css` skills before editing; `new-css-class` before any new class name (prefix `pg-`). Every CSS rule inside a layer. No DOM after an `await`. No backtick inside `css(...)`. `**/` closes a block comment.
- Task log: write `task.jsonl` line 1 with the Write tool (never Out-File/Set-Content): `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-placeholder", "group": "panels", "request": "hover + placeholder that adds an in-place child; toolbar collapses to one +", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.0}, "now": "starting", "steps": ["read module", "hover + build", "one-toolbar-+", "ui-test proofs", "report"], "step": 1}}` — then `log`/`action` lines via Add-Content, timestamps from the clock, forward slashes in paths, never backslash-escape backticks or `$`.
- **Safety, absolute:** never kill/restart any server, never touch port 80, never drive the owner's live tabs (drive.mjs has its own browser), never `git stash`, never commit/push, scratch stays in the scratchpad. A skill that misled you: one line via `skill-improvement`.

## Report back (one screen)

What landed (file:line per change), the 5 proofs with png paths, anything punted + why. Cut first if time bites: (e)'s height comparison, then (d).
