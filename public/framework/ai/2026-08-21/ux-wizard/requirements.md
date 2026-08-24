# ux-wizard — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** the page leads with the thing itself; final report = one screen, clickable paths.

## The job

`ux/Wizard` — the generic multi-step engine: steps, next/back, progress, validation gate per step, keyboard (Enter advances, arrows where sane), responsive phone ↔ 3440. Lessons/chapters/courses and multi-step signup will all extend THIS later, so the base must be small and every method a seam. You also run the run's one sanctioned **mixin experiment** (owner's ask).

## Read first (they ARE the contract)

1. `public/framework/ux/readme.md` + `public/framework/ux/doc/system.md` — tier rules: a ux is a class; variants are NAMED subclasses (never Wizard2); a ux imports ui/ templates, never the reverse; a ux never ships its own compact/contrast (config words do that).
2. The `code` skill (load it) — assign-based constructor, parts as static subclasses (`Wizard.Step = class WizardStep extends View`), reach parts via `this.constructor.Step` so subclasses can swap them.
3. `public/framework/ui/progress/page.js`, `ui/crumbs/page.js`, `ui/field/page.js` — templates to compose for the step indicator and step bodies.
4. `public/framework/ux/Wizard/page.js` — a stub I planted so the route exists; replace its content, keep the blessed shape.

## Deliverables (priority order)

1. **`ux/Wizard/Wizard.js`** — `class Wizard extends View`. Steps declared by the caller (composition: a step = a title + a content function + an optional validate seam); state = current index + collected values; methods `next() back() go(i) done()` — each a seam. Step indicator composed from ui templates (dots/crumbs at phone width, labeled list where room). No persistence, no router coupling — ASAP.
2. **The demo** — `ux/Wizard/page.js`: a real 3–4 step wizard live on the page (e.g. a project-setup flow: name → options → confirm), plus the words proof (same wizard wearing `ui-contrast ui-compact`). `readme.md` + `doc/` per the documentation skill.
3. **The pattern experiment (owner's explicit ask — do it honestly):** pick ONE optional feature (keyboard nav is ideal) and build it BOTH ways:
   - a) `class WizardKeys extends Wizard` — named extension;
   - b) a mixin applied via `Object.assign(Wizard.prototype, keys_mixin)` (the owner calls this `Class.prototype.assign(mixin)`).
   Record the verdict in `ux/Wizard/doc/decisions.md` with EVIDENCE (lines of code, what breaks when both mixins want `init()`, can a mixin be removed, does the subclass form compose with `this.constructor.*` parts) — not taste. Ship whichever won as the real feature; keep the loser's code in the doc as a fenced block, not a live file.
4. **Responsive**: 360 = single column, indicator compact, buttons thumb-reachable; 3440 = the wizard must own its space (the `layout` skill's questions answered in one line each in your task log BEFORE building — hint: a step body is a reading column, `.measure`; a side rail listing steps is a fine large-screen answer).
5. **Verdict lines** (task.jsonl `log`, prefix `lesson:`) — these feed skill-suggestions and `ux/doc/decisions.md` at harvest.

## Rules

- **Scope fence — yours alone:** `ux/Wizard/**` only. READ-ONLY: everything else — `ux/page.js`, `ux/readme.md`, `ux/doc/**`, `ui/**`, `core/**`, `styles/**` (framework.css change = written proposal in your task dir). Auth flows belong to a sibling (`ux/Auth`) — your demo content must NOT be a signup form.
- **CSS: as little as possible.** Utilities + ui classes + tokens; if a class is truly needed: `new-css-class` skill first (its `styles/css-scopes.txt` append is a permitted write), classes `ux-wizard-*`, one `css()` call in `Wizard.js`, inside a layer.
- Load skills: `code`, `css`, `layout` before writing; `new-page` per page.js; `documentation`; `finish-task`; `skill-improvement` when a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-wizard/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends Add-Content ASCII ONLY (no em dashes); never a findings.md.

## Verification (before landing)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server you find. Static server already serves public/ at **http://localhost:8918** (never kill it). Screenshot recipe (proven):
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/Wizard/ <out.png> <width>` — prints overflow_x + console errors. ⚠ Ignore only the repeated "WebSocket connection to ws://localhost:8918" error (LiveReload noise); any other console error is yours. Shoot 360 / 768 / 1280 / 3440 (`ux-wizard-*` in the scratchpad). Prove the interaction: drive next/back/keyboard headless (the ui-test skill: `.claude/skills/ui-test/SKILL.md`, drive.mjs plan.json — shot after every gesture). Money shot (mid-wizard, step 2 of 3, indicator visible) into this task dir, linked in the landing line.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps that never throw

No DOM after an `await` — a `next()` that awaits validation then builds the step loses the captor: capture the step box synchronously, fill in a callback; every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; a page method named `render()` collides with core; `classify()` classes every constructor in the chain — don't name a subclass a layout word; `.append(fn)` passes the View to a bare reference — wrap in `() =>`; a declared child without a page.js 404s; resolve URLs against `import.meta`.

## Cut first if squeezed

The mixin experiment's write-up depth → the 4th step → keyboard breadth (keep Enter). Never cut: a working 3-step wizard, both-ways experiment attempted, 360/3440 proof.
