Structure only — the one thing a fixed panel cannot leave to the theme: a
surface, so it reads over whatever the page happens to be showing. Every
colour is a token; what a caller draws inside the two slots is that caller's
own look.

## `rem`, not `em`, for the width

The shell's padding resolves against `.app`'s font-size (`framework.css`) and
this rail's own inline-size against its own `0.85em` — sizing `--drawer` in
`em` would size the reserved strip against one base and the rail against
another, and the two would drift apart the moment either font-size changed.

## `z-index: 40` is wedged between two other fixed layers on purpose

`.demo.max` sits at 30 and the mode toggle at 60 — the rail has to reach over
a full-screen demo (so it is not buried under one) without covering the
scheme switch (so a reader mid-demo can still find it).

## Two classes on the ✕, not one

`.drawer .drawer-x` clears the theme's `:is(button, .btn)` rule at 0-2-0
specificity. A single-class `.drawer-x` alone would still lose to that rule,
which pads every button to `0.7em`/`1.4em` and would make the ✕ four times the
box it needs.

## Improvements

1. **`inset-inline-end: var(--devbar, 0px)` assumes `framework.css` already
   reserves the sum of the dev rail and this one** — a single shared source
   for that sum, rather than two files independently agreeing on it, would
   remove one more place the two rails could silently disagree if either
   width changes. *(medium, speculative.)*
