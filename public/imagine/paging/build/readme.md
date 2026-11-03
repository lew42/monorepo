# Build — the node vocabulary; the builder itself moved into Make

**This directory is three files of live code and no page.** The builder that used to be here
is the right pane of [Make](/imagine/paging/make/), beside the tree it always needed and over
the live page it already had.

Two screens for one job was the defect: this page had the live page and no tree, Make had the
tree and no live page, so you made a page in one place and found out what it looked like in the
other. Nothing was lost — the seven-word bar, the name fields, the icon, the blocks, the file
and the `page.js` are all on that one screen.

Live: [/imagine/paging/build/](/imagine/paging/build/) — still one sentence and a link, but the
whole page that said it went on 2026-09-17. It is a row in the hub's `MOVED` map now
(`../page.js`), which is the realm's one machine for "this url moved": the url answers, the
sentence is the same, and there is no page to maintain. A 404 is still the worse answer.

## What is in this directory, and why it is not dead

| file | who imports it |
|---|---|
| `words.js` | the node vocabulary — the blocks, the icons, the default flag, the `page.js` printer. `make/settings.js`, `make/tree.js` and `../stage.js` all read it. |
| `draw.js` | the ONE renderer for a page's blocks, for Make's middle and for a saved page alike |
| `build.css` | `draw.js`'s own sheet — the block grids and the card wall, and nothing else since the move |

`stage.js` was deleted: `../stage.js`'s `PagingStage` draws the page now, which is the same
class a saved page draws at its own url.

## More

- [Make](/imagine/paging/make/) · [`make/readme.md`](/imagine/paging/make/readme.md)
- [`../doc/builder.md`](/imagine/paging/doc/builder.md) — the census, the controls in order,
  tabs, and the record of the move
