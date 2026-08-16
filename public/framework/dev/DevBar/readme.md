# DevBar

A right-docked rail of developer chrome, on every page, in three tabs — **page**
(viewport, route, dev server, x-ray, go), **layout** (this page's score), **ai**
(this page's threads). `Ctrl + \` toggles it, the `✕` at the head's inline end
shuts it, `block` beside it holds `window.$BLOCKRELOAD`, that edge and four
preset buttons resize it, and everything else it remembers is one
`localStorage` document, the open tab included. Eleven files: the shell
(`DevBar.js`), what it shows (`tools.js`), its rendering vocabulary
(`parts.js`), this page's AI threads (`ask.js`), this page's layout score
(`layout.js`), what it remembers (`settings.js`), the resize edge (`grip.js` +
`grip.css`), the look (`devbar.css`).

```js
import devbar from "./framework/dev/DevBar/DevBar.js";

render(){ …; devbar(this); },
navigated(){ devbar.refresh(); },
```

## Who uses this

One caller — `public/app.js`, in `render()` and `navigated()` — which is also
the whole public surface: every page on the site gets the rail through those
two calls, and nothing else in the framework imports `DevBar.js` directly.
`Socket`, `ext/Ask`, `ext/JSONL` and `ext/LayoutTool` are pulled *in* by this
module (`tools.js`, `ask.js`, `layout.js`), not the other way around;
`ext/layout` is not imported at all — the two only share a CSS contract, see
[docking](/framework/dev/DevBar/docs/docking/).

## The three things that will bite you

- **`dev-open` on `<html>` is the entire state.** The slide, the shell's push
  and what the `✕` undoes are all CSS off that one class. Anything that wants
  to react to the rail reads a class or a token — never a property on this
  module. Full mechanism: [docking](/framework/dev/DevBar/docs/docking/).
- **A preset drops `--rail-floor` to 0, permanently.** `.app` normally stops
  its push above a 26rem reading column; a deliberate width — a preset or a
  drag — clears that floor for the rest of the session, so a later drag can
  squeeze the page below 26rem too. `MIN` (200px) is the only guard left, on
  both sides. Detail: [sizing](/framework/dev/DevBar/docs/sizing/).
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
words. See [threads](/framework/dev/DevBar/docs/threads/).

**`parts.js` exists only to avoid an import cycle.** `ask.js` needs
`section()`, which lived in `tools.js` — but `tools.js` imports `ask.js` to
put it in `sections`. Three functions moved to their own file with no imports
of their own, and the flow is one-way again.

**Mounts on `<body>`, and reserves a rail summed with `ext/layout`'s
drawer.** Both decisions, and the dark-without-a-palette trick that goes with
them, are one topic: [docking](/framework/dev/DevBar/docs/docking/). Built
during `render()` but appended only on `styles_loaded()` — `inject()` holds
`$app` back for stylesheets, but nothing holds `<body>`, and an eagerly
mounted bar painted unstyled, then visibly slid away as `devbar.css` landed.

**Four presets, sized by subtracting from the window.** The math, the
disabled-when-unreachable state, and why the lit button reads a setting
rather than a live measurement: [sizing](/framework/dev/DevBar/docs/sizing/).

**Deliberately not a registry.** `sections` is a plain array in `tools.js`. A
`DevBar.tool(name, fn)` API would be the moment other modules start pushing
themselves in from a distance — the black magic this codebase avoids. Adding
a section is a function and one array entry. `layout.js` is the proof: a whole
LayoutTool integration cost one import and one word in that array.

**Tabs, because one section is expensive.** The rail was seven sections in one
scroll, and `layout` is the one that reads every rect on the page — on every
navigation of every session with the rail open. `refresh()` renders only the
open tab, so the cost is now something you ask for. The grouping is one array in
`tools.js`; the `on` tab is one more key in the settings document, like every
other knob. ⚠ It gates the *work*, not the download, on this site: every page
under `/framework/` already imports LayoutTool because its doc page is a
declared child ([measuring](/framework/dev/DevBar/docs/measuring/)).

**The `layout` tab reports two grades, and they disagree on purpose.** `grade` is
`analyze()` — whether anything is *broken*. `taste` is `rate()`
([`LayoutTool/taste/`](/framework/ext/LayoutTool/taste/)) — how *good* it is
against eleven ideal ranges, with the three weakest named under it. A page with
nothing wrong can still be dull, and only the second number can say so. One
`import()`, one extra pass over the same probe.

**The `layout` tab measures `.app`, not the active page — or the panel you
clicked.** `.app` is the root `ext/LayoutTool`'s own audit uses, so a grade in
the rail and a row in the audit table are the same number, and the rail keeps
itself out of the reading with `data-layout-ignore` rather than by choosing a
narrower root. Clicking an `ext/Panel` retargets it at that panel and Escape
puts it back: two document events (`panel-focus`, `panel-unfocus`) and a class,
with no import in either direction. The 200ms settle that makes a drag cost one
analysis, the generation counter, the hidden-page trap, and why
`LayoutTool/live.js` is not reused:
[measuring](/framework/dev/DevBar/docs/measuring/).

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
`translateX(100%)` again; see [docking](/framework/dev/DevBar/docs/docking/).

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
- **`follow the resize` is cheap now, and the number is one drag behind.**
  Every resize event restarts a 200ms timer, so a 40-event drag measures once,
  when it stops — where it used to measure nine times and cost ~180ms on a
  680-node page. What that trades away is the number changing *while* you drag,
  which was the original point of the knob; nobody has asked for it back yet.

Design detail that outgrew this page: [docking](/framework/dev/DevBar/docs/docking/),
[sizing](/framework/dev/DevBar/docs/sizing/), [threads](/framework/dev/DevBar/docs/threads/),
[measuring](/framework/dev/DevBar/docs/measuring/).
