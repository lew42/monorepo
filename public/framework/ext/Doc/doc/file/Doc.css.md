The whole look of a doc page, and it is almost entirely **the well** — the band the
title and the tab strip share. The three traps in here are load-bearing and every
one of them is silent:

- `.tabs { display: contents }`, so the strip is a flex *sibling* of the title
  rather than a box under it.
- `--gutter-x` restates `.page.standard`'s clamp, because a doc page declares its
  own and never sees an inherited one. **The two values must agree** — it is the
  axis the title, the tab labels and every leaf below them land on.
- `--gutter-x: 0px` inside a section, never a bare `0`: the grid template reads
  `100% - var(--gutter-x) * 2`, and a unitless zero makes that
  percentage-minus-number, which is invalid at computed-value time and drops the
  **whole** template.

## Improvements

1. **`--gutter-x` restates `.page.standard`'s clamp** and nothing enforces that the
   two agree. A shared token would; the reason there isn't one is that `.page.standard`
   declares its own and never sees an inherited value. *(medium, important)*
2. **`--well` is the only hand-rolled recessed surface on the site.** If a second
   caller ever wants one, this belongs in the theme. *(medium, speculative)*
3. **The Files section's height is still a guess, just a declared one.**
   `.doc-files > .files` overrides `ext/files`' `--panel-height` to
   `min(74vh, 42em)` because the browser is the whole tab rather than a figure
   inside a page — the old `max-height: 26em` lean is gone. Checked at 1440 and
   390; the reader can drag the grips, which is the one thing that was missing
   when this was a guess nobody could correct. *(simple, useful)*
