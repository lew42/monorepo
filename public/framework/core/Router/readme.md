# Router — design record

Everything between *"a url changed"* and *"the DOM reflects it"*.

Each verdict below is the short form. The full reasoning lives in `./doc/`, one
file per question, and the same files render as note pages under
`/framework/core/Router/`. A verdict of *keep* is as valuable as a change — it
stops the same idea being re-litigated.

## Decisions

**Why a Router at all, when `App` used to do this?** The moment resolving a
segment can `await` an import, it stopped being boot logic. App keeps boot and
the one container; Router keeps the url — that is the whole split, and why `App`
no longer has a `load_page`.

**How does a click know a url is real before navigating?** It can't — a registry
can only contain imported pages, which are exactly the ones laziness avoids
importing. Verdict: optimistic interception — load first, push second, hand a
genuine miss to the browser. See ./doc/registry-gate.md.

**What does a navigation touch?** Only the difference between the two chains:
deactivate deepest-first, activate shallowest-first, shared leading pages never
touched — so a sidebar built by an ancestor is not rebuilt and does not flicker.
See ./doc/chain-diff.md.

**What does the Router write to the DOM?** Two classes (`.active-page`,
`.active-ancestor`) and a link pass (`.active`, `.in-path`); every arrangement is
CSS a page opted into. Scoped to `$app`, never `document`. See ./doc/marking.md.

**Why await styles and titles in `load()`, not one line later in `activate()`?**
`activate()` must stay synchronous so a site can wrap the swap in
`document.startViewTransition()`; `allSettled`, so a broken child or a 404'd
stylesheet costs a warning, not every later navigation. See ./doc/styles-loaded.md.

**One post-navigation hook or two?** `app.navigated?.(page, from)` — built.
`page.entered?.()` — refused: a page is `display: none` until `mark()` runs, and
merging two different subjects produces one method with a flag. See
./doc/navigated.md.

**Why reset scroll on navigate, when removing it looks safe?** The browser clamps
`scrollTop`, so short pages self-correct and hide the bug; `.closest(".pages")`
because the region scrolls, not the page. No per-url scroll memory — Back lands
at the top too. See ./doc/scroll-reset.md.

**`redirect()` and `Router.enter()`?** Backed out — both existed to pay for one
layout's convenience. If a real need returns it is "redirect, not alias": two
live urls for one state breaks the url→state encoding. See ./doc/backed-out.md.

## Measured

Warm navigation 0.2ms median; `mark()` 89µs over 49 anchors; the serial walk is
RTT + 16ms per segment and cannot be parallelised blindly — a segment's children
are unknown until its module has run. Full numbers: ./doc/measured.md.

## Open

- **No in-flight guard.** Two fast clicks start two walks; the slower one can win.
  Asked for by three seats. Unfixed because the correct behaviour isn't obvious —
  cancel the first, ignore the second, or let the last win.
- **The query string is dropped on a click.** `go()` pushes `link.pathname`.
  Asked for by three seats.
- **First paint waits for the whole walk.** Nothing paints until every loader
  resolves; the chrome could have painted 1765ms earlier on a measured deep link.
  Kept deliberately — an empty tab bar is the bug `tabs()` was changed to avoid —
  but it is not free and should stop being described as if it were.
