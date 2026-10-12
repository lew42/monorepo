# playground-1-mvp — ext/Playground task 1: the MVP that opens

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Sonnet.
**The spec is [`../playground-design/design.md`](../playground-design/design.md)** — read all 150 lines;
this brief only fences and adjusts it. **Length budget:** every file ≤ ~150 lines; `readme.md` ≤ 25 lines
(a stub this task; task 5 finishes docs); your report one screen.

## Build (design.md §1 shell, §2 documents, §3 Flex + Box, §4 workspace, §9 file map, §10 row 1)

`public/framework/ext/Playground/`: `Playground.js` (shell, selection by id, the root listener, repaint;
`static Canvas` with `render`) · `items.js` (`Flex`, `Box` with `static fields` + `styles()`, `Item.register`;
`Grid` waits for task 3) · `documents.js` (index-as-document, new/open, the saver idiom: `FileSaver` on
localhost, `LocalStorageSaver` off it) · `playground.css` (`pg-` prefix; every rule in a layer) · `page.js`
(a route page, whole-window, `classes: "full solo flex"` per §1 — run the `layout` skill once) · `readme.md`
(stub). A minimal add/remove (`+ flex`, `+ box`, `✕`) may live in `Playground.js` or a first `toolbar.js` —
task 3 grows it. The tree is `ui.tree(...)` from `ui/tree` (landed today — read `ui/tree/readme.md`;
if `onHover`/`onRename` are absent, do without). Both grips are `ext/grip`; the tree's needs the 3-line
`from: "start"` option in `ext/grip/grip.js` (+ one line in its `doc/decisions.md`) — prove the drawer's
grip still works afterwards with the `ui-test` skill (the drawer page, a 150 px drag; the skill's
worked example is exactly this). Wire the page: `ext/page.js` `children:` + `styles/css-scopes.txt` `pg-`.

Adjustments to the design, decided: MVP is **1280 only** — no container query, no overlay sheets at
400 (rails just clamp; task 5 revisits). `data` values are CSS verbatim strings; `""`/absent writes
nothing. Canvas nodes use **inline style** (never framework classes). `change` events write the one
property onto the live node — no repaint. Selection is an **id**. Seed a new document with one `Flex`
root holding two `Box`es so the page is never empty.

## Prove (headless, per the protocol recipe; log the numbers)

- Three columns at 1280 measured: tree ≈ 16em, properties ≈ 18em (say the px), canvas = the rest;
  the page itself does not scroll (`document.scrollingElement.scrollWidth === 1280`).
- A Flex with two Boxes: the canvas node computes `display: flex` and has two real children.
- `/data/playground/untitled.json` (or the slug you choose) on disk with the four-key envelope;
  `index.json` lists it. Reload → same tree, same selection.
- Both grips drag (ui-test skill, 100 px each): the tree width grows with a rightward drag, the
  properties width with a leftward one; the drawer page's grip unchanged.
- Zero console errors on `/framework/ext/Playground/` and `/framework/ext/`; a png in this dir.

## Fence

Own: `public/framework/ext/Playground/**` · one `children:` edit in `public/framework/ext/page.js` ·
one line in `public/framework/styles/css-scopes.txt` · ≤ 4 lines in `public/framework/ext/grip/grip.js`
+ one line in `ext/grip/doc/decisions.md` · `public/data/playground/**` · this task dir. Not `ui/tree`
(ask; log the ask) · not `ext/Panel` · nothing else.

## Added after panel-insight landed

Read [`../panel-insight/insight.md`](../panel-insight/insight.md) §Carry/§Avoid (2 min) before coding.
Two of its findings bind this task: selection must reach the LEAF on the first click (Panel takes two —
`focus.js:93` is the counter-example); and the properties column is Playground's OWN DOM, never the shared
`ext/drawer` rail (two writers blanked it — `properties.js:150`).
