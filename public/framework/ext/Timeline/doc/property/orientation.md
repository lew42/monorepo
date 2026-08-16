# orientation

`"h"` (the default) or `"v"`. Read once, inside `render()`, and turned into
exactly one class: `this.ac(this.orientation === "v" ? "v" : "h")`
(`Timeline.js:38`). Any value other than the literal string `"v"` renders
horizontal — including a typo like `"vertical"` — with no warning.

`.h`/`.v` decide which axis `--t`/`--d` map to in `Timeline.css`; nothing else
in the class branches on this property directly.

Because it is applied only inside `render()`, writing `.orientation` on a
live, already-mounted instance does nothing — there is no live toggle. See
`doc/reverse.md` for the class it pairs with, and the readme's Decisions
section for why a live switch is deferred to `ext/layout`.

## Improvements

1. **Silently swallows a typo.** `orientation: "vertical"` renders horizontal
   with no signal anything is wrong. A one-line `console.warn` on a value
   that is neither `"h"` nor `"v"` would turn a silent wrong-render into a
   loud one. *(simple, useful)*
