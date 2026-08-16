`md.file(meta, url, options)` is the module's other entry point: instead of a
string, it takes a **location** and returns a **promise** of a `div.md`.

```js
content(){ return md.file(import.meta, "readme.md", { h1: false }); }
```

## Resolves against the module, never the document

`new URL(url, meta.url)` — always pass `import.meta` as `meta`. With the SPA
fallback the document's url *is* the current route, so a document-relative
`fetch("readme.md")` from `/framework/core/x` (no trailing slash) would hit
`/framework/core/readme.md` instead. Same shape as `View.stylesheet(meta, url)`
and `View.load(meta, url)`.

## It's a promise, not a self-filling view

By the time the fetch resolves, `View.captor` is whatever is building *now* — the
capture stack that was live when `md.file()` was called has long since unwound.
So the returned view is built with `{ capture: false }` and filled later; placing
it is `View.append`'s job (`append_promise`), which is also what lets
`App.load_page` await it before swapping the DOM, so a page never flashes empty
and then fills in.

## `{ h1: false }`

Drops a leading `<h1>` from the parsed result. A readme opens with its own
title, and a `Page` already renders `title` as an `<h1>` — used together they'd
show the title twice. Off by default: `md.file()` on its own renders the file
exactly as written.

## The 404 branch reads as an invitation, not a fault

A failed fetch does not throw past this function — it renders `.md-error` text
instead, so a broken page beats a broken render. As of today the copy for a
`404` distinguishes itself from every other failure: **"Not written yet —
`<url>`"** rather than "Error loading". A missing doc page is the normal state
of a module nobody has documented yet, not a bug, and the copy now says so.
Any other status or a network failure still reads "Error loading `<url>`:
`<message>`".

The failed fetch is also evicted from `md.cache` (`delete md.cache[href]`) so a
page written five minutes later is picked up on the next visit rather than
being stuck showing the old error forever.

## Links inside the fetched file are rewritten

Before returning, the view is passed through
[`md.resolve`](/framework/ext/markdown/api/resolve/) so a relative `href`/`src`
in the fetched markdown resolves against **the file**, not the document. See
[Relative links](/framework/ext/markdown/docs/relative-links/) for the bug
this fixed.

⚠ A link inside *this very file* pointing at another member page has to be
**absolute** (`/framework/ext/markdown/api/resolve/`), never relative — a
relative link here resolves against `doc/method/file.md`'s own fetch url,
which mirrors the `doc/` folder, not the `/api/`, `/docs/` route tree the
sections actually live at.
