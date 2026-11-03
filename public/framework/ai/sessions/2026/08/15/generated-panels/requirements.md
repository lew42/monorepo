# generated-panels

## The ask

Mike (2026-08-15, autonomy grant): "work autonomously, keep working through the next 5h window … if you finish before the second window expires, plan a new feature for the panel system. keep improving!"

The planned feature, continuing panel-ui-overhaul's north star (*layout UI that facilitates rapid layout exploration*): **a generated layout arrives as real panels.** Today the `space` template renders a *picture* of a `gen(seed)` layout inside one leaf. Phase 2 — proposed in `ext/Panel/doc/generator.md` — translates the spec into an actual `Panel` tree, so a rolled layout is draggable, splittable, hug/fill-able and persisted like any arrangement.

## Scope

1. **Translator** — `structure(seed)`: walk `parse(gen(seed))` (from `styles/layouts/space/spec.js`, read-only) and emit `Panel` tree data. Structure maps directly: children → split; `v` in the class list → `dir: "col"`; `flex-1` / `--basis` claims → `grow`. Leaves map by vocabulary: `topbar/toolbar→navbar`, `hero→hero`, `footer→footer`, `cards→features`, `tiles→logos`, `rows→changelog`.
2. **Furniture templates** — the three spec parts with no panel template: `rail` (menu), `toc`, `brand`. Small, cq-sized, token-painted T entries.
3. **Structure-roll control** — a way to roll a workspace/split's subtree from a seed, from the UI. Design call on placement (splits currently carry only divide/close); keep API tiny.
4. **Hug fix** (sequenced after 1–3): `mode: "hug"` collapses cq-sized scene templates to 0px (panel-ui-overhaul's top open item). Scenes should offer a content size; ship the hug demo the module owes.

## Fences

- **Minion S (seeder)**: `Panel/generate.js`, `Panel/templates.js`, `Panel/templates.css` (append), `Panel/toolbar.js` (structure-roll control only), `Panel/workspace.js` (seed plumbing only), `Panel/page.js` (one demo), `Panel/doc/generator.md`, `Panel/doc/file/*.md` for files it changed. Returns readme delta as text.
- **Minion H (hug)**: after S — `Panel/templates.css` (scene sizes), `Panel/panel.css` (hug rule if needed), `Panel/page.js` (hug demo). Returns readme delta as text.
- **Orchestrator**: readme merges, smoke tests, landing.
- Everyone: `styles/layouts/space/*` read-only; no ext/layout, no ext/editor edits (flag only); panels.json backup/diff-restore; screenshots staged in scratchpad.
