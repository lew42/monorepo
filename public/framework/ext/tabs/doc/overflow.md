*"Right for ~5 children, unusable at twenty"* was this module's headline trap for as
long as it existed — theoretical until [`core/View`](/framework/core/View/api/)
documented fifty members. Flipped to a bar, fifty wrapping links were 500px of nav
above the content they navigate.

## One strip that scrolls, never a wrapping block

`flex-wrap: nowrap` plus `overflow: auto` on both axes, and a `max-height` on the
rail so `position: sticky` means something — a rail taller than the viewport sticks
its top and puts its own last entries out of reach forever.

## The hidden scrollbar has to be paid for

The scrollbar is hidden (`scrollbar-width: none`), so `reveal()` — the unexported
helper at the bottom of `tabs.js` — scrolls the selected tab into the strip on the
way in. The same bargain [ToC](/framework/ext/toc/) makes: hiding a scrollbar is
only honest if something keeps the current item in view. `scrollBy` on the bar,
never `scrollIntoView`, which walks up and scrolls the region too.

## The `64em` breakpoint is one measurement, not a formula

Chosen against `/framework/core/View/api/append/`'s rail sitting inside `/framework/`'s
topic region (viewport minus a 19em sidebar) — at the old `45em` the rail was still
vertical inside a 657px region and left 377px for the source panel, not one full
line readable. `64em` (1024px) clears both boxes. A host with a narrower or wider
sidebar has not been measured, and nothing on the site has yet pushed a vertical
rail past `View`'s fifty members — the scroll-and-reveal behaviour is proven at
exactly one size.
