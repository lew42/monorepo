Every stylesheet promise, in load order.

**Usage** — pushed by `View.stylesheet()` (`View.js:434`); awaited by
`App.styles_loaded()` before the first page is shown.

**Necessity** — yes. It is the whole reason the site does not flash unstyled
content: one array, awaited once, and nothing needs to know which module asked for
which file.

**Simplicity** — right-sized, with one invariant that must never be broken:

> **Every promise pushed here must settle.** A `<link>` that 404s fires `error`,
> not `load` — and one unsettled promise here was a permanently blank page with a
> clean console. `stylesheet()` resolves on error and warns, which is why the page
> now renders unstyled instead of not at all.

It grows for the life of the document and is never cleared. That is correct — a
stylesheet is never unloaded — but it means the array is also a complete, ordered
record of what was injected, which is worth knowing when debugging layer order.

