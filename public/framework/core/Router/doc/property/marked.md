The views wearing my two classes right now — `.active-page` on the leaf,
`.active-ancestor` on its ancestors. `undefined` until the first navigation.

## Usage

Written and read in one method, and by nothing else anywhere:

- `Router.js:119` — `mark()`, unmarking the previous chain.
- `Router.js:121` — `mark()`, recording the new one.

## Necessity

It is what makes the wipe **only what I marked**. `mark()` runs after
`this.active` has already moved, so the chain it just left is no longer derivable —
this list is that memory, and it holds views rather than pages so a page whose
view was replaced cannot be missed.

⚠ The alternative it replaced was a `querySelectorAll(".active-page,
.active-ancestor")` across `$app`, which also cleared the marks a widget wrote on a
page of its own: the arrangement contract then hid that page on the next click
anywhere, `display: none`, nothing thrown.

## Simplicity

Right-sized — one array, assigned by the `map()` that does the marking, so the
record cannot drift from the act. It is not API: a site reading it is reaching past
`app.navigated?.(page, from)`, which hands over the same change at the one moment
it happens.
