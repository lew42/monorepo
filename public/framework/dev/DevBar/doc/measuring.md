# Measuring the page you are on

The `layout` **tab** runs [`ext/LayoutTool`](/framework/ext/LayoutTool/) on
whatever page the rail is sitting next to, and says it in 17rem: what is being
measured, a grade and a score, the high/medium/low counts, how wide it is, the
three ratios that explain most findings (measure, frame gap, width used), and
the three leading findings with their severity. `re-run` measures again, `full
report` swaps the compact readout for LayoutTool's own report view, and
`follow the resize` re-measures once a drag stops.

Everything is in `layout.js`. The rail's own contribution is one entry in
`tools.js`'s `tabs` array — the same shape `ask.js` has, one tab further in.

## The tab is the gate

`layout` is alone on a tab, and `DevBar.refresh()` renders only the open one.
That is not tidiness: this section reads every rect on the page — 948 nodes and
~30ms on `/framework/ext/Panel/` — and a section that is not rendered does not.
Before tabs it ran on every navigation of every session with the rail open, and
again 400ms after each one.

⚠ **The download is a weaker claim than it looks, and it was worth measuring.**
Every page *under* `/framework/` already pulls `LayoutTool.js` (and `report.js`,
and `highlight.js`) whatever this rail does: LayoutTool's own doc page is a
declared child, and a declared child is imported at construction so the nav can
show its title. Verified from `performance.getEntriesByType("resource")`: loaded
on `/framework/`, `/framework/core/View/` and `/framework/ext/Panel/`, absent on
`/` and `/web/`. So the deferred import buys nothing on the documentation site
and everything on a page that is not part of it — which is the case the built
site is actually about.

Which also means the section is built and thrown away by a tab click, so
everything it leaves running has to notice. `stale()` tests two things: the
generation counter, and whether the readout is still inside `.dev-body` —
`closest()` rather than `isConnected`, because the rail is built detached and
appended a promise later, so "not attached yet" would otherwise read as "gone".

## The target is `.app`, or the panel you clicked

`ext/Panel` writes `.panel.focus` and announces `panel-focus` on the document;
this section listens, retargets and re-measures. Clicking a panel is how you
ask what a *piece* of a page scores — 13 nodes and 129px, rather than 948 and
1328. Escape clears the selection, and so does the `page` button beside the
target row, which dispatches `panel-unfocus` rather than reaching into a
workspace it must not import. Neither module imports the other; they share two
event names and a class.

⚠ **A hidden page keeps its DOM.** An inactive page is `display: none`, so a
`.panel.focus` survives the navigation away from it and would be measured as a
page with no geometry at all. The target test asks for a client rect first.

## The findings point at the page

Every finding carries a `:nth-child()` path from the analysis root, so hovering
one rings the element it is about and clicking keeps the ring — the overlay is
`ext/LayoutTool/highlight.js`, imported on demand like the analysis. It is
loaded *after* the `await`, which is safe only because `aim()` builds no DOM: it
adds listeners to a view already placed. A factory call there would append to
the page.

## The root is `.app`, so the number is comparable

`analyze(document.querySelector(".app"))` is what
[`LayoutTool/audit/`](/framework/ext/LayoutTool/audit/) runs in its iframes and
what the headless crawl records. Measuring the active page's own view instead
would have been closer to "the page", and would also have made every rail
score incomparable with every recorded one. A grade here and a row in the audit
table mean the same thing.

The rail is not in its reading: `DevBar.js` marks the bar
`data-layout-ignore`, which is the probe's published contract for dev chrome
(`styles/layouts/space/ruler.js` marks its miniatures the same way). One
attribute, no import, and it holds for anything that ever measures this
site — the crawler included.

## `root` reports the CONTENT width

`.app` reserves the rail as `padding-inline-end`, so its rect is the width of
the window no matter how far the page has been squeezed. The row subtracts the
padding, which makes it the number the four presets promise: click *desktop* in
a 2560 window and the row reads `1920px`.

## Measured on a timer, and only by the newest readout

`analyze()` reads geometry the moment it is called, and the rail renders during
`App.render()` and again from `navigated()` — both while the page it is about
is still arriving. So the first measurement waits 400ms.

That timer is also why the section counts generations. A rail redraw happens on
every navigation **and on every resize event**, and each one builds a fresh
readout with a fresh timer; a drag would otherwise queue a hundred analyses
that all land at once, each writing to a view nobody can see. `latest` is a
module counter, `mine` is this readout's number, and anything that comes back
to find them different gives up — the timer, the resize observer, and the
`then` after the dynamic import.

## `follow the resize` runs when the resize STOPS

The knob is a class on `<html>` (`dev-layout-live`) remembered by `knob()`,
like x-ray — with the one difference that flipping it repaints the section
immediately, which is what the third argument to `check()` is for.

It observes `.app` rather than listening for `resize`, because the rail's own
grip and its four presets resize the *page* without the window ever changing
size. The current target joins the watch as it is measured, so dragging a seam
inside a focused panel counts too — ⚠ **once per element, never per run**:
`observe()` re-delivers an initial observation, so re-observing what a run just
measured is a 5Hz loop that never settles.

**Every event restarts one 200ms timer**, so a drag costs one analysis instead
of one per frame. Measured headless: a 40-event drag wrote the readout **0**
times while it moved and **once** after it stopped. It used to write ~9 times
and cost ~180ms for a single rail-width change on a 680-node page, because the
page keeps re-laying-out for most of a second and the readout followed every
frame of it. A leading-edge throttle was the alternative and is the wrong
shape: the interesting width is the one you let go at.

## Why not `LayoutTool/live.js`

That module is the same idea for a page: its own panel, its own resize
observer, its own type scale. It is written for a page's font size, not for a
17rem column of 0.8rem mono, and the compact readout is about fifteen lines
against a rewrite of a module that belongs to LayoutTool.

The other half of this reason has since gone: `live.js` now lets go when its
panel leaves the document (and, as of 2026-08-16, no longer mistakes "not
attached yet" for it). Both modules debounce at 200ms and both point their
findings at the page through `highlight.js`, which is the shared part worth
sharing — the two panels are not.

## LayoutTool is imported on demand

```js
const tool = () => import("../../ext/LayoutTool/LayoutTool.js");
const full = () => import("../../ext/LayoutTool/report.js");
```

The rail is part of `app.js`, so it ships to every visitor of the built site —
and LayoutTool's analysis is ~45KB nobody who isn't measuring should download.
Both imports resolve the first time the section is used, which can only happen
with the rail open.

It keeps the import graph one-way, too: `report.js` imports `/app.js`, and
`/app.js` imports `DevBar.js`. At module scope that is the mutual import
`CLAUDE.md` warns about — deferred to a click, `/app.js` is long since
evaluated.

## The full report docks like the chat

`report(data, { limit: 3 })` is LayoutTool's own view, rendered in place of the
compact one. It arrives with the module's stylesheet, and the rail adds a
single rule — `.dev-bar .lt-report { overflow-wrap: anywhere; }` — the same
kind of one-line dock `ext/Ask`'s transcript gets. Verified at 1600: five
metric tiles, twelve issue blocks, nothing overflowing the rail.
