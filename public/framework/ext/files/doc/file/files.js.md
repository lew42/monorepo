# `files.js`

The door and the pieces: the exported `files(meta, names, { about })` factory,
the two region renderers it shares with `panels.js` (`tree`, `source`), and the
three private helpers that turn a flat, space-separated string of paths into a
nested structure (`common_dir`, `nest`, `rows`).

What it deliberately does **not** hold is the arrangement — that is
[`panels.js`](./panels.js.md), and this file reaches it through a dynamic
`import()`.

## The shape: place the box now, arrange it later

```js
return div.c("files", () =>
	import("./panels.js").then(m => () => m.panels({ meta, paths, cut, about })));
```

Three things at once, and each is load-bearing:

- **The box is placed synchronously**, so `files()` returns a real view to
  whatever captor called it. Capturing is synchronous — a factory call after
  the import resolved would append wherever the captor had drifted.
- **The import is lazy**, because `app.js` re-exports this function for the
  whole site and ext/Panel is roughly a dozen modules. A static import would
  make every page on the site pay for the handful that draw a browser.
- **A promise resolving to a FUNCTION**, never to a view. `append_promise`
  awaits it and `append_fn` runs the function with the captor back on `.files`,
  which is what lets `panels()` build with element factories.

## `tree` and `source` are exported for one caller

Both are called from `panels.js` and nowhere else, and they live here rather
than there because they are what a *file browser* renders — `panels.js` is only
where the regions are put. The split is what keeps both files under a screen.

`tree(paths, cut, selected)` takes the selected path rather than reading it
from anywhere: a region draws from state it was handed, and the panel that owns
the state is the one that hands it over.

## The "returned, not called" shape, in `source()`

`source()` hands back a **promise** on the `ext/highlight` path (`code.file()`
is `capture: false` — nothing to place until it resolves) and a `pre` it built
on the fallback path. Its caller wraps it in a callback —
`div.c("file-source", () => source(meta, path))` — so `append_fn` handles both:
the promise is awaited and appended, the `pre` placed itself and is re-appended
to the same parent. Calling it outside a captor and dropping the value renders
nothing, silently.

## `common_dir`, `nest`, `rows`: segment-wise, never character-wise

`common_dir()` counts how many leading **path segments** every file shares,
comparing whole segments so `app.js` and `app2.js` never collide mid-name.
`nest()` turns the flat list into `{ "file.js": "full/path/file.js", dir: {…} }`
— a string leaf is a file holding its fetchable path, an object is a
directory. `rows()` walks that structure and renders it, marking the selected
row as it goes; insertion order is declaration order, which is the order the
author wrote the paths in. Full record: [tree](../tree.md).

## `source`: an ext leaning on an ext, softly

```js
if (code.file) return code.file(meta, path);
return pre.c("code-block", () => code().append(fetch(...).then(resp => resp.text())));
```

With `ext/highlight` loaded (`app.js` always loads it), `code.file()` fetches,
highlights and **caches by href** — which is what makes repainting the source
panel on every click free. Without it, this file falls back to a plain `<pre>`:
an ext may lean on an ext; only core may never.

## Improvements

1. **The fallback path never checks `resp.ok`.** `code.file()` does
   (`if (!resp.ok) throw …`); the `pre.c(...)` fallback two lines below it in
   this same file does not — a missing file resolves with whatever body the
   SPA fallback served (typically `index.html`) and renders it as if it were
   the file's contents, with no visible error. Currently masked because
   `app.js` always imports `ext/highlight`, so `code.file` is truthy on every
   page of this site; not masked for any other caller of `files()`.
   *(simple, important — one line, matching `md.file()`'s existing guard.)*
2. **No loading state.** Between `files()` returning and `panels.js` arriving,
   the box is empty — one module fetch on a warm cache, longer on a cold one,
   and now with an import in front of it where before there was none. A
   skeleton row or a `muted` line would cost three. *(simple, useful)*
3. **`rows()` marks the selection at build time and `mark()` toggles it
   afterwards** — two writers of one class, in two files. Correct as written
   (the build-time pass is for a panel that did not exist when the click
   happened), but if a third writer ever appears this wants to be one function.
   *(simple, speculative)*
