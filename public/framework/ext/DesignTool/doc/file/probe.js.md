The only file in the module that touches the DOM. One preorder walk —
`getBoundingClientRect` + `getComputedStyle` per element, then a `Range` per
text block for real line boxes — turned into a flat array of plain facts.
Everything downstream (`ratios.js`, `rules.js`, `polish.js`, `score.js`) is
arithmetic on that array and never looks at a live element again, which is
what lets the same rules run on a page, an iframe, or a JSON capture taken an
hour ago.

## Every read goes through the root's own `window`

`root.ownerDocument.defaultView`, never the bare global — the one habit that
lets the same probe measure an iframe from outside it. `innerWidth` off the
wrong window silently reports the parent's viewport and invalidates every
responsive metric with no error at all.

## Scale accumulates forward; a computed style doesn't

`getComputedStyle(el).zoom` answers the element's *own* zoom, not what it
inherited, so a control inside a 0.25× demo stage would read as scale 1 while
its rect is a quarter size. `scale_down()` walks nodes in preorder (parent
always pushed first) and multiplies each by its parent's `escale` in one
forward pass — the fix for what was, before it existed, 3231 false tap-target
findings.

## Line count is rect *centres*, clustered — not rect tops

An inline `<code>` or `<sup>` sits on the same visual line at its own top, so
counting distinct tops read five inline spans as five extra lines. Centres
within `max(4, lh * 0.55)` of each other are one line — the fix that took a
"23 characters per line" false reading on ordinary prose back to reality.

## A crop is two facts, and the probe reads both

`maxh` (does it carry a `max-height`) and `clamp` (does it carry a
`-webkit-line-clamp`) are recorded separately, as facts — `ratios.js`'s
`crops()` is the judgment that either one means "cropping on purpose". Reading
only `max-height` made every inline `<code>` past a two-line clamp report as
content cut off, 12 of the site's 79 high-severity clips.

## Addresses are `:nth-child()` paths, not walk indices

Covered in full — this is the file that produces the path every other tool in
the module resolves. See [Addressing](../../docs/addressing/).

## Improvements

1. **`per_line`'s "total inked width ÷ characters" formula is subtle enough
   that a future editor could easily "simplify" it back to `chars / lines`**
   — which looks equivalent and is not (it only moves when the line *count*
   changes, and reported an identical 112.3 at two different widths before
   this fix). The comment explaining why is good; a one-line unit-style
   regression test alongside `tests/cases.js` would make the mistake harder to
   reintroduce than a comment alone. *(medium, useful.)*
2. **`SKIP` and `INTERACTIVE` are two hand-maintained tag sets** with no
   single place documenting why each tag is in one, the other, or neither
   (e.g., why `<summary>` is interactive but `<details>` isn't walked
   specially at all). A short table in `knowledge/false-positives.md` would
   give the next false positive a place to land. *(simple, speculative.)*
