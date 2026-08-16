# span(items)

Computes `[from, to]`, the visible domain, in milliseconds. An explicit
`this.from`/`this.to` wins outright; otherwise it flattens every item's
`at`/`from`/`to` into one list of stamps and takes the min/max, padded
`±15 minutes` (`PAD`), with `Date.now()` folded into both the min and the
max so an all-past or all-future dataset still domains through "now".

Pure — reads `this.from`/`this.to` and the `items` argument, returns a pair,
touches no DOM. Called once, from `render()`.

## Improvements

1. **`Math.min(...stamps, Date.now())` on a large `items` array risks a
   spread-argument stack limit** (V8's is in the hundreds of thousands, so
   this is a real ceiling, not a practical one at today's data sizes — the ai
   adapter's own dataset is a few hundred items at most). `stamps.reduce`
   would remove the ceiling entirely for the same line count. *(simple,
   speculative — no dataset here is close to the limit.)*
