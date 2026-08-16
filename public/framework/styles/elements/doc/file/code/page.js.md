## What this file is

Why `pre` and `code` need different padding (one is a block, one is inline),
the two component tokens (`--code-bg`/`--code-ink`) that let dark code blocks
be two values instead of a three-selector fight, and the open question on
`kbd`/`samp` missing the mono font.

## The four-stylesheet finding

Before the fix this page documents, four separate files had an opinion about
one box's padding (`framework.css`, `md.css`, `demo.css`, `highlight.css`,
three of them independently overriding the same rule within 0.15em of each
other). Stated as the strongest evidence in this whole module for "overriding
the framework is a bug report about the framework."

## Improvements

1. **The `kbd`/`samp` gap is still open**, named here and in
   `doc/framework-css.md` as a two-word fix deliberately not applied because
   "looks like code" and "is code" are different claims. A specific,
   scoped fix if someone wants to close it. *(simple, useful)*
