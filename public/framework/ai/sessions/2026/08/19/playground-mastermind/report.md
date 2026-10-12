# Run 5 — 2026-08-19 — ext/Playground: the simpler Panel, designed fresh and built

One screen. Every line clickable; detail in each task's log. The owner's evening ask, executed
while they ran: read Panel for insight (never modify), design fresh, build the layout lab.

## The tool

**[Open the Playground](/framework/ext/Playground/)** — tree · canvas · properties, both dividers
grip-resizable. One idea from the fresh design: **the `Item` tree renders as REAL flex/grid DOM —
`data` IS the CSS (verbatim strings), the wire JSON IS the clipboard, a layout IS a document.**
Nothing translates, so nothing drifts.

Flex + Grid + Box · add / remove / duplicate / copy / paste (ids stripped — paste twice, all ids
unique) · documents like figma (new / open / delete, `/data/playground/*.json`, reload reopens your
last) · **save any selection as a layout, insert a layout from the library** (seeded: holy-grail,
sidebar, card-wall) · viewport presets 400/768/1280/⤢ to watch it respond · live CSS readout =
literally the node's `style` attribute.

## Landed (9 tasks, ~1.7M subagent tokens, all proofs headless)

| Task | What | Proof |
|---|---|---|
| [ui-tree](../ui-tree/) | `ui.tree()` — icon+text rows, nested `<ul>`s, update/select | indents 0/18.8/37.6/56.4px = exact ×depth |
| [ui-test-skill](../ui-test-skill/) | `.claude/skills/ui-test` — drive headless, png + rects per step | grip +150px exact; sort reorder committed |
| [panel-insight](../panel-insight/) | read-only Panel autopsy: 10 carry / 10 avoid | the shared-rail blanking, caught with a string |
| [playground-design](../playground-design/) | [design.md](../playground-design/design.md), 150 lines, written blind to Panel | build order held 5-for-5 |
| [playground-1-mvp](../playground-1-mvp/) | shell + grips + tree + document + Flex/Box + save | cols 241/540/271; leaf selected on FIRST click |
| [playground-2-properties](../playground-2-properties/) | controls from `static fields`; change = one live style write | DOM identity held `===` across a change |
| [playground-3-grid-toolbar](../playground-3-grid-toolbar/) | Grid + toolbar verbs | `repeat(3,1fr)` → 138.578px ×3; span 2 |
| [playground-4-documents-layouts](../playground-4-documents-layouts/) | documents ▾, layout library, presets | 51 ids unique after double insert; wrap at 400 |
| [playground-5-docs](../playground-5-docs/) | toolbar spans the shell; `canvas.js` split; readme + doc/ + 4-width pass | 0 errors, 0 page scroll at 400/1280/1920/3440 |

Plus, found by the new skill and fixed: [draggable-layer-fix](../draggable-layer-fix/) — the dragged
card never hid (`@layer theme` loses to util `.flex`); inline style now, column 217→217px (was +71).
Mastermind inline: select-after-add (add-then-remove deleted the OLD selection — two lines, proven),
`ui/readme.md` counts de-staled.

## Waiting on the owner

- **The design's five asks of `ui/tree`** (design.md §Asks): hover-sync, inline rename, drag-reorder
  (`Sortable` + `item.move()`), unknown-key round-trip, a per-row badge slot — drag-reorder is the
  one that makes the tree a real layers panel.
- §8's learning-UX waits: x-ray toggle (paint padding/gaps), "why did it do that" hints, copy-as-CSS.
- At 400px the canvas is 0 wide — the design's overlay-rails idea was deliberately not built (MVP is
  1280); say the word and it's a task.
- A pre-existing `core/Page` gap task 5 found: a Doc whose `render()` owns the shell never draws its
  `/doc/` `/files/` tabs — documented in Playground's decisions, needs a core verdict.
- ext/Panel untouched, as asked. If the Playground direction feels right, the retire-or-park call on
  Panel is yours.

## Process, for the record

Fresh-design-blind-to-Panel worked: the designer independently avoided all 10 of insight's avoid-items;
the two documents agree on the carries (verbs on the tree, one root listener, hug=auto, index-as-file).
Every gesture proved headless via the new ui-test skill — mousedown/move/up drove fine; nothing needed
forcing except the deliberately-out-of-reach clamp test. Pace held: weekly 92% at ~97.5% elapsed, ~2
points spent of the ~6 available; the reset opens at 21:59.
