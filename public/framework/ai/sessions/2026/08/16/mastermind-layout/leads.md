# Leads: Next Work in Flight

**Sweep counts:** (1) 6 open items from readmes · (2) 0 unfixed ⚠ warnings · (3) 1 TODO in live code · (4) 31 modules missing/short readmes

---

## Sweep 1: Open sections in module readmes

**6 items found.** All are design decisions or missing features — most link to detailed proposals elsewhere.

### Rank 1: Missing feature

- **`markdown.readme.md`**: `md.c()` has no caller anywhere on the site; `marked` is re-exported by `/app.js` to nobody. Fine for deletion or to wire up. [Proposed findings](/framework/ext/markdown/doc/proposed/)

### Rank 2: API design questions

- **`is.readme.md`**: Should `is.class` be renamed to `is.constructable` (to say what it actually tests), or should a second stricter check join it? No caller needed the distinction yet; `ext/Doc` solved locally instead.

- **`view.readme.md` (Proposed)**: Eight findings from the every-member audit, all marked for Mike's decision. Highest-value ones:
  - `View.body()`'s `init()` hook never ran — dead code.
  - Fold `has_class()` and `toggle_class()` into their short aliases `hc()` and `tc()`.
  - `ctrl()` (18 lines, one caller, one sandbox) belongs in `ext/demo` with its CSS, not core.
  - `html()` silently degrades to text without `Element.setHTML` — three callers, none in framework; recommend deletion.
  - `append_pojo` / `append_prop` branch unused — collision guard is truthiness against prototype; recommend deletion.
  - `View.lazy` (static) and `View.prototype.lazy` (method) are one name for two things — rename static to `lazy_queue`.
  - `View.parent` written by `append()`, never read in framework — delete, use `view.el.parentNode` instead.
  - `hide` / `show` / `toggle` write inline styles (top escalation rung, nothing can override). Recommend `.hidden` utility class toggled with `tc("hidden")` — one caller (`Sidebar`) to change.

### Rank 3: Outstanding design constraints

- **`view.readme.md` (Open)**: `html_unsafe` is patched by `ext/highlight`. Two exts patching one method (or `append`/`prerender`) would silently compose in import order. Fine at one, no registry, no plan for two.

- **`app.readme.md` (Open)**: Nothing paints until the whole walk finishes (measured: 1765ms on a cold 5-deep link). Chrome could paint immediately and fill in later, but an empty tab bar is worse. Real cost, kept by design.

### Rank 4: Acknowledged but unsolved

- **`doc.readme.md` (Open)**: 
  - `files:` list goes stale silently — a file added to the module but not the list is simply absent from the tab. Trade recorded; check belongs in the `documentation` skill.
  - Every Doc tab has two `h1`s (well's title + page's title). Found on `/framework/ext/LayoutTool` (2026-08-16); repeated on `/framework/ext/Doc/` itself. Fix is probably `h2` with `h1` look or suppress child's, Mike's call.

- **`panel.readme.md` (Open)**: Majority shipped in 2026-08-16 wave. Remaining:
  - Self-alignment against parent — `display.js` exports `live_axes(mode, dir)` truth table but nothing wires it yet. 3×3 aligns leaf's own content, not leaf against slot.
  - Three live mounts share one document (two routes + task page). `Page` caches views; shared-document registry needed if it bites.
  - A slot narrower than 16em cannot give two hugs 16em each — needs shrink factor and per-panel cap of slot ÷ hugs (second sizing currency).
  - `ext/editor` properties region is hand-rolled from `ext/layout`'s word registry (inspects selected block, not panel). Collision with bar answered; no focus rings drawn.
  - Selection pushes properties rail open and moves the target (0.18s reflow measured). Measured cost; Mike's call whether to overlay, hold push, or reserve permanently.

---

## Sweep 2: Unfixed `⚠` warnings

**0 items found.** Every `⚠` line in readmes and `doc/*.md` describes either a documented trap (working as designed) or a known constraint someone decided to live with. No unhandled problems surfaced.

---

## Sweep 3: TODO/FIXME/HACK in live code

**1 item found** (filtered: no `ai/`, `new/`, or personal sandboxes).

- **`ext/AITask/feed.js:16`**: `/* For now a refresh button + localhost polling drive it. */` — re-render logic is manual. Never evaluated as high-priority.

---

## Sweep 4: Modules without readme.md or very short readmes

**31 modules flagged.** RULE#10 expects ~5+ lines of current state per module.

### Tier 1: Core infrastructure (6 modules)

These are structural containers or pages that declare children — readmes should explain scope:

- `public/framework/core/` — root framework directory, no readme
- `public/framework/dev/` — dev-only utilities, no readme
- `public/framework/ext/` — extension directory, no readme
- `public/framework/audit/` — audit module, no readme (separate from `/audit/browsable/` which has one)
- `public/framework/core/Page/overview/` — 9 child pages (add, catalog, children, dashboard, deep, docs, labels, landing, page, route, shapes, site, strip, wall), none have readmes. These are demo/example pages under `overview/`, not live framework modules — may be intentional.
- `public/framework/core/Page/` siblings: `children/`, `flow/`, `nav/`, `previews/`, `shell/` — no readmes (guide pages, not core classes)

### Tier 2: LayoutTool sub-directories (6 modules)

`LayoutTool` is a complex audit/measurement module with multiple entry points:

- `ext/LayoutTool/audit/` — no readme
- `ext/LayoutTool/audit/taste/` — no readme (part of audit)
- `ext/LayoutTool/knowledge/` — no readme
- `ext/LayoutTool/library/` — no readme
- `ext/LayoutTool/library/bad/` — no readme
- `ext/LayoutTool/taste/corpus/` — no readme
- `ext/LayoutTool/tests/` — no readme

### Tier 3: Audit pages (2 modules)

- `public/framework/audit/overview/organization/` — no readme
- `public/framework/audit/overview/priorities/` — no readme

### Tier 4: Doc module edge case (1 module)

- `public/framework/ext/Doc/overview/urls/` — no readme (sub-page of doc module's overview)

All 31 are discoverable via the framework's own page navigation and render correctly. Missing readmes means no module-level documentation on what each is for — violations of RULE#10, which expects readmes to be current state plus gotchas.

---

## Three leads to prioritize first

1. **Tier 1: API simplifications on `View`** (8 proposed items, all from thorough audit). Move `ctrl()` to `ext/demo`, delete dead `init()` hook, `html()` branch, and `parent` property. One person, no design decision needed (all marked "Recommendation"), cuts surface area.

2. **Tier 2: Missing top-level readmes** (3 infrastructure directories). `public/framework/core/`, `public/framework/dev/`, `public/framework/ext/` all lack module documentation. Small scope, clarifies what each tier holds.

3. **Tier 3: Doc `h1` hierarchy issue**. Every Doc tab renders two `h1`s; browser reports hierarchy error on every one. Marked on 2026-08-16. One-line `h2` cosmetic fix or suppress child's title — Mike decides which.
