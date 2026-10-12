# properties-region

## The ask

Continuation of Mike's 2026-08-15 autonomy grant ("keep working through the next 5h window … keep improving!") and his original question: *"the ext/layout sidebar [may not be] the best place to put Panel properties … any web apps might need any number of contextual right sidebars … layered, so you could have 2 at a time?"*

The sidebar-strategy doc (`ai/2026-08-15/panel-ui-overhaul/doc/sidebar-strategy.md`) recommended: **Panel properties belong in a `properties` region in Panel's own T vocabulary** — an inspector that IS a panel, generalizing what ext/editor built by hand (`editor/page.js` REGIONS). The workspace then provides two-at-once, resizing, dragging and persistence for free. Its top open question: how does the inspector know which panel is focused? This task answers with working code.

## Scope

1. **Focus model** — minimal: the root Panel tracks the focused descendant (instance state, never serialized); clicking a panel focuses it; a visible affordance marks it; focus falls back sanely when the focused panel closes.
2. **`properties` T entry** — an inspector panel rendering the focused panel's words (template, tone, align, mode) as live controls through the same `item.set` mechanism as the bar. Two inspectors at once must work (it's just two panels).
3. **Demo + docs** — a demo on the Panel page (workspace with an inspector open), doc updates for touched files, readme delta returned as text.
4. Out of scope: refactoring ext/editor to adopt it (flag-only), ext/layout, DevBar.

## Fences

- **Minion P**: `Panel/templates.js` (one entry), new `Panel/properties.js` (if it earns a file), `Panel/templates.css` (append), `Panel/workspace.js` (focus plumbing), `Panel/Panel.js` (only if focus truly belongs there), `Panel/toolbar.js` (only if a focus affordance needs the bar), `Panel/page.js` (one demo), `Panel/doc/*.md` + `doc/file/*.md` for touched files. Returns readme delta as text.
- **Orchestrator**: readme merge, smoke test, landing.
- Everyone: ext/editor and ext/layout read-only (flag, don't fix); panels.json backup/diff-restore; screenshots staged in scratchpad.
