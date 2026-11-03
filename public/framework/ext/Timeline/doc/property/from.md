# from

Optional. An explicit domain start — ISO string or epoch-ms number, per
`stamp()`'s coercion — overriding the default of "the earliest item's own
timestamp, minus a 15-minute pad" (`span()`, `Timeline.js:56`–`62`).

Pairs with `to` (`doc/property/to.md`); pass both to pin the visible window
regardless of what the items contain — e.g. to render a fixed calendar day
even if no item starts exactly at midnight.

## Improvements

Nothing ranked: a plain optional override, one line, straightforward.
