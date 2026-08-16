The tool's own chrome: report cards, the before/after twin panes, the element
mirror, the live resize panel, and the two tokens the audit page needs to be
full-width with a gutter. A `@layer theme` block and one `@layer util` rule,
with the layer list restated in full per the trap every stylesheet on this site
has to repeat.

## The one `util` rule is a correctness fix, not a look

`iframe[data-layout-ignore] { max-width: none }`. `framework.css`'s base reset
is `iframe { display: block; max-width: 100% }`, and `frame()`'s hidden
measuring iframe inherited it — so `frame(url, 3440)` from a 1920 window laid
out at **1920** and reported it as 3440, silently, on every wide run of the
suite, the audit and the library. `util` is the layer because `base` is what it
has to beat.

⚠ The declaration belongs in `frame()`'s own `cssText` as well: a caller that
uses `frame()` without loading this stylesheet still measures clamped.

## `.lt-twin` is a pair, declared — not `auto-fit`

`grid-template-columns: repeat(auto-fit, minmax(min(26em,100%),1fr))` alone
generated a **third, empty track** at 1700px and left the before/after pair
huddled in the left two-thirds. The fix is a plain media query forcing
`repeat(2, minmax(0,1fr))` above `56em` — a rare case on this site where an
explicit breakpoint beats an intrinsic one, because "exactly two, or stacked"
isn't a size `auto-fit` can express.

## `.page.lt-page` restates the two gutter tokens instead of taking `full`

`.page.full` zeroes `--page-pad`, which would strand the page's own `<h1>`
(rendered by `Page`, outside anything this file controls) flush in the corner.
Full width *with* a gutter is `--measure: none` plus a real `--page-pad` —
two tokens, declared explicitly — rather than `full` with the padding put back
by hand.

## The shot pane clips; the script owns its height

`.lt-shot` is `overflow: hidden` because the iframe inside it renders at the
**audit's own width** and is scaled down with `transform`, not resized — so
the window is a picture frame, and `twin.js`'s `ResizeObserver` is what keeps
the frame's own height in sync with the scale.

## Improvements

1. **The `.lt-mirror-stage:has([data-lt-before])` outline is the only place a
   `:has()` selector appears in this file** — worth a one-line comment on
   browser support if this site's floor ever needs restating (currently
   assumed evergreen elsewhere on the site too, so consistent, just easy to
   miss on a skim). *(simple, speculative.)*
2. **`.lt-live-panel`'s `data-layout-ignore` is set in `live.js`, not here** —
   the CSS class name gives no hint that the panel is self-exempting, so a
   reader of this file alone would not learn the trap. A one-line comment
   pointing at `live.js` would close the loop the way the twin/mirror sections
   above already do. *(simple, useful.)*
