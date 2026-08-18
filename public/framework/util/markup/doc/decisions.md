# markup — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## Used by

One caller: [`ext/demo`](/framework/ext/demo/)'s html pane
(`demo.js:94`). The move to `util/` was made on the same "two callers must
agree" reasoning as [`source`](/framework/util/source/) — but the anticipated
second caller (an element-reference page) hasn't been written yet. See
[doc/design.md §2](/framework/util/markup/doc/design/) for the honest accounting.

## Decisions

**Walk the DOM, don't pretty-print `innerHTML`.** Sixty lines, can't
mis-parse anything, and reports what's actually there.

**Nothing is escaped — the renderer owns that, once.** Escaping here too
prints `&amp;lt;div&amp;gt;` on the page; written at the top of `attributes()`
because that's where the next edit will be tempted.

## Traps

- **Escaping in this file would double-escape everywhere it's shown.** The
  single highest-value line in the module — see `attributes()`.
- **`<pre>`/`<textarea>` are copied verbatim, however long.** Re-indenting
  them would change what they render.
- **A serialized `<a>` can carry classes you didn't write** — `Router` really
  did add `.in-path`. Kept on purpose; a serializer that hides DOM state
  isn't trustworthy for the next question either.

## Open

- **The second caller that justified moving this to `util/` doesn't exist
  yet.** Full accounting: [doc/design.md §2 and §7](/framework/util/markup/doc/design/).
- Three copies of "which tags are inline" now exist across `markup`,
  `ext/markdown` and `ext/highlight`, and agree only by coincidence.
