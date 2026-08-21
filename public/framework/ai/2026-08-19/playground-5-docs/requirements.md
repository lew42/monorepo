# playground-5-docs — ext/Playground task 5: two design-blessed fixes, then docs + the 4-width pass

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Sonnet.
**The spec is [`../playground-design/design.md`](../playground-design/design.md) §1 (the sketch), §9
(file map), §10 row 5, §11.** Read the last lines of all four prior playground task.jsonl files —
their findings are the raw material for `doc/decisions.md`.
**Length budget:** `readme.md` ≤ 30 lines · `doc/schema.md` ≤ 60 · `doc/decisions.md` ≤ 80 · report one screen.

## 1 · Two structural fixes first (both already in the design)

- **The toolbar spans the shell.** Design §1's sketch draws it above all three columns; today it sits
  inside the canvas column and scrolls at 1280 (55px high, `overflow-x: auto`). Move `.pg-toolbar`
  above the tree/canvas/properties row, full width. Prove: at 1280 the bar does not scroll
  (`scrollWidth === clientWidth`) and the page still doesn't (`scrollingElement.scrollWidth === 1280`).
- **`canvas.js`.** `Playground.js` is 294 lines; §9 says "each ≤ ~150; `Canvas` splits into `canvas.js`
  if it passes". Move `static Canvas` (render + the canvas-side wiring that belongs with it) into
  `canvas.js` verbatim — a move, not a rewrite. Prove: the smoke set below is identical before/after
  the move (run it twice); say both line counts.

## 2 · Docs (the `documentation` skill runs you through this)

- `readme.md` — the real index: what (one line), Use (the ui.tree-style snippet: open the page, or
  `new Playground(...)`), Watch out (the traps the five tasks actually hit: the one-time 404 on a new
  slug, inline-style-beats-layers as the canvas rule, paste strips ids, seg buttons and the site
  button layer, the last-doc localStorage key), More (page links + doc/).
- `doc/schema.md` — the wire format: the four-key envelope, the three types' data keys → CSS (design
  §3's tables, updated to what shipped), one example document, "the JSON IS the clipboard format",
  where documents and layouts live on disk.
- `doc/decisions.md` — one entry per decision that shaped the module, harvested from the five task
  logs: data IS the CSS; one root listener, change repaints nothing; selection is an id; index-as-
  document (Directory.js ignores .json); grip `from:"start"`; properties has no engine; the add rule;
  why the properties column is its own DOM (panel-insight's shared-rail scar, linked); the clean-seed
  rule. Link `../panel-insight/insight.md` and `../playground-design/design.md` as the origin story.
- `page.js` — make the module page a proper Doc if it isn't (readme rendered, the playground linked
  as the exhibit); the `new-page` skill checks the shape. Design §11's not-now list lands verbatim
  under a "Left" heading in the readme.

## 3 · The 4-width pass

400 / 1280 / 1920 / 3440, headless: zero console errors; `scrollingElement.scrollWidth === innerWidth`
at each; list every `overflow: auto` box and one line each on why it's wanted (design §1 names three);
anything clipped or 0×0 is a finding — fix it if it's yours, log it if it isn't. One png per extreme
width (400, 3440) in this dir.

## Fence

Own: `ext/Playground/**` (all of it, this task) · `public/data/playground/**` (leave it as found unless
a proof dirties it — then restore) · this task dir. Nothing else; not ui/tree, not ext/Panel, not
ext/grip, not ext/Dropdown.
