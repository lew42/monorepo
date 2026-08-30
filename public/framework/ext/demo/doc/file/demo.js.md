The module's entry point and the box door: `demo(fn)` — code pane, render,
caption, HTML pane — plus `demo.stage`, `demo.source` and `source_block()`,
the one code surface `page.demo()` draws its peer column with. Everything else in the directory (`app.js`,
`exhibit.js`, `layout.js`) imports this file and patches more onto `demo`; this
file never imports them back, which is what keeps the pair from becoming an
import cycle.

## The argument parse is the whole API surface

`args.findIndex(is.fn)` finds the function among positional strings and an
optional options object — no options object for the common case, so
`demo("Label", fn, "caption")` reads as a sentence. A call with no function at
all renders `.demo-error` rather than throwing, the same non-fatal contract
`md-error` uses elsewhere.

## The bar is captured before it's filled

`div.c("demo-bar")` is placed early and appended into later — its controls (the
`<>` toggle, the optional full-size link) point at things built further down
(`$render`, `opts.full`), so it has to exist in the DOM before those exist, and
`$bar.append(fn)` re-establishes the captor when it's finally filled. Building
those controls any earlier would mean building DOM with no render to point at
yet.

## Two soft dependencies, tested by feature

`caption()` checks `view.md` before falling back to `backtick_append`;
`source_code()` checks `code[lang]` before falling back to a plain `code()`.
Neither `ext/markdown` nor `ext/highlight` is imported — the check for whether
either loaded *is* the dependency check, so a page using `demo()` alone never
pays for either.

## Improvements

1. **`source()`/`dedent()` are re-exported here but live in `util/source`** —
   correct (this file's own comment explains why: `ext/highlight`'s `code.fn()`
   needs the identical transform), but a newcomer grepping this file for their
   definition will not find one. Worth a one-line pointer at the export.
   *(simple, useful.)*
2. **`source_file()`'s fallback (no `ext/highlight` loaded) builds a bare `<pre>`
   with hand-written fetch/error handling** that duplicates a smaller version of
   what `code.file()` does when it's present — acceptable as a fallback, but the
   two error-message shapes ("Error loading X: 404" vs whatever `code.file`
   prints) could read as inconsistent to a reader who sees both on the same
   session. *(simple, speculative.)*
