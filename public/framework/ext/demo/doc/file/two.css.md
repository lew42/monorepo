The two-up's own three rules: the row, a pane, the split handle. Everything
else it wears (`.demo-stage`, `.demo-tools`, `.demo-screen`, `.demo-size`) is
`stage.js`'s and `stage.css`'s, composed rather than restyled — this file is
deliberately small because there's little left for it to own.

## The right pane is unconstrained on purpose

`.demo-sim { flex: 1 1 0 }` — only the *left* pane gets an explicit
`flex-basis` percentage, written inline by `two.js`'s `split()`; the right pane
always takes whatever's left. One flex rule, one JS write, no second class for
"the other side."

## Improvements

1. **`.demo-split`'s `min-height: 4em` is a bare number with no comment
   explaining what it guards against** — almost certainly "don't let the handle
   collapse to nothing in a very short stage," but that reasoning isn't
   written down anywhere in this three-rule file. *(simple, useful.)*
2. **This file has no dark-mode-specific block**, same as `app.css` — worth
   confirming as a pattern rather than an oversight, since every colour here
   is `--line`/`--prim` tokens that already flip with the theme.
   *(simple, speculative.)*
