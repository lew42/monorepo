# DefaultView — what it reads, how it stays live, and why it is the only one

## One view, not three (2026-10-28)

There were three overlapping views here: `object()` (a small card), `view()` (a tree of rows) and `inspect()` (a card whose object properties opened as nested cards). They showed the same thing three ways, so they were merged into `view()` (law 6, one of everything). `object()` and `inspect()` still work: each calls `view(x, { open: 1 })` and is marked deprecated. What they lost: `object()`'s `doc`/`api` links from a name to its doc page (no caller outside this module used them) and `inspect()`'s `variant: "full"` (it was identical to `"card"`). `variant: "minimal"` is the closed row. The old code is in git history.

`InstanceTree` stays: it is a tree of the site's pages, not a view of one object, and it opens each page with `view()`.

## The row (closed)

- the class's `static icon`, else `"data_object"`;
- the id (a uuid is cut to 8 characters, the whole id on hover), then the title, muted, when it says something the id does not;
- the class name as a small label (`class` for a class);
- counts: one per List the object owns (`2 items · 1 tasks`), entries for an array, Map or Set, methods for a class.

## Open

- **Rows:** an Item's `data` fields, then its other own properties. Skipped: `_private` names, functions, DOM and View nodes, `undefined`. `properties` replaces the list; `static shown` and `static hidden` reorder and drop.
- **By type:** a primitive is written out (a path or url is a link); an empty List, array, Map or Set is a plain row with its count; an object the subject owns nests its own default view, built only when it is opened, one `open` level less.
- **References:** something not the subject's to draw is one row saying where it points: its `parent`, a sibling, a `Store` (any class named `Store` up the chain), or an object already open above (a cycle, `↺`). A `parent` that is the row this one sits in is not shown at all. A click flashes every view of the target and scrolls the first into sight.

## Live

- Each view pushes itself into `subject.views` (`core/Item/Item.js`, a getter over `_views`; a WeakMap for other emitters).
- Each object gets ONE `"delta"` listener, which walks its views (`DefaultView.walk`). Deltas bubble up through `parent`, so a view acts only when the change is its own:
  - **origin is the subject, a `set` line:** each named row is rebuilt alone and swapped in place (`update(k)`), the others are untouched, and the new row flashes.
  - **origin is the subject, a List verb** (add, remove, move, order, clear): `reconcile()` keeps each member's view, makes new ones, drops gone ones, and moves only what is out of place.
  - **origin is one of the subject's own lists:** the count in the row changes; a list that went empty or stopped being empty changes its row's kind.
- A view whose element has left the page (after it was once on it) is dropped from `views` on the next change.

## Tested

`DefaultView.test.js` (a browser test, `X.test.js` in core/Test's naming): 16 checks on one tree, each reading the real elements. It runs on the [watch page](/framework/core/Item/watch/), which shows the verdict.

## Not built

- `List.render()` drawing each member through its own view (ask 32): `core/List/List.js` is owned by the data backbone build; asked for there. `view(list)` draws the same thing today.
- Step-by-step rendering while a test runs (ask 26, phase two).
