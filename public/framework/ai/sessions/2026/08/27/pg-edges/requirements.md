# pg-edges — the edge is the insert affordance; compaction

**The three laws:** Less is more — ASAP, simplest working version first. Clarity is the one exception. Prioritize.
**Length budget:** final report ≤ one screen — evidence table + links; detail as `log` lines in YOUR `task.jsonl`.

## The ask

Owner (full text `../playground-mastermind/requirements.md`): "for these edge resizers, make them clickable (opposed to a drag), and have a small + icon button appear. this way, for any edge, we can click it, and then add an item. … we want to be able to add anything (a row, column, child, sibling, section, whatever), where ever we want, simply by hovering. … explore layout — any layout, in as few clicks as possible."

The design foundation is the researcher's proposal — READ IT FIRST: `../pg-ux-research/proposal.md`. Its one rule is adopted:

> **An edge inserts a sibling on that side. If the parent doesn't already flow that way, the parent is made to — converted if the node stands alone, wrapping just this node if it has siblings that must stay put.**

**Mastermind's amendment** (decided, not open): the proposal's "delete the in-flow `.pg-add`" is REJECTED — the owner explicitly designed the blocky reserved-space `+` (wave 1 `pg-interactions` shipped it, measured 0px shift; it IS the child-add affordance in stacks). Your edges add what it cannot: siblings, direction, wrap-into, insert-between. Centre/child stays the existing `+`.

## Scope, priority order — park the tail before shipping half of everything

1. **Edge inserters** on the selected node: four abs-pos edge strips, revealed on `.pg-selected:hover` (wave 1's gate), each showing a small `+` chip on its own hover. Click ⇒ the rule above: left/right ⇒ row flow, top/bottom ⇒ column flow; sibling-before/after by which side; convert-vs-wrap by whether the node stands alone. The inserted sibling copies the clicked node's `width`/`height` words (a row of cards is equal by construction). The ZERO-JANK bar holds: no rect may move on hover/reveal — abs-pos only, measured.
2. **Gap handles become clickable**: a press that never moves ≥5px is a click ⇒ insert between the flanked pair (same flow words); a real drag still resizes. This is the owner's "inserting between items" case.
3. **Compaction** (proposal §What-to-delete, adopted): toolbar drops `{}`/`paste`/`⧉`/`✕` (methods stay on the class); `⧉`/`✕` reappear as small chips on the selected node's chrome. Toolbar keeps `document ▾`, `insert ▾`, `+`, presets. Sidebar drops `order`/`shrink`/`basis` (fields only — the data keys and `decls` stay so old documents still render; verify one). The proposal measured the sidebar off-screen at 1280×900 (align buttons at y=943) — after the trim it must fit; measure it.
4. **Grid in fewer real gestures**: converting to Grid pre-fills `columns` with `1fr 1fr` (visible, editable) so the template is on screen with a real value.
5. **Readout attribution**: `apply_change(key)` already knows what changed — the readout highlights the last-changed declaration. One small, honest version; no tooltip system.

Parked for the owner (do NOT build): axis chips on edges (proposal §Learnability item 2) — log a one-line pointer.

## Your fence

`public/framework/ext/Playground/`: `canvas.js`, `playground.css`, `Playground.js`, `toolbar.js`, `properties.js`, `items.js` (only if the word-copy/convert seam demands), `doc/decisions.md`, `readme.md`. Waves 1–2 have landed; you are the only writer. Plus your task dir `public/framework/ai/2026-08-27/pg-edges/`.

## Proof (ui-test skill — read its Traps; three agents were bitten TODAY, the traps are current)

Own document (`swap('pgmm-edges')`, re-acquire handles per eval, `delete_current()` at the end; never gesture on owner docs). Required evidence:
1. Hover sweep on a 3-level doc with a node selected: **0px** movement revealing edges/chips.
2. Drive the proposal's headline: **3-across-equal in 1 gesture** (select seed box → right-edge `+`... as the rule allows) and **header/content/footer in 1** — screenshot each finished layout; the driven count must match the proposal's "proposed" column or the discrepancy is a finding, logged, not hidden.
3. Gap-handle click inserts between; gap-handle drag still resizes (both driven).
4. Convert-vs-wrap: edge-click on a node with siblings wraps ONLY that node (siblings' rects unmoved except the wrapped slot); on an only-child, parent converts, no wrapper (tree depth checked via `wire()`).
5. Sidebar fits 900px with a Flex selected (measure the last control's bottom).

## Rules

Load `code` / `css` / `new-css-class` before the respective work. Never kill/restart the dev server; never drive the owner's tabs; never `git stash`; never commit. Task dir exists — `task.jsonl` per `new-task` (`group: "web-ui"`). Scratchpad prefix `pgedges-`. Misleading skill → `skill-improvement`. Land with `finish-task`. Blocked twice on one item → park it, log it, move on.
