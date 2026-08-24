# ux-filter — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** the page leads with the thing; final report = one screen, clickable paths.

## The job

`ux/Filter` — a filter bar as a behavioral class (active-filter state is exactly what graduates a template), plus the program's coordinated-regions dashboard demo: one Filter driving several regions at once — stat tiles, a card wall, a table — full-bleed at 3440, honest at 360. The owner's large-screen ask names filters as one of the ways regions coordinate.

## Read first (they ARE the contract)

1. `public/framework/ux/readme.md` + `ux/doc/system.md` — the tier rules (class, seams, named subclasses, ui never imports ux, words do density/contrast).
2. `public/framework/ux/Tree/Tree.js` + its page — the landed wiring precedent: `selected_change(node)` is the ONE wire between a class and the region it drives; the method IS the seam. Filter copies this: `changed(predicate)` (or your better name, logged) is the one wire; the page composes the regions.
3. `public/framework/ui/toolbar/page.js` — the filter toolbar-row variant landed today (segment selection via `.prim`). Your bar is that template plus state; compose `ui/field` for the search input.
4. `public/framework/ux/Auth/doc/decisions.md` — the "seam per composed thing" rule.
5. The `layout` skill (load it) — answer its questions in one-line log entries BEFORE building. `grid auto` / `packed` with `--column` are the wall utilities (framework.css); `.rail` + `.flex-1` the side-rail pattern (rail wraps under 38em of container, core/Page/Page.css).
6. `public/framework/ux/Filter/page.js` — a stub I planted so the route exists; replace content, keep the blessed shape.

## Deliverables (priority order)

1. **`ux/Filter/Filter.js`** — `class Filter extends View`: segments (categories) + a text search; state = active segment + query; every behavior a method (`set(segment) query(text) predicate() changed()`); renders the toolbar filter template + field. It filters DATA the caller gave it or announces a predicate — it never reaches into foreign DOM (log the design line you choose).
2. **The dashboard demo** — `ux/Filter/page.js`, full bleed: one dataset (e.g. the framework's own modules: name, tier, kind, lines — honest data, ~20 rows), ONE Filter instance at top, and THREE regions reading the same filtered result: stat tiles (counts), a card wall (`grid auto`), a `ui.table`. Type "tr" — the wall, the table and the counts all narrow together. That simultaneous narrowing IS the deliverable.
3. **The 3440 story**: the regions spread — filter bar spanning, stats row, wall and table side by side (`.rail`/`flex-1` or a two-column split, your call, logged); at 360 everything stacks, the bar stays thumb-usable, table gets its own `overflow-x: auto` container (the page must never scroll horizontally).
4. **One named extension if it earns itself** — e.g. `FilterChips extends Filter` (active filters shown as dismissable `ui-pill` chips). Park it with a design note in `doc/` if the base + demo ate the time.
5. **Words proof**: the dashboard wearing `ui-contrast ui-compact` (a small duplicated section is fine — the Tree page's words child is the precedent).
6. **Verdict lines** in task.jsonl (`lesson:` prefix): did the one-wire seam hold with THREE consumers; what 3440 needed that 1280 didn't.

## Rules

- **Fence — yours alone:** `ux/Filter/**` only (plus the `new-css-class` skill's `styles/css-scopes.txt` append if you mint a class — `ux-filter-*`). READ-ONLY: everything else including `ux/page.js`, `ux/readme.md`, `ux/doc/**`, `ui/**`, other ux modules (a needed change elsewhere = written proposal in your task dir).
- **CSS: as little as possible** — utilities, ui classes, tokens. New class only for relationship/state, inside a layer, `new-css-class` first.
- Load skills: `code`, `css`, `layout` before writing; `new-page` per page.js; `documentation`; `finish-task`; `skill-improvement` when a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-filter/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends Add-Content ASCII ONLY (no em dashes); never a findings.md.

## Verification (before landing)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server you find. Static server serves public/ at **http://localhost:8918** (never kill it). Proven recipe:
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/Filter/ <out.png> <width>` — prints overflow_x + console errors; ⚠ ignore only the repeated ws://localhost:8918 LiveReload error. Shoot 360 / 768 / 1280 / 3440 (`ux-filter-*` in scratchpad). Prove the coordination headless (ui-test skill or Playwright: type into the search, shot all three regions narrowed; click a segment, shot). Money shot = 3440 with the bar + three live regions, into this task dir, linked in the landing line.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps that never throw

No DOM after an `await` — filtering re-renders regions: capture each region box synchronously, refill in callbacks; every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; a method named `render()` collides with core unless deliberately overriding (style `this`, never a nested wrapper, or config words miss you — bit Wizard today); `classify()` classes every constructor — never name a subclass a layout word (`FilterChips` is safe; `Grid` is not); `.append(fn)` passes the View to a bare reference — wrap in `() =>`; an inline custom property (`--gap`) INHERITS into what sits below — bit two builds today; a declared child without a page.js 404s; resolve URLs against `import.meta`.

## Cut first if squeezed

FilterChips → the stats region (keep wall + table) → words proof section. Never cut: one Filter driving at least two regions live, 360/3440 proof, the interaction shots.
