# paging-explorer — build brief

Less is more · clarity is the exception · prioritize. Read [`../paging/requirements.md`](../paging/requirements.md) (the program: plan, vocabulary, the owner's ask) and [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; both are mandatory. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `new-page`, `ui-test`, `documentation`, `finish-task`.

**The owner's ask, verbatim:** "implement the imagine/mag/ in the page explorer. have a 'code' dynamic sub page for each page, so you can see how it was built? maybe you have to append `this.whatever()` to the code tab, when you use the ui to configure the page, so you can see how you'd do it with code."

The page explorer is the generator: `public/framework/core/Page/generator/` (readme, `gen.js`, `spec.js`, `specs.js` — the named shapes gallery, `controls.js` — the spec controls, `export.js` — a tree becomes a real page.js, `tree.js`, `page.js`, `doc/`). Live at `/framework/core/Page/generator/`; an exported page lives at `/imagine/generated/seed-7/`. The magazine is `public/imagine/mag/` (`page.js`, `issue.js`, `issue.json`, `Article.js`, `mag.css`, `readme.md`, `doc/`).

## Deliverables

1. **Mag in the explorer** — the magazine's layout as a named shape in `specs.js` so the generator draws it (front + sections + articles, in the generator's own vocabulary; read `specs.js`'s eight shapes for the form). If mag's shape needs a word the spec language lacks, add the smallest word and document it in the generator's doc.
2. **The `code` tab on every generated page** — a dynamic child (`route("code")`, never a directory): shows the spec string, the `page.js` `export.js` would write for THIS page, and — as the UI controls change — the `this.whatever()` calls appended live, one line per control click, so a reader sees how the configured page would be written by hand. Read `export.js` first: it already turns a tree into page.js; reuse it, do not write a second printer.
3. **`public/imagine/paging/explorer/page.js`** — a demo page in the paging world: what the explorer is, a link to the generator with the mag shape selected, and the code tab explained in three lines. The mastermind wires `explorer` into the hub.

## ⚠ A seeded generator must stay bit-identical

Before your first edit: run the export for the existing seed (`seed-7`, and two others) and save the output in your task dir. After every change to `gen.js`/`spec.js`/`rolls.js`/`specs.js`, run it again and `diff` — a reordered draw fabricates a change. Adding a shape at the END of `specs.js` is safe; inserting one is not. Show the diff (empty) in your landing line.

## Prove it

`ui-test`: open a generated page, click two controls, open its `code` tab → the two appended lines are present and the exported page.js parses (`node --check` on a copy). Screenshots at 1280 and 3440. Zero console errors.

## Fences

Write only: `public/framework/core/Page/generator/{specs.js, controls.js, export.js, gen.js, tree.js, page.js, readme.md, doc/}` (only what you need), `public/imagine/paging/explorer/`, this task dir. Never `mag/` itself, never `core/Page/Page.class.js`. Budget ~250k tokens.
