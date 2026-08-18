The `layout` tab: [`ext/DesignTool`](/framework/ext/DesignTool/) run on the page
the rail is sitting next to — or on the `ext/Panel` you last clicked — reported
in 17rem. **One screen, one permanent control.** The target, the census, a taste
grade, the weakest bands, three ratios and three leading findings; the selected
one expands to carry its proposed declaration and `not a problem`, and `measure`
runs it again.

The second `dev` → `ext` import in the module, after `ask.js`, and the first one
that is deferred rather than static.

Full design: [measuring](/framework/dev/DevBar/doc/measuring/).

## The shape: one readout, one generation counter

`layout()` is one container; `readout()` is everything inside it, and it owns its
`measure()`, its observer and its own generation number. Re-running is not a
special path: `empty(readout)` again *is* a re-run.

## `latest` / `mine` — only the newest readout measures, and only in the rail

```js
const stale = () => mine !== latest || !$out.el.closest(".dev-body");
```

The rail redraws on every navigation and on **every resize event**, so a
one-second drag builds sixty readouts. Each one has a pending timer, a
`ResizeObserver` and a `panel-focus` listener. Without this check a drag would
land sixty analyses at once, all of them painting views that had already been
thrown away — and the observers would never stop, because nothing tells a
`ResizeObserver` that its view is gone. Every asynchronous re-entry asks
`stale()` first: the timer, the observer, the focus listener, and the `then`
after the import.

⚠ **The second half of the test is the tab.** Switching to `page` builds no new
readout, so the generation counter alone would leave the last one measuring
forever. `closest()` and not `isConnected`, because the rail is built during
`App.render()` and appended to `<body>` a promise later — a detached-but-not-yet-
placed readout would otherwise decide it was dead before it ever ran.

Measured: twenty redraws leave the live observer count flat, one rail-width
change afterwards runs exactly the analyses the surviving readout asked for, and
a resize after leaving the tab runs none.

## Three dynamic imports, and why they are not at the top

```js
const tool = () => import("../../ext/DesignTool/DesignTool.js");
const spot = () => import("../../ext/DesignTool/highlight.js");
const waive = () => import("../../ext/DesignTool/defer.js");
```

`app.js` puts this rail on every page of the *built* site, so a static import
would ship ~45KB of analysis to every visitor. Deferring also keeps the graph
acyclic: `report.js` imports `/app.js`, which imports `DevBar.js`.

`defer.js` is two functions with no imports of its own and would cost almost
nothing statically — it rides along in the same `Promise.all` anyway, so that
"almost" never has to be argued about, and `not a problem` can be built
**synchronously** inside the render rather than behind a second `then`.

⚠ `spot()` resolves **after** the findings are built, which is only safe because
`point()` builds no DOM — it adds listeners to a view already placed. A factory
call in that `then` would append to the page.

## The target, and the way back

```js
const panel = document.querySelector(".panel.focus");
return panel?.getClientRects().length ? panel : document.querySelector(".app");
```

`ext/Panel` writes the class and announces `panel-focus`; this listens and
re-measures, so clicking a panel is a measurement of that panel. The `⟲` button
dispatches `panel-unfocus` rather than importing a workspace to reach into — the
same thing Escape does. ⚠ The client-rect test is not decoration: an inactive
page keeps its DOM at `display: none`, so a selection outlives the navigation
away from it and would be measured as a page with no geometry.

The target is the one line here with a leading glyph (`⌖`), so it stops reading
as one more diagnostic among the five below it — and hovering it rings the whole
page, which is the one legitimate whole-page ring, because it is the **target**
rather than a finding.

## Selection is expansion, and neither is a control

`aim()` already toggled `dt-aimed` on the clicked row and held the ring; the row
just never *looked* any different, because the class was `--prim` at 14% alpha on
a dark rail. Now `DesignTool.css` gives it a 2px border and `devbar.css` reveals
the row's `.dev-more` — the declaration and the one action — off the same class.

**No JavaScript was added for any of that.** One click sets one class, and three
things follow from it, two of them in CSS. A second click on another row moves
all three; a second click on the same row collapses it and lets the ring go,
because `hold()`'s toggle already did.

⚠ A page-level finding (`dead-space`, `invisible`) still selects and still rings
nothing: `point()` finds no element, and a ring over the whole viewport carries
no bits. See [DesignTool's readme](/framework/ext/DesignTool/).

## The observer restarts a timer; it does not throttle

```js
clearTimeout(timer);
timer = setTimeout(measure, RESIZE);
```

Coalescing to one analysis per animation frame measured every width a drag passed
through and none of them mattered. 200ms, restarted by every event, means a
gesture costs one analysis at the width you let go at — 0 runs across a 40-event
drag, 1 after it stopped. That is why `follow the resize` is gone: one run per
gesture was never worth a control.

⚠ **An initial observation is not a change.** `observe()` re-delivers the box it
was just handed, and the run that observed it has already measured it. There were
two of them — `follow()` observed `.app` and `measure()` then observed the target,
the same element — so **the readout rendered twice on every open**, the second
200ms in. Nobody could see it while selection was invisible; with selection
visible it threw away the finding you had just clicked. `measure()` now owns every
`observe()`, and the `fresh` set makes the observer ignore that one delivery.

## The captor, twice

Both async paths rebuild through a callback — `$out.empty(() => verdict(…))`
inside the `then`, never factory calls after the `await`/`then` boundary. Same
trap `ask.js` dodges, same fix.

## Improvements

1. **`leading` is shown three deep, hardcoded.** Four fit at 1000px and none fit
   on a phone; the honest version measures the rail. *(simple, speculative.)*
2. **A re-measure throws the selection away.** Only a deliberate gesture causes
   one now (a drag, a preset, the button), so it reads as a consequence rather
   than a glitch — but remembering the selected finding by `rule` + `sel` across
   a redraw is a handful of lines if it ever annoys. *(simple, speculative.)*
3. **`analyze()` and `rate()` walk the page twice.** Both take a probe model, so
   one `probe()` handed to both would halve the ~47ms. *(medium — it is a change
   to DesignTool's front door, not to this file.)*
