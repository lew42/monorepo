# ext/Draggable

A 216-line pair of classes — `Draggable` (grab, pointer-capture, hit-test,
four blank stubs) and `Sortable extends Draggable` (ghost, placeholder,
`locate()` → a position) — that turns "reorder a tree" into one code path:
`item.move(parent, before)` plus a `drop_check` the caller writes. It earns its
place: it's the drag engine under two real, non-demo modules (`ext/Panel`,
`ext/editor`), the design record was already excellent before this pass, and
the file-to-value ratio is high. The single most important thing to do to it:
**`destroy()` doesn't call `cancel()` first** (`Draggable.js:88-94`) — calling
it mid-gesture (a re-render triggered while a pointer is down) leaves
`dragging: true` on an orphaned instance and, on any `Sortable`, permanently
leaks the ghost and placeholder `<div>`s into the DOM, since nothing else will
ever call `end()` on that instance again.

## State

| | |
|---|---|
| files | 5 (`Draggable.js`, `Sortable.js`, `draggable.css`, `page.js`, `readme.md`) |
| lines of JS / CSS | 307 (99 + 83 + 125) / 34 |
| callers | 2 — `ext/Panel/PanelDrag.js` (`/framework/ext/Panel/`, extends `Sortable`, also reads `Draggable.registry` directly for the divider gesture); `ext/editor/page.js`'s `Node` (`/framework/ext/editor/`, extends `Sortable` for the canvas tree) |
| docs before | `readme.md` already strong — Traps, Verdicts (6 worked trade-offs), Deferred — but no "who uses this." `page.js` a plain `Page`, one big board demo, no `Doc`, zero `doc/*.md` files, no `classdoc` residue to migrate |
| docs after | `page.js` → `Doc` (`subject: Draggable`); 14 `doc/method/*.md`, 4 `doc/property/*.md`, 2 notes (`doc/sortable.md`, `doc/verdicts.md` — the old Verdicts section broken out), 4 `doc/file/*.md`; readme gained "Who uses this" and a new Trap; a second Overview card (`bare()`) demonstrating `Draggable` alone, since the module only ever showed `Sortable` |

## What I changed

- Rewrote `page.js` as `new Doc({ subject: Draggable, properties: "view handle dragging registry", methods: "assign initialize grab drag release cancel end under drop_check start move drop restore destroy", notes: "sortable verdicts", files: … })`. Kept the existing board/`Sortable` demo as the Overview's main card verbatim (it was good) and added one new card, `bare()` — a raw `Draggable` grabbing a chip onto a bin, `move`/`drop`/`restore` filled in by hand in six lines — because the brief and the skill both want a base-class demo shown, not told, and the module previously only ever demonstrated the subclass.
- Wrote all 24 doc files the lists require. Every method/property page follows the framework's own Usage/Necessity/trap shape (`core/View`'s docs); every file page ends with a ranked Improvements list.
- Broke the readme's six-question "Verdicts" section out to `doc/verdicts.md` (it was several paragraphs, the skill's explicit break-out trigger), replaced it with a one-paragraph summary + link, and added `verdicts` to `notes:`. Added `doc/sortable.md` — what `Sortable` adds on top of `Draggable` — since `Doc` supports one `subject` and `Sortable`'s own methods (`locate`, `before`, `row`, `show`) had nowhere else to go.
- Added "Who uses this" to `readme.md` with both callers, one paragraph.
- **Found and documented** (not fixed, per the fences) that both real callers write a *three*-clause `drop_check` (`target !== this && target.item?.root() === this.item.root() && !this.item.contains(target.item)`) while the module's own canonical demo (`Card.drop_check` in `page.js`) only ever showed the two-clause version. Added a new Trap to `readme.md`, expanded `doc/method/drop_check.md`, and reworked the relevant `doc/file/page.js.md` Improvement to name it — a reader copying the demo's guard verbatim into a page with two `Sortable` trees would hit the exact cross-tree-drop bug both production callers already found and fixed independently.
- No `classdoc` references anywhere in this directory.

## Recommendations

