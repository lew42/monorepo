# Router — design record

Everything between *"a url changed"* and *"the DOM reflects it"*.

Each verdict below is the short form. The long reasoning lives in `./doc/`, one
file per question, and the same files render as note pages under
`/framework/core/Router/`. **Every member also has its own file** —
`./doc/method/<name>.md` and `./doc/property/<name>.md`, three concerns each
(usage, necessity, simplicity) — rendered under its real source by `Doc`.
A verdict of *keep* is as valuable as a change: it stops the same idea being
re-litigated.

## Who uses this

One real importer — everything else reaches the running instance through `app`.

- [`core/App`](/framework/core/App/) constructs the one Router (`App.js:56`), awaits
  `router.load(location.pathname)` for first paint (`App.js:58`), and re-exports the
  class so a site can `import { Router } from "/app.js"`.
- [`ext/tabs`](/framework/ext/tabs/), [`ext/catalog`](/framework/ext/catalog/) and
  [`ext/AITask`](/framework/ai/) each call `app.router.mark_links()` bare, for the
  same reason: they render anchors *after* `mark()` has already run for this
  navigation, so `.active`/`.in-path` would otherwise never land on them. No other
  module reaches into the Router — see each method's own Usage section for the
  exact call site.

## Decisions

**Why a Router at all, when `App` used to do this?** The moment resolving a
segment can `await` an import, it stopped being boot logic. App keeps boot and
the one container; Router keeps the url — that is the whole split, and why `App`
no longer has a `load_page`.

**How does a click know a url is real before navigating?** It can't — a registry
can only contain imported pages, and `route()` plus the filesystem probe make the
set of real urls unenumerable. Verdict: optimistic interception — load first, push
second, hand a genuine miss to the browser. See ./doc/registry-gate.md.

**What does a navigation touch?** Only the difference between the two chains:
deactivate deepest-first, activate shallowest-first, shared leading pages never
touched — so a sidebar built by an ancestor is not rebuilt and does not flicker.
See ./doc/chain-diff.md.

**What does the Router write to the DOM?** Two classes (`.active-page`,
`.active-ancestor`) and a link pass (`.active`, `.in-path`); every arrangement is
CSS a page opted into. Scoped to `$app`, never `document` — and `mark()` unmarks
only the views it marked last time, so a page a widget renders outside the chain
keeps whatever mark it gave itself. See ./doc/marking.md.

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

## Proposed

Not applied. Each is a change to a core class, so it wants a critique first.

**Should `root()` be renamed `scope()`?** `app.root` is the root **Page**;
`router.root()` is the app's root **element** — and `load_segments()` reads
`this.app.root` eleven lines above the method called `root`.
*Options:* (a) leave it; (b) `scope()`; (c) drop the method and inline
`this.app.$app.el` at both call sites.
*Weighing:* (c) loses the one place the "never `document`" rule can live, which is
the only reason the method exists. (a) costs a re-read every time either name is
seen near the other. (b) is the same length and says what it is for.
**Recommendation: (b).** Two call sites, both in this file.

**Should `chain()` drop its ternary?** `this.active ? this.active.chain() : []`
spells one idea with two.
*Options:* (a) leave it; (b) `this.active?.chain() ?? []`.
**Recommendation: (b).** Identical behaviour, no other file touched.

**Who re-runs `mark_links()` for links rendered late?** Three external callers, and
all three are saying *"I built anchors after you ran"* — `ext/tabs`, `ext/catalog`,
`ext/AITask`.
*Options:* (a) keep the manual re-run; (b) a `MutationObserver` on `$app` that
re-marks added anchors; (c) let `app.navigated?.()` own it, so an ext hooks the
moment instead of the method.
*Weighing:* (b) is invisible coordination — a component's links get marked by
machinery it never mentions, which is exactly the black magic rule. (c) doesn't
help: the ext's problem is that it renders *after* the hook, not before it. (a) is
one word at the call site and greppable.
**Recommendation: (a), and stop treating it as a wart.** The bare-callable default
is the API; it should be documented as such rather than apologised for.

**Should two fast clicks be guarded?** Two clicks start two walks and the slower
one can win, silently. Asked for by three seats.
*Options:* (a) cancel the first (needs an abort token threaded through
`page.child()`); (b) ignore clicks while a walk is in flight; (c) last-write-wins —
stamp each walk and let `activate()` drop a stale one.
*Weighing:* (a) is the most code and reaches into `Page`. (b) makes a slow
navigation feel like a dead link. (c) is a counter and one `if`, and matches what
a user means by clicking twice.
**Recommendation: (c)**, but nobody has reported it in the wild — the honest
status is *"known, cheap, unbuilt."*

**Should one-Router-per-document be enforced?** Constructing a Router starts it;
a second one navigates every click twice. Nothing checks.
*Options:* (a) nothing; (b) warn if a Router already exists; (c) make it a
singleton.
*Weighing:* (c) breaks testability and hard-codes one App per document, which the
whole `app` injection exists to avoid. (b) is three lines of global state for a
mistake only `App` could make.
**Recommendation: (a), written down** — it is now, in ./doc/constructor.md.

## Open

- **A cross-page `#fragment` lands at the top of the page.** The url is right —
  `go()` keeps `?q=` and `#section` — but `activate()` ends in an unconditional
  `scrollTo(0, 0)`, and at that moment the target element does not exist yet. Not a
  two-line fix; measured, with the hop counts, in ./doc/fragment.md.
- **First paint waits for the whole walk.** Nothing paints until every loader
  resolves; the chrome could have painted 1765ms earlier on a measured deep link.
  Kept deliberately — a nav spelling itself twice is worse — but it is not free and
  should stop being described as if it were.
