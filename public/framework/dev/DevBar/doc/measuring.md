# Measuring the page you are on

The `layout` **tab** runs [`ext/DesignTool`](/framework/ext/DesignTool/) on
whatever page the rail is sitting next to, and says it in 17rem: what is being
measured, the high/medium/low counts, a taste grade and its three weakest bands,
the three ratios that explain most findings (measure, frame gap, width used), and
the three leading findings. **One screen, one permanent control**: `measure` runs
it again. It re-measures on every resize with no knob to tick, and the width it is
reporting on lives in the rail's head, on every tab.

Everything is in `layout.js`. The rail's own contribution is one entry in
`tools.js`'s `tabs` array — the same shape `ask.js` has, one tab further in.

## The tab is the gate

`layout` is alone on a tab, and `DevBar.refresh()` renders only the open one.
That is not tidiness: this section reads every rect on the page — 948 nodes and
~30ms on `/framework/ext/Panel/` — and a section that is not rendered does not.
Before tabs it ran on every navigation of every session with the rail open, and
again 400ms after each one.

⚠ **The download is a weaker claim than it looks, and it was worth measuring.**
Every page *under* `/framework/` already pulls `DesignTool.js` (and `report.js`,
and `highlight.js`) whatever this rail does: DesignTool's own doc page is a
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

## The findings point at the page, and the selected one expands

Every finding carries a `:nth-child()` path from the analysis root, so hovering
one rings the element it is about and clicking keeps the ring — the overlay is
`ext/DesignTool/highlight.js`, imported on demand like the analysis. It is
loaded *after* the `await`, which is safe only because `point()` builds no DOM:
it adds listeners to a view already placed. A factory call there would append to
the page.

That same click is the **selection**, and the expansion is what shows it: the
selected row is the only one carrying its proposed declaration and its
`not a problem` button, and `dt-aimed` — the class `highlight.js` already
toggled — draws the border and reveals the rest in CSS. No JavaScript was added
for any of it, which is the point: one class, three signals, and nothing that can
disagree with what is ringed on the page.

