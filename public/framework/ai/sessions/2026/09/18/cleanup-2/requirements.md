# cleanup-2 — three small fixes

Minion brief, saved verbatim (trimmed of harness wrapper) from the owner's message on 2026-09-18.

## Three items, each verified headless on private server (PORT=8143)

### 1. The approved library's thumbnails

`public/layouts/doc/studies/approved/page.js`'s `library_card()` assumes every listed item
has a jpeg at `/layouts/browse/shots/<id>-1920.jpg`; the five `approved-*` items in
`public/layouts/browse/items.json` use a different field (read the entry) and 404 their
thumbnail once judged (`ai/2026-09-18/browse-on-browse/task.jsonl`, the finding).

Read the item's real picture field and draw it; prove with one approve pressed for real on
an `approved-*` item (then restore `public/layouts/verdicts.jsonl` to its prior bytes — copy
first): zero failed image requests on the approved page.

### 2. One localStorage store (overlap merge 4, `ai/2026-09-18/overlap-study/overlap.md`)

`core/Page`'s `Page.Store` (`page.store()`, prefix `lew42:`), `core/Sidebar`'s own store
(the width key), `ext/Saver`'s `LocalStorageSaver`. Read all three; make `Page.Store` the one
implementation (extend it with what the other two need — a key not derived from a page url is
the likely gap), delete the two copies, count the lines removed (the study estimated 20–25).

Prove: the sidebar width survives a reload under the same key it used yesterday
(`lew42:sidebar`, read `core/Sidebar/doc/decisions.md`), the shell rail too, and `ext/Saver`'s
demo page still saves and loads; `/imagine/team/` and `/imagine/game/` keys byte-identical
before and after.

### 3. `ext/toc` inside `ext/Doc` pages (`ai/2026-09-18/dead-nav/task.jsonl`, item 1)

Seven Doc module pages call `toc()` but the Doc's tabbed shell nests the rail one level too
deep, so it never draws. Read `ext/Doc` and `ext/toc`; place the rail where the Doc shell's
grid can seat it (the docs three-region shape); prove on `/framework/core/App/` and
`/framework/ext/markdown/` at 1920 that a rail draws and the related aside (landed today on
`core/Page`) does not overlap it; at 1280 and 400 nothing regresses.

If the seat needs a Doc-shell change larger than twenty lines, stop at a written proposal in
`ext/toc/doc/decisions.md` and say so.

## Fence

`public/layouts/doc/studies/approved/**`, `public/framework/core/Page/**` (the Store part
only), `public/framework/core/Sidebar/**` (the store use only), `public/framework/ext/Saver/**`,
`public/layouts/shell/Shell.js` (its store use only), `public/framework/ext/toc/**`,
`public/framework/ext/Doc/**` (item 3 only), your task dir. Nothing else.

The owner's dev server on port 80 is running: never touch it; core is live — one write per
file, verify within a minute. Never `git stash`, never `find /`, never drive the owner's tabs;
an `rg` pattern starting with `/` returns nothing here — drop the slash.

## Final report

Three lines, one per item, each with what changed and the number that proves it.
