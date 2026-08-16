`md.js` is the whole module: importing it patches `View.prototype.md`, and its
default export is the `md()` factory. Everything else in this directory —
`md.css`, the vendored `marked.esm.js`, `page.js`, `example.md` — exists to
support or demonstrate what this one file does.

## Two entry points, one parser

`View.prototype.md(content)` (line 25) sets an existing view's markup;
`md(content)` (line 51) is a standalone factory that behaves like `p()` —
capturing, chaining, adopting into whatever `View.captor` currently is. Both
funnel into `marked.parse` / `marked.parseInline`, chosen by `block_tags`
(line 8) so `p().md("**hi**")` never nests a `<p>` inside a `<p>`.

## The fence file-label override (line 30–47)

Added 2026-08-15. `marked.use({ renderer: { code(token){ … } } })` **calls**
the stock renderer rather than replacing it, then splices a `data-file`
attribute onto the resulting `<pre>` when a fence's info string carries a
second word (```` ```js /app.js ````). Full record:
[File labels](/framework/ext/markdown/docs/file-labels/).

## `md.file`, `md.details`, `md.resolve`, `md.cache` (line 69–150)

The promise-returning half — fetch, parse, rewrite relative links, cache. See
their own pages: [`file`](/framework/ext/markdown/api/file/),
[`details`](/framework/ext/markdown/api/details/),
[`resolve`](/framework/ext/markdown/api/resolve/),
[`cache`](/framework/ext/markdown/api/cache/).

## `html_unsafe`, never `html`

Every write to the DOM in this file goes through `html_unsafe` (lines 27, 42,
72). Full reasoning: [Sanitization](/framework/ext/markdown/docs/sanitization/).

## Improvements

1. **`patched()` false-positives on every method of a "function with
   properties" `subject`.** Not a bug in this file — the root cause lives in
   `util/source/source.js`'s `patched()` and is exercised by
   `ext/doc/Doc.js`'s `member_page()` — but it manifests here: every method
   this module documents (`md.file`, `md.details`, `md.c`, `md.resolve`) is
   necessarily assigned via `md.x = function(){}`, a member-expression
   assignment, which JS gives an empty inferred `.name` — the exact signal
   `patched()` uses to mean "an ext replaced this at runtime." Every one of
   this module's API pages will show a false "Replaced at runtime" banner
   that names nothing that ever patched it. *(medium fix, important — see
   the audit report's top recommendation)*.
2. **The fence override's string-replace assumes marked's default `<pre>`
   has no attributes of its own.** True today; a future vendor bump that
   changes the default renderer's opening tag would make the label silently
   stop appearing. A comment says so; nothing enforces it. *(simple, useful —
   a one-line regex instead of a literal string match would be sturdier)*.
3. **`md.c` and the `marked` re-export in `app.js` have no callers.** Carried
   from a prior audit, re-verified today, not yet acted on:
   [Proposed](/framework/ext/markdown/docs/proposed/). *(simple, useful)*.
