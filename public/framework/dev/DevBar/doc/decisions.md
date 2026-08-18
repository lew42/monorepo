# DevBar — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

A right-docked rail of developer chrome, on every page, in three tabs — **page**
(route, dev server, x-ray, go), **layout** (what DesignTool makes of this page),
**ai** (this page's threads). `Ctrl + \` toggles it, the `✕` at the head's inline
end shuts it, `block` beside it holds `window.$BLOCKRELOAD`, and the head's
second line is **the page's width** — four presets and the number they promise,
on every tab. That edge and those presets resize it, and everything else it
remembers is one `localStorage` document, the open tab included. Twelve files:
the shell (`DevBar.js`), what it shows (`tools.js`), its rendering vocabulary
(`parts.js`), the width line (`width.js`), this page's AI threads (`ask.js`),
this page's layout readout (`layout.js`), what it remembers (`settings.js`), the
resize edge (`grip.js` + `grip.css`), the look (`devbar.css`).

⚠ **Below 34em the rail is a bottom sheet**, not a side rail: 17rem is 70% of a
390px window and `.app` declines to push at that width, so the tool sat *on top
of* 70% of what it was measuring.

## Who uses this

One caller — `public/app.js`, in `render()` and `navigated()` — which is also
the whole public surface: every page on the site gets the rail through those
two calls, and nothing else in the framework imports `DevBar.js` directly.
`Socket`, `ext/Ask`, `ext/JSONL` and `ext/DesignTool` are pulled *in* by this
module (`tools.js`, `ask.js`, `layout.js`), not the other way around;
`ext/layout` is not imported at all — the two only share a CSS contract, see
[docking](/framework/dev/DevBar/doc/docking/).

## The three things that will bite you

- **`dev-open` on `<html>` is the entire state.** The slide, the shell's push
  and what the `✕` undoes are all CSS off that one class. Anything that wants
  to react to the rail reads a class or a token — never a property on this
  module. Full mechanism: [docking](/framework/dev/DevBar/doc/docking/).
- **A preset drops `--rail-floor` to 0, permanently.** `.app` normally stops
  its push above a 26rem reading column; a deliberate width — a preset or a
  drag — clears that floor for the rest of the session, so a later drag can
  squeeze the page below 26rem too. `MIN` (200px) is the only guard left, on
  both sides. Detail: [sizing](/framework/dev/DevBar/doc/sizing/).
- **The rail renders during `App.render()`**, before the router exists and
  before the socket connects. Everything it shows is read at render time,
  which is why [`refresh()`](/framework/dev/DevBar/api/refresh/) exists and
  why `navigated()` has to call it.

## Decisions

**One `localStorage` document, not one key per setting.** `open` and `width`
were two raw keys in two files and x-ray wasn't remembered at all. Now one
`LocalStorageSaver` document (`settings.js`) — every piece of state is a class
or a custom property on `<html>`, so restoring is only writing them back.
Knobs are remembered as a list of class names (`["dev-outline"]`, not
`{xray: true}`) for the same reason: the class already *is* the state.

**`block` writes `window.$BLOCKRELOAD` and stores nothing.** Every other knob
is a class on `<html>` that `settings.js` remembers; this one is a global
`Socket` reads live, in `reload()` and `changed()`. Routing it through `knob()`
would put the same boolean in two stores — the black magic this module avoids —
and persisting it is worse than useless: a block that quietly survived a reload
reads as live reload being broken, which is a bug report, not a feature. It
lives in the *head* rather than a tab because you reach for it mid-edit, with
whatever tab you were on still open.

**The `✕` is pinned by `flex-grow` on the hint, not by an auto margin.**
`.dev-hint { margin-inline-end: auto }` stood in `devbar.css` for months and
never did anything: `.flex > * { margin: 0 }` is in `@layer util`, and a later
layer beats any specificity in `theme` — so the `✕` sat wherever the text
happened to end. Growing the hint is not a margin, so nothing zeroes it. Same
trap `.measure` works around by declaring itself after that rule in the same
layer (`framework/styles/readme.md`).

**Naming a thread is a native `prompt()`.** Crude on purpose — it happens a
couple of times a week, and an inline form is a whole control surface for two
words. See [threads](/framework/dev/DevBar/doc/threads/).

**`parts.js` exists only to avoid an import cycle.** `ask.js` needs
`section()`, which lived in `tools.js` — but `tools.js` imports `ask.js` to
put it in `sections`. Three functions moved to their own file with no imports
of their own, and the flow is one-way again.

**Mounts on `<body>`, and reserves a rail summed with `ext/layout`'s
drawer.** Both decisions, and the dark-without-a-palette trick that goes with
them, are one topic: [docking](/framework/dev/DevBar/doc/docking/). Built
during `render()` but appended only on `styles_loaded()` — `inject()` holds
`$app` back for stylesheets, but nothing holds `<body>`, and an eagerly
mounted bar painted unstyled, then visibly slid away as `devbar.css` landed.

**Four presets, sized by subtracting from the window — in the HEAD, beside the
number they promise.** They lived in a `viewport` section on the `page` tab,
which reported the **window** (`1920 × 1080`); the `layout` tab reported the
**page** (`1648px`). Two numbers 272px apart, on two screens, neither labelled
as which — and the buttons that *set* one of them were on the tab showing the
other. One line now, on every tab, reading `.app`'s content box through a
`ResizeObserver`, so the grip, the presets and the window all move it.
`viewport`'s three rows are deleted with the section. The math, the
disabled-when-unreachable state, and why the lit button reads a setting rather
than a live measurement: [sizing](/framework/dev/DevBar/doc/sizing/).

**Deliberately not a registry.** `sections` is a plain array in `tools.js`. A
`DevBar.tool(name, fn)` API would be the moment other modules start pushing
themselves in from a distance — the black magic this codebase avoids. Adding
a section is a function and one array entry. `layout.js` is the proof: a whole
DesignTool integration cost one import and one word in that array.

**Tabs, because one section is expensive.** The rail was seven sections in one
scroll, and `layout` is the one that reads every rect on the page — on every
navigation of every session with the rail open. `refresh()` renders only the
open tab, so the cost is now something you ask for. The grouping is one array in
`tools.js`; the `on` tab is one more key in the settings document, like every
other knob. ⚠ It gates the *work*, not the download, on this site: every page
under `/framework/` already imports DesignTool because its doc page is a
declared child ([measuring](/framework/dev/DevBar/doc/measuring/)).

**The `layout` tab is ONE screen with ONE permanent control.** It was two — the
rail's readout, and DesignTool's full report, which *replaced* it in place with
no way back that said so, and carried 20 controls in a 272px column. The report
is a page component and stays on the two pages with room for it; the two things
it had that the rail wanted — the proposed declaration and `not a problem` —
moved onto the **selected** finding. Everything else it had, the rail already
showed. What is left: `measure`, plus `not a problem` when the polish tier
allows it. Deleted: `full report`, and `follow the resize`, which is now always
on (below).

**The selected finding is the expanded one.** One state, three signals, no
control: it is the only row showing its declaration and its button, `dt-aimed`
draws a 2px border down its inline start, and its ring on the page is held —
all three set by the same click, because the class is ext/DesignTool's own
(`highlight.js`) and so is the ring. Before this, "what is selected" was
`--prim` at 14% alpha on a dark rail, which is no visible change at all.

**The `layout` tab reports two verdicts, and they disagree on purpose.**
`analyze()` says what is *broken* — a census, no grade, because that number was
deleted for being anti-correlated with how pages look (`DesignTool/score.js`).
`taste` is `rate()` ([`DesignTool/taste/`](/framework/ext/DesignTool/taste/)) —
how *good* it is against eleven ideal ranges, with the three weakest named under
it, and it is the one tier here that still scores. A page with nothing wrong can
still be dull, and only the second can say so. One `import()`, one extra pass
over the same probe.

⚠ **Two of those eleven bands are knowingly uncalibrated and the rail says so.**
`measure` reads card captions rather than prose and `contrast` is set by a single
outlier; both need a band *re-derived*, which `ai/2026-08-17/tier-calibration/`
was forbidden to do. Their readings wear a dotted underline and carry the reason
as a title. The sentence lives on the band (`taste/ranges.js`'s `caveat`), never
in the rail — a hard-coded list of band names in the UI is a second truth that
stops agreeing the day one of them is fixed.

**The `layout` tab measures `.app`, not the active page — or the panel you
clicked.** `.app` is the root `ext/DesignTool`'s own audit uses, so a grade in
the rail and a row in the audit table are the same number, and the rail keeps
itself out of the reading with `data-layout-ignore` rather than by choosing a
narrower root. Clicking an `ext/Panel` retargets it at that panel and Escape
puts it back: two document events (`panel-focus`, `panel-unfocus`) and a class,
with no import in either direction. The 200ms settle that makes a drag cost one
analysis, the generation counter, the hidden-page trap, and why
`DesignTool/live.js` is not reused:
[measuring](/framework/dev/DevBar/doc/measuring/).

**The grip lives inside the rail, and cannot straddle its edge.** `.pages` is
`overflow-y: scroll`, so the page region always reserves a scroll gutter flush
against the rail's inline-start edge — there is no room on the page side of
that line, and a 2rem strip centred on it covered every pixel of the scrollbar
for as long as the grip existed (measured 2026-08-16: gutter 1931→1946, grip
1931→1963). `0.75rem` at `inset-inline-start: 0` lands on the dead strip the
rail already has — 1px border plus `0.9em` padding on head, tabs and body — so
the target covers no content and nothing else moved. The cost is a 12px target
where the straddle offered 32. Full record:
[grip.css](/framework/dev/DevBar/files/).

**No handle when closed.** `/web/nav/drawer/` requires a persistent open
button for reader-facing navigation; this is dev chrome behind a keystroke,
and a permanent tab on every page's right edge is a cost paid by everyone to
remind one person of a shortcut they know. Open question rather than settled:
a low-opacity edge tab is the fix if the rail ever proves hard to find.
⚠ This was aspirational until 2026-08-16: there *was* a handle when closed —
an invisible one, the same overhang, capturing pointer gestures down every
page's right edge. Both halves of that bug are gone, and the slide is a plain
`translateX(100%)` again; see [docking](/framework/dev/DevBar/doc/docking/).

## Open

- The socket row (`tools.js`) settles once, on `socket.ready`. If the dev
  server dies *while* the rail is open, the row keeps saying "connected"
  until something refreshes it — never visible in practice, since live-reload
  restarts the page anyway.
- A resize redraws the whole body, which drops focus. The `ai` section is
  focus-sensitive — resizing mid-sentence loses what you typed — so the
  preset buttons repaint only themselves; the window `resize` listener still
  redraws everything. Tabs narrow the blast radius (only the open tab is
  rebuilt) without fixing it.
- **A thread carries `requested_at` and never `landed_at`**, so once a board
  crawls these it will read every chat as permanently "running." How a
  thread displays is `ext/AI`'s call, not something to guess at here.
- **The thread list is one `/directory.json` fetch per rail redraw** — every
  navigation. Dev-only and already warm on the server, but the obvious next
  move if it ever shows.
- **A grab snaps the rail's edge to the pointer**, so grabbing at the strip's
  far side lands up to 12px narrow — 0 at the lit line, which is where you
  aim. `grip.js` writes `innerWidth - e.clientX` with no grab offset; the
  straddle had the same discontinuity at ±16px, so this is not new. Three
  lines (remember the offset on `pointerdown`, subtract it on move) if it ever
  reads as a jump.
- ~~**`follow the resize` is cheap now.**~~ **Deleted, 2026-08-17 — it is always
  on.** Every resize event restarts a 200ms timer, so a 40-event drag measures
  once, when it stops; one analysis per gesture at ~47ms was never worth a
  control, and what the knob originally offered — the number moving *during* a
  drag — was traded away for the settle long ago and nobody asked for it back.
  ⚠ Removing it exposed a real bug: `follow()` observed `.app` and `measure()`
  then observed the target, the same element, so `ResizeObserver` delivered two
  *initial* observations and **the readout rendered twice on every open**, the
  second 200ms in. Invisible while selection was a 14% wash; with selection
  visible it threw away the finding you had just clicked. `follow()` is gone,
  `measure()` owns every `observe()`, and one `fresh` set makes the observer
  ignore the delivery that is only a repeat of what was just measured.
- **The readout is a snapshot with no age, and `measure` is the honest answer.**
  A tab clicked inside the page, a demo toggled or an `md()` fetch landing all
  change the layout without changing any geometry an observer watches, and the
  numbers silently go stale. Staleness has no *display* — a timestamp in a
  272px rail is a row nobody reads. The one button admits it instead.

Design detail that outgrew this page: [docking](/framework/dev/DevBar/doc/docking/),
[sizing](/framework/dev/DevBar/doc/sizing/), [threads](/framework/dev/DevBar/doc/threads/),
[measuring](/framework/dev/DevBar/doc/measuring/).
