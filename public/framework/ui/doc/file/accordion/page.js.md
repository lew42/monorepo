The accordion exhibit (a FAQ, exclusive via a shared `name`) plus one variant
(`markers` — with and without the UA's disclosure triangle).

## The whole component is one attribute

A shared `name="faq"` makes the browser treat a group of `<details>` as
mutually exclusive — no listener, no state, and the open panel is the DOM's
own `open` attribute, verified in the browser rather than assumed (opening
the second panel closed the first with nothing subscribed). Drop the
attribute and the panels open independently; that is the only knob, and it's
the browser's.

## A trap that stopped reproducing

An earlier version of this page warned that a `display` utility on
`<details>` defeats the UA's hiding — true only of `<dialog>`. Measured in
Chromium: `display: flex` on a *closed* `<details>` stayed hidden
(`checkVisibility()` false), because a closed panel hides through
`::details-content` rather than a UA `display` rule an author can out-rank.
The page was rewritten to what the probe actually showed, recorded in
`doc/record.md` §10 as a "a demo that proves nothing looks exactly like a
demo that proves something" case — the demo *next to* the false claim had
also been shipped without the class that made its own point.

## Improvements

Nothing ranked: the corrected trap is the more valuable version of this
file precisely because the wrong one was caught and the correction was kept
visible rather than quietly deleted.