1. **`destroy()` doesn't call `cancel()`/`end()` first.** `Draggable.js:88-94` tears down listeners and the registry entry unconditionally; if it's called while `dragging === true`, pointer capture is never released, `dragging` stays `true` on an orphaned object, and on a `Sortable` the ghost and placeholder elements are never removed — nothing else will ever call `end()` on that instance again, so they sit in the DOM forever. Fix: `destroy(){ this.cancel(); … }` (safe — `cancel()` already no-ops when not dragging). **simple, important** — one line, and the failure mode (leaked DOM nodes, no console signal) is exactly the "traps that never throw" this codebase worries about most.
2. **The canonical `drop_check` example is the weaker version both real callers had to strengthen.** `page.js`'s `Card` and this module's own docs show `target !== this && !this.item.contains(target.item)`; `PanelDrag` and `editor`'s `Node` both independently add `target.item?.root() === this.item.root()` because `Draggable.registry` is one `WeakMap` for the whole document. I documented this (readme Trap, `doc/method/drop_check.md`) but deliberately didn't change `Card` itself — the demo's single-tree page genuinely doesn't need the third clause, so it isn't a bug in context, just a doc trap for whoever copies it. **simple, important** — worth a one-line comment on `Card` pointing at the doc, at minimum.
3. **`before()`/`row()` in `Sortable.js` are vertical-only and separately-scanned.** `clientY` against child midpoints means a horizontal list silently reorders wrong rather than refusing (already tracked as Deferred in the readme); the two methods also each do their own linear scan over the same children, fine at today's scale, not free at a much larger one. **medium, useful** — no current caller needs either fix.
4. **Outside-the-box: promote the three-clause guard to a static helper.** `Sortable.no_cycle(dragging, target)` or similar, doing the `target !== this && !contains` half generically and leaving the root-scoping clause to the caller (it needs `item.root()`, which not every `item`-like object the class works with is guaranteed to have — `Draggable`/`Sortable` deliberately import neither `Item` nor `List`). Ranked last because it cuts against the module's own stated design: the guard lives on the *dragging instance* precisely so every caller's rules can differ, and a shared helper is one more thing three call sites now depend on identically. **medium, speculative.**

## Where this module overlaps others

Not itself a duplicate of Editor/Panel/`ext/layout`/DevBar/demo — it's the drag
*primitive* two of those five already share rather than reinvent, which is the
healthy version of the pattern `ext/Saver`'s audit found for persistence.
The overlap that's real and small: the three-clause `drop_check` is now
independently written in `page.js`, `PanelDrag.js`, and `editor/page.js` —
same guard, same reasoning, three places to keep in sync (Recommendation 4).
Nothing else in the framework does hit-testing or gesture capture — `ext/demo`'s
stage-resize handle and `ext/Panel`'s own divider (`PanelDrag.js`'s `grip()`)
are pointer-driven too but don't touch `Draggable.registry` or this module at
all, which is arguably a second, smaller instance of the same near-miss: two
unrelated pointer-capture-and-drag implementations exist side by side in
`ext/Panel` alone (`PanelDrag extends Sortable`, and the plain `grip()` divider
that hand-rolls its own capture/coalesce loop) with no shared code between them.

## Skill feedback

The skill has no guidance for a module with **two related classes and one
`subject:` slot** — `Doc` only reads one subject, but `Sortable`'s own methods
(`locate`, `before`, `row`, `show`) don't exist on `Draggable.prototype` and so
can never appear in `methods:`. I picked
`subject: Draggable` (the base, holding the shared mechanics) and pushed
`Sortable`'s own contract into a `notes:` page instead — the same call
`ext/Saver`'s audit made for its base+backends shape, independently, which is
a good sign the two of us converged on the right default, but the skill itself
says nothing about it. A line like *"a base class with one meaningful
subclass documents the base as `subject`; the subclass's own additions go in a
`notes:` page, not a second `subject:`"* would have saved the guess and given
the next agent auditing a similar module (anything base+specialization-shaped)
the same answer instead of a coin flip. Second: the skill's `overview:` array
form (`overview: [{ title, content(){...} }]`) is documented but, as far as I
found grepping the whole framework, had never actually been used anywhere
before this pass — I had no real example to check my usage against beyond the
one paragraph in the skill text, and the browser sweep the orchestrator runs
at the end is the first real test of it.
