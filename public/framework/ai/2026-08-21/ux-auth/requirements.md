# ux-auth — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** the page leads with the thing itself; final report = one screen, clickable paths.

## The job

`ux/Auth` — the first real ux workflow: login, signup, password reset, and a social-login row, as ONE behavioral class assembled from ui/ templates, responsive phone ↔ 3440. This is the exemplar of "ux/ hands you a class you can extend" — its shape will be copied, so keep it clean and small.

## Read first (they ARE the contract)

1. `public/framework/ux/readme.md` + `public/framework/ux/doc/system.md` — the tier rules: a ux is a class; every method a seam; variants are NAMED subclasses (never numbers); a ux imports ui/ templates, never the reverse; a ux NEVER ships its own compact/contrast mode (config words do that).
2. The `code` skill (load it) — assign-based constructor, parts as static subclasses (`Auth.Form = class AuthForm extends View`), reach parts via `this.constructor.Thing`, ~100 lines is a signal not a rule.
3. `public/framework/ui/field/page.js`, `ui/dialog/page.js`, `ui/alert/page.js` — the templates you compose.
4. `public/framework/ux/Auth/page.js` — a stub I planted so the route exists; replace its content, keep the blessed shape.

## Deliverables (priority order)

1. **`ux/Auth/Auth.js`** — `class Auth extends View` (import from `../../core/View/View.js` or `/app.js` — check how ext/ classes import View and copy that). Screens: login, signup, reset, each a method/part; view switching ("Create account" ↔ "Sign in" ↔ "Forgot?") is the behavior that earns the class; inline validation (required, email shape, min length — `:user-invalid`-first, JS only where CSS can't) with `ui/alert` for errors. Social row = buttons handed markup-style (no fake OAuth — `data-provider` and a seam method `social(provider)` a subclass overrides).
2. **One named extension proving the pattern** — e.g. `class MagicAuth extends Auth` (magic-link: replaces the password field with a "send link" flow) — a page under `ux/Auth/` showing base and extension side by side, or as a child page (declare it in Auth's own page.js `children:`).
3. **`ux/Auth/page.js`** — the demo: the workflow live on the page, big; a words proof (the same Auth wearing `ui-contrast ui-compact`); markup/source shown demo.exhibit-style. `doc/` + `readme.md` per the documentation skill.
4. **Responsive**: phone (360) = single column; 3440 = the form must not be a lost postage stamp — the `layout` skill's questions, answered in your task log in one line each BEFORE building. (Hint: `.measure` caps a reading column; a solo auth card centers against a `wash` ground.)
5. **Verdict lines** (task.jsonl `log`): does the named-extension pattern hold up for workflows? Evidence, not taste — these feed `ux/doc/decisions.md` at harvest.

## Rules

- **Scope fence — yours alone:** `ux/Auth/**` only. READ-ONLY: everything else — `ux/page.js`, `ux/readme.md`, `ux/doc/**`, all of `ui/**`, `core/**`, `styles/**` (framework.css change = written proposal in your task dir). Do NOT build a multi-step/wizard engine — a sibling owns `ux/Wizard` today; your flows switch views, they do not step.
- **CSS: as little as possible.** Compose utilities + ui classes; words give you density/contrast free. If a class is truly needed: `new-css-class` skill first (its `styles/css-scopes.txt` append is a permitted write; register the `ux-` prefix per its process — first ux ever named), classes `ux-auth-*`, one `css()` call inside `Auth.js`, inside a layer.
- Load skills: `code`, `css`, `layout` before writing; `new-page` per page.js; `documentation`; `finish-task`; `skill-improvement` when a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-auth/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends Add-Content ASCII ONLY (no em dashes); lessons as `log` lines prefixed `lesson:`; never a findings.md.

## Verification (before landing)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server you find. Static server already serves public/ at **http://localhost:8918** (never kill it). Screenshot recipe (proven):
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/Auth/ <out.png> <width>` — prints overflow_x + console errors. ⚠ Ignore only the repeated "WebSocket connection to ws://localhost:8918" error (LiveReload noise); any other console error is yours. Shoot 360 / 768 / 1280 / 3440 to the scratchpad (`ux-auth-*`); prove the INTERACTION too — the ui-test skill (`.claude/skills/ui-test/SKILL.md`, drive.mjs plan) or a small Playwright script: click "Create account", shot; submit empty, shot the validation. Money shot into this task dir, linked in the landing line. A claim without a screenshot is not a result.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps that never throw

No DOM after an `await` (capture the box synchronously, fill in a callback — an async submit handler that then builds DOM is the classic); every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; a page method named `render()` collides with core — pick another name unless deliberately overriding; `classify()` adds a class per constructor in the chain — a subclass named like a layout word (`Card`, `Rail`, `Grid`) wears that CSS, prefix it; `.append(fn)` passes the View to a bare reference — wrap in `() =>`; a declared child without a page.js 404s; resolve URLs against `import.meta`.

## Cut first if squeezed

The named extension → social row polish → reset flow. Never cut: login+signup switching live, validation, 360/3440 proof.
