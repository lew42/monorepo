The whole module's behavior: one method (`Page.prototype.catalog`), patched
on by importing this file, plus the two private functions it needs —
`screen()` (what a catalog page renders) and `reveal()` (scroll the active
card into view once). ~60 lines total; [`catalog.md`](/framework/ext/catalog/api/catalog/)
covers the method itself, this page is about the file's own shape.

## Three responsibilities, three functions

`catalog()` is pure rearrangement — it touches `this.children` and
`this.content`, nothing else, and returns `this` so it chains like every
other `Page` method. `screen()` is the actual renderer, assigned to
`this.content`, and it owns the first-paint sequencing: build the rail and
the `$pages` region synchronously, then once loading settles, mount the
first (intro) child as the region's default and tell the router to mark the
links the rail just built. `reveal()` is one line of `querySelector` +
`scrollIntoView`, kept separate because it runs on a different trigger
(`app.ready`, not the loading promise) and for a different purpose (the
deep-link case, not the cold-load case).

## The ordering comments carry real constraints

Each `⚠` in this file marks something that would silently misbehave if
reordered, not just a preference:

- `content` is read out of `this` **before** `this.children.clear()`,
  because `catalog()` needs the *original* value to build the intro; reading
  it after would capture the replacement function it's about to become.
- `this.app?.router?.mark_links()` runs **after** the cards are appended —
  the cards are real `<a>` elements built by `previews()`, and a mark pass
  that ran before they existed would leave every one of them unmarked.
- `reveal($rail)` runs **after** `inject()` (via `app.ready`), because
  `scrollIntoView` on a detached element is a no-op — and it is not
  `return`ed into `filling`, because `filling` is the cold-load gate and
  `ready` resolves later than that, on purpose.

## Improvements

1. **No guard against calling `catalog()` twice on the same page.** A
   second call re-wraps the first call's `screen`-as-`content` and inserts a
   second `"intro"` keyed over the first. Nobody does this today, but the
   fix is one line and turns a silent nested-rail into a clear no-op:
   `if (this.content === screen) return this;`. *(simple, useful)*
2. **`screen` and `reveal` are module-level, not statics on `Page` or
   methods of `Doc`.** That's the right call — they're private to this file,
   never called from outside it — but it means a reader has to already know
   to look past the exported `catalog` to find where the real work happens.
   A one-line comment at the top pointing at both would save the trip.
   *(simple, speculative — the file is short enough that this may not be
   worth it)*
3. **`this.app?.loaders?.push(filling)` only matters for a cold load that
   lands directly on a catalog page.** That's documented in `doc/decisions.md`
   now, but not in the file itself, where the line reads as unconditionally
   necessary. A short comment naming the `Router.load()` guarantee it's
   defending against would save the next reader the archaeology this audit
   did. *(simple, useful)*
