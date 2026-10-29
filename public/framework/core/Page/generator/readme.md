# Generator — pages without the filesystem

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

A seed draws a **spec string**; the spec builds a **real page tree** under this url. Real
urls, the real Router, the real `active-page` contract, core's columns — all of it, and not
one file on disk. It is [`styles/layouts/space/`](/framework/styles/layouts/space/) one level
up: there a line is a box, here **a line is a page**.

Live: [`/framework/core/Page/generator/`](/framework/core/Page/generator/) — a top tab on
core/Page.

## Use

```js
import { gen } from "./gen.js";
import { tree } from "./tree.js";

this.children = new Map();
tree(gen(7), "#7", this).forEach(config => this.add(config.name, config));
```

That is the whole mechanism. `children:` already takes nested plain objects and `Page.add()`
turns each into a real `Page`, recursively — so a virtual tree needs no new machinery. The
third argument is the host itself, threaded through only so a page's `code` tab (below) can
read the host's own call log.
- Moved verbatim to [doc/spec-language.md](./doc/spec-language.md): the spec language.
[`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md).

**"Yours"** is the same idea for a tree of your own: name the box below the eight and it joins a
band underneath them, kept in the same `store()` the header's dressing already lives in — no
second key, and a reload survives it. A ⨉ on your own card removes it; the curated eight have none.

It is a **list, not a generator**: nothing there is seeded, so nothing there moves when `MODEL`
does. Adding one is one entry in `SPECS` — `{ title, note, spec }` — written in the same five
words the roller draws and the controls edit.

- Moved verbatim to [doc/export-and-code-tab.md](./doc/export-and-code-tab.md): export and the code tab.
- Moved verbatim to [doc/cut-words.md](./doc/cut-words.md): the four cut words.
## More

- Design notes: [`doc/notes.md`](/framework/core/Page/generator/doc/notes.md).
- The arrangement is core's: `page.columns()`, `width:`, `.page-column-*` —
  [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md).
- Files: `gen.js` (seed → text, and `MODEL`), `spec.js` (the text format — parse, read a line,
  edit one node, `serialize()` back), `rules.js` (which word under which), `tree.js` (text →
  page configs, where a child mounts — `container()` — and its `route("code")` child),
  `controls.js` (every control, and the framework words behind them), `fill.js` (the
  seeded-distinct content), `rolls.js` (the wall, and the tile picture), `specs.js` (the nine
  kept shapes, and the gallery), `export.js` (the tree → files, the shape of every exported
  page, and `content_line()` / `width_line()` — the two lines the code tab reads rather than
  reprints), `page.js` (the header, the store split, the one place the tree is replaced, and
  `calls` — the code tab's transcript), `generator.css` (one picture per word, twice — at
  column size and at 3px — and the three looks).
- Not built, on purpose: a chaos dial on the page (chaos is an argument to `gen()`, so `#7`
  keeps meaning one tree), any rule about which *widths* pair (only blocks have rules), the
  header's own settings in the address (`#7` has to keep meaning one **tree**; how wide you
  like your columns is not the tree), a delete control for an export (that is `rm` on a
  directory somebody may have edited), and reading files back into a spec.

- Notes: [doc/generator-controls-notes.md](doc/generator-controls-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/generator-export-notes.md](doc/generator-export-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/generator-tree-notes.md](doc/generator-tree-notes.md) — history and lessons moved out of the code comments.
