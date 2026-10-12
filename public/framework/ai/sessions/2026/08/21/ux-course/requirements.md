# ux-course — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** the page leads with the thing; final report = one screen, clickable paths.

## The job

`ux/Course` — a whole system: chapters → lessons, a left rail for navigation, a reading column, progress, next/prev — and it is THE large-screen showcase of the program: at 3440 the entire width works as coordinated regions; at 360 it is honestly usable. The owner named this case explicitly ("ux/Course could be a whole ui/ux system for courses").

## Read first (they ARE the contract)

1. `public/framework/ux/readme.md` + `ux/doc/system.md` — a ux is a class, every method a seam, named subclasses never numbers, a ux imports ui/ never the reverse, a ux NEVER ships its own compact/contrast (config words do it).
2. `public/framework/ux/Wizard/Wizard.js` + its `doc/decisions.md` — the steps engine and the run's pattern verdict (subclass beat mixin, with evidence). **Your first design call, made honestly: does `class Course extends Wizard` hold (lessons ARE steps: sequence + gate + advance), or does Course only COMPOSE a Wizard, or neither?** Prototype the extend route first — if it fights you, log the evidence and switch; either way the verdict with evidence goes in `ux/Course/doc/decisions.md`. Do not force it.
3. `public/framework/ux/Auth/doc/decisions.md` — the "seam per composed thing" rule that made extension work.
4. `public/framework/ux/Tree/page.js` — the landed master-detail shape: `.rail` + `.flex-1`, rail takes its own line under 38em of container (core/Page/Page.css). Reuse the machinery; invent nothing.
5. The `layout` skill (load it) — answer its questions in one-line log entries BEFORE building. The five layout words (main/wide/bleed/solo/rail) live in core/Page/Page.css:48-142; `.measure` caps the reading column (framework.css:430).
6. `public/framework/ux/Course/page.js` — a stub I planted so the route exists; replace content, keep the blessed shape.

## Deliverables (priority order)

1. **`ux/Course/Course.js`** — the class. Data: chapters, each with lessons (title + content function; an optional gate only if extending Wizard gives it free). State: current lesson, completed set — on the instance, no persistence (a `Saver` exists in ext/ — do NOT couple to it; note the seam instead). Methods as seams: `go(lesson) next() back() complete()`, rail builder, lesson builder, progress builder — composed from ui templates (`ui/progress`, crumbs, tree or a plain list for the rail — your call, logged).
2. **The demo** — `ux/Course/page.js`: a real small course (use the framework itself as subject matter — e.g. "Learning the template tier", 2 chapters x 3 lessons, honest content a screen long each, pulled as short md strings). Live: click through lessons, complete one, watch progress.
3. **The 3440 story — this is the headline.** Full-bleed layout: chapters rail (left) + reading column (measure-capped, centered) + a third coordinated region on the right where width allows (next-up preview card or the lesson's own mini-TOC — pick ONE, log why). All regions coordinate: selecting in the rail changes the column AND the right region. At 360: the rail stacks above or collapses (the Tree page's honest-wrap answer is fine; a drawer only if reusing ext/drawer machinery outright).
4. **Words proof**: the same course wearing `ui-contrast ui-compact` — zero of its own density/contrast lines.
5. **Verdict lines** in task.jsonl (`lesson:` prefix): the extend-vs-compose verdict and its evidence, what the third region cost, what broke at 3440.

## Rules

- **Fence — yours alone:** `ux/Course/**` only (plus the `new-css-class` skill's `styles/css-scopes.txt` append if you mint a class — `ux-course-*`). READ-ONLY: everything else, including `ux/page.js`, `ux/readme.md`, `ux/doc/**`, `ux/Wizard/**` (if extending Wizard needs a Wizard change, that is a written proposal in your task dir, not an edit — work around it meanwhile).
- **CSS: as little as possible** — utilities, ui classes, tokens, the five layout words. New class only for a relationship/state rule, inside a layer, `new-css-class` first.
- Load skills: `code`, `css`, `layout` before writing; `new-page` per page.js; `documentation`; `finish-task`; `skill-improvement` when a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-course/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends Add-Content ASCII ONLY (no em dashes); never a findings.md.

## Verification (before landing)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server you find. Static server serves public/ at **http://localhost:8918** (never kill it). Proven recipe:
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/Course/ <out.png> <width>` — prints overflow_x + console errors; ⚠ ignore only the repeated ws://localhost:8918 LiveReload error. Shoot 360 / 768 / 1280 / 3440 (`ux-course-*` in scratchpad). Prove the interaction headless (ui-test skill or Playwright: click lesson 2 in the rail, shot; complete it, shot the progress). Money shot = the 3440 full-bleed with all regions alive, into this task dir, linked in the landing line.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps that never throw

No DOM after an `await`; every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; a method named `render()` collides with core unless deliberately overriding (Wizard overrides it deliberately — copy its own-root pattern: style `this`, never a nested wrapper, or config words miss the component); `classify()` classes every constructor — never name a subclass a layout word (`Course` is safe; `Rail` is not); `.append(fn)` passes the View to a bare reference — wrap in `() =>`; an inline custom property (`--gap` etc.) INHERITS into the section below it — bit two builds today; a declared child without a page.js 404s; resolve URLs against `import.meta`.

## Cut first if squeezed

The third region → the gate → chapter 2 depth (keep 2 lessons minimum). Never cut: the working rail-driven course, the 3440 money shot, 360 proof, the extend-vs-compose verdict.
