# core/new architecture — a sealed proving ground, read and never imported

`core/new` is the sketch where the shipping framework was first proved: `App`, `Page` and `Router` as they lived before they moved into [`core/`](/framework/core/). Its one live folder is [`1/`](./1/), a self-contained copy with its own dev server. Nothing else in the repo runs from it. Entry: [`1/Router.js`](./1/Router.js), [`1/App.js`](./1/App.js), [`1/Page.class.js`](./1/Page.class.js).

## Nothing imports it

**Decided:** no file imports from `core/new/`. It is read for its record, never loaded.
**Why:** `public/` is the deploy artifact, so a stray import of `new/1/Page.class.js` resolves to a second, different `Page` class with the same name. The instance is silently wrong.
**Instead:** delete the tree outright. Rejected, because it is the only record of the council round and the measurements that `core/App`, `core/Page` and `core/Router` cite.
**Detail:** [`doc/notes.md`](./notes.md), and the framework readme's `instanceof` trap.

## Only `1/` is kept

**Decided:** `1/` is the single proof. The earlier drafts `0/` and `starter/` are gone.
**Why:** the two drafts were 445 files and 2.8 MB with zero importers. Their value was already moved into `1/` and its readme.
**Instead:** keep all three as history. Rejected: the cost was size and noise, and the lessons survive in `1/`'s readme.
**Detail:** [`1/readme.md`](./1/readme.md), and the "What each one proved" section of [`readme.md`](./readme.md).

## Outside the site's navigation, on purpose

**Decided:** `core/page.js` does not list `new` as a child, and search skips it.
**Why:** a proving ground should be read on purpose, not reached by accident. The same rule keeps [`ext/DesignTool`](/framework/ext/DesignTool/)'s audit out of its crawl.
**Instead:** a visible link from the framework index. Rejected, because a link would make dead sketches look like live framework.
**Detail:** the skip list is `Search.js` line 210 ([`core/Search`](/framework/core/Search/)).

## ⚠ The Router is not line-for-line

The `1/` readme and this folder's [`page.js`](./page.js) say `1/Router.js` is "line-for-line" the shipped `core/Router/Router.js`. It is not. The two files differ by about 213 diff lines: the shipped one imports `Page` from `../Page/`, and `1/` has a longer header comment and extra logging. The claim is stale, and the readme should say "the same design", not "the same lines".
**Detail:** [`core/Router`](/framework/core/Router/) holds the live version.

## More

- Design notes: [`doc/notes.md`](./notes.md)