⚠ **Three ways a ring can be worse than no ring**, all closed in `point()`:
a page-level finding whose empty path resolves to the analysis root (a ring over
the whole viewport); a roll-up whose `path` is the container, not the box that
broke (32 of 47 rings covering ≥60% of the viewport); and a target below the fold,
which the `position: fixed` overlay drew off-screen where hover produced nothing
at all (37 of 93 leading findings). Record:
[DesignTool's readme](/framework/ext/DesignTool/).

## The root is `.app`, so the number is comparable

`analyze(document.querySelector(".app"))` is what
[`DesignTool/audit/`](/framework/ext/DesignTool/audit/) runs in its iframes and
what the headless crawl records. Measuring the active page's own view instead
would have been closer to "the page", and would also have made every rail
reading incomparable with every recorded one. The census here and a row in the
audit table mean the same thing. ⚠ **`analyze()` reports no score or grade** — the
aggregate was deleted for being anti-correlated with how pages look; see
[`score.js`](/framework/ext/DesignTool/) and
[tier-calibration](/framework/ai/2026-08-17/tier-calibration/). The `taste` row
below it is the one that scores.

⚠ **THE RAIL WAS IN ITS OWN READING, AND MARKING THE BAR DID NOT PREVENT IT**
(2026-08-17). `DevBar.js` marks the bar `data-layout-ignore`, which is the probe's
published contract for dev chrome (`styles/layouts/space/ruler.js` marks its
miniatures the same way) — and that only keeps the bar's own boxes out of the walk.
It does nothing about the fact that **opening the rail changes the SHELL's
geometry**: `framework.css` pushes `.app` over by the rail's width, so `.pages`
measured 1648 of a 1920 window, stopped matching `gutter`'s "is this the shell?"
test, and collected a manufactured `high · gutter` — the rail's own TOP finding on
12 of 24 page×width pairs, ringing 79% of the viewport. `gutter` now tests against
the root's content width, which is the number this rail's `root` row already
displayed. **An instrument must not appear in its own measurement, and "I marked my
own box" is not the same claim.**

One
attribute, no import, and it holds for anything that ever measures this
site — the crawler included.

## The width moved to the head — it was never a finding

`.app` reserves the rail as `padding-inline-end`, so its rect is the width of
the window no matter how far the page has been squeezed. Subtracting the padding
makes it the number the four presets promise: click *desktop* in a 2560 window
and it reads `1920px`.

It used to be a row in this readout while the buttons that *set* it were on the
`page` tab — which reported the **window** (`1920 × 1080`) instead, 272px away
and unlabelled. Both are one line in the head now, on every tab
([`width.js`](/framework/dev/DevBar/files/)), and this readout is findings only.

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

## It follows the resize, always, and runs when the resize STOPS

There was a knob. It is gone (2026-08-17): one analysis per gesture at ~47ms was
never a cost worth a control, and what the knob originally offered — the number
moving *during* a drag — was traded away for the settle long ago.

It observes the **target** rather than listening for `resize`, because the rail's
own grip and its four presets resize the *page* without the window ever changing
size. The current target joins the watch as it is measured, so dragging a seam
inside a focused panel counts too — ⚠ **once per element, never per run**:
`observe()` re-delivers an initial observation, so re-observing what a run just
measured is a 5Hz loop that never settles.

⚠ **AND AN INITIAL OBSERVATION IS NOT A CHANGE.** There used to be two — a
`follow()` helper observed `.app`, then `measure()` observed the target, the same
element — so the readout **rendered twice on every open**, the second 200ms after
the first. It was invisible for as long as selection was invisible; the moment a
selected finding had a border, it was a row you clicked that vanished half a
second later. `measure()` owns every `observe()` now, and a `fresh` set makes the
observer ignore the delivery that only repeats what the observing run measured.
Verified with a `MutationObserver` on the readout: one render per open.

**Every event restarts one 200ms timer**, so a drag costs one analysis instead
of one per frame. Measured headless: a 40-event drag wrote the readout **0**
times while it moved and **once** after it stopped. It used to write ~9 times
and cost ~180ms for a single rail-width change on a 680-node page, because the
page keeps re-laying-out for most of a second and the readout followed every
frame of it. A leading-edge throttle was the alternative and is the wrong
shape: the interesting width is the one you let go at.

## Why not `DesignTool/live.js`

That module is the same idea for a page: its own panel, its own resize
observer, its own type scale. It is written for a page's font size, not for a
17rem column of 0.8rem mono, and the compact readout is about fifteen lines
against a rewrite of a module that belongs to DesignTool.

The other half of this reason has since gone: `live.js` now lets go when its
panel leaves the document (and, as of 2026-08-16, no longer mistakes "not
attached yet" for it). Both modules debounce at 200ms and both point their
findings at the page through `highlight.js`, which is the shared part worth
sharing — the two panels are not.

## DesignTool is imported on demand

```js
const tool = () => import("../../ext/DesignTool/DesignTool.js");
const spot = () => import("../../ext/DesignTool/highlight.js");
const waive = () => import("../../ext/DesignTool/defer.js");
```

The rail is part of `app.js`, so it ships to every visitor of the built site —
and DesignTool's analysis is ~45KB nobody who isn't measuring should download.
All three resolve the first time the section is used, which can only happen with
the rail open. `tool` and `waive` resolve together in one `Promise.all`, so
`not a problem` can be built inside the render rather than behind a second `then`.

It keeps the import graph one-way, too: `report.js` imports `/app.js`, and
`/app.js` imports `DevBar.js`. At module scope that is the mutual import
`CLAUDE.md` warns about — deferred to a click, `/app.js` is long since
evaluated.

## There is no second screen — the full report is a PAGE component

`report(data)` used to render **in place of** this readout, reached by a button
called `full report` and left only by one called `re-run`. It was the same report
twice, and one wiped the other: a superset of the readout except `taste`, which
only the readout had, and 20 controls in a 272px column. Measured in that column,
its url wrapped mid-word, its total broke across two lines, and six metric cards
each carried three lines of explanatory prose.

Deleted from the rail (2026-08-17). `report.js` is untouched and still serves the
two pages with room for it — `ext/DesignTool/page.js` and `audit/page.js`. Two of
its parts moved onto the **selected finding**: the proposed declaration, and
`not a problem`. Two deliberately did not — the before/after mirror clones the
element at its own size and needs page width, and the six captioned metric cards
are documentation, which belongs on
[DesignTool's page](/framework/ext/DesignTool/). The readout already showed the
same three numbers in one line.

## A rail dragged wide gets two columns

```css
.dev-layout-out > * { flex: 1 1 20em; min-width: 0; }
```

Two blocks — the numbers, and the findings — with `flex-wrap` and a basis: one
column in a 17rem rail, two above about 40em of rail, and no breakpoint written
down anywhere. ⚠ `min-width: 0` is not optional; the monospace detail lines keep a
content-based minimum and will not shrink without it.

At 3440 with the rail at its default 272px the honest answer to "does this use
the screen" is **no, and it should not**: the 3168px beside it is the page being
measured. The wide-screen surface for this tool is
[`audit/`](/framework/ext/DesignTool/audit/), which is already a full page.
