The `layout` tab: [`ext/LayoutTool`](/framework/ext/LayoutTool/) run on the page
the rail is sitting next to — or on the `ext/Panel` you last clicked — reported
in 17rem. What is being measured, a grade, the severity counts, how wide, three
ratios, three leading findings — plus `re-run`, `full report`, and a `follow the
resize` knob.

The second `dev` → `ext` import in the module, after `ask.js`, and the first one
that is deferred rather than static.

Full design: [measuring](/framework/dev/DevBar/docs/measuring/).

## The shape: one section, one readout, one generation counter

`layout()` is the section — a knob and a container. `readout()` is everything
inside that container, rebuilt whole whenever the knob flips, and `paint()` is
the one line that connects them:

```js
const paint = () => $out.empty(readout);
```

`readout()` owns its `measure()`, its `report()` and its own generation number.
Re-running is not a special path: `empty(readout)` again *is* a re-run.

## `latest` / `mine` — only the newest readout measures, and only in the rail

```js
const stale = () => mine !== latest || !$out.el.closest(".dev-body");
```

The rail redraws on every navigation and on **every resize event**, so a
one-second drag builds sixty readouts. Each one has a pending timer, and with
the knob on, a `ResizeObserver` and a `panel-focus` listener as well. Without
this check a drag would land sixty analyses at once, all of them painting views
that had already been thrown away — and the observers would never stop, because
nothing tells a `ResizeObserver` that its view is gone. Every asynchronous
re-entry asks `stale()` first: the timer, the observer, the focus listener, and
the `then` after the import.

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
const tool = () => import("../../ext/LayoutTool/LayoutTool.js");
const full = () => import("../../ext/LayoutTool/report.js");
const spot = () => import("../../ext/LayoutTool/highlight.js");
```

`app.js` puts this rail on every page of the *built* site, so a static import
would ship ~45KB of analysis to every visitor. Deferring also keeps the graph
acyclic: `report.js` imports `/app.js`, which imports `DevBar.js`.

⚠ `spot()` resolves **after** the findings are built, which is only safe because
`aim()` builds no DOM — it adds listeners to a view already placed. A factory
call in that `then` would append to the page.

## The target, and the way back

```js
const panel = document.querySelector(".panel.focus");
return panel?.getClientRects().length ? panel : document.querySelector(".app");
```

`ext/Panel` writes the class and announces `panel-focus`; this listens and
re-measures, so clicking a panel is a measurement of that panel. The `page`
button dispatches `panel-unfocus` rather than importing a workspace to reach
into — the same thing Escape does. ⚠ The client-rect test is not decoration: an
inactive page keeps its DOM at `display: none`, so a selection outlives the
navigation away from it and would be measured as a page with no geometry.

## ⚠ `full report` carries the root, not just the data

```js
m.default(data, { limit: 3, root })
```

`root` is the `.app` element `analyze()` actually walked. Every finding's
address is a `:nth-child()` path *from* it, and `data` is plain JSON that cannot
carry an element — so without this the report's before/after falls back to
reloading `data.url` in a hidden frame and reconstructing the root from
`root_path`. That is the right fallback for the audit page, which reports on
frames that no longer exist; here it means resolving a path against a **second
document** while the first one is on screen. It shipped that way and the panes
came back rendering the site's sidebar. `measure()` holds the element it
measured so `report()` can hand it over. Full account:
[Addressing](/framework/ext/LayoutTool/docs/addressing/).

## The captor, twice

Both async paths rebuild through a callback — `$out.empty(() => verdict(…))`
inside the `then`, never factory calls after the `await`/`then` boundary. Same
trap `ask.js` dodges, same fix.

## `follow the resize` restarts a timer; it does not throttle

```js
clearTimeout(timer);
timer = setTimeout(measure, RESIZE);
```

The knob used to coalesce to one analysis per animation frame, which measured
every width a drag passed through and none of them mattered. 200ms, restarted by
every event, means a gesture costs one analysis at the width you let go at —
0 runs across a 40-event drag, 1 after it stopped. ⚠ The current target joins the
watch **once**, tracked in a `Set`: `observe()` re-delivers an initial
observation, so re-observing what a run just measured is a 5Hz loop.

## Improvements

1. **`content_width()` calls `getComputedStyle` on every measurement** to
   subtract `.app`'s padding. Correct and cheap next to the analysis it labels,
   but the probe already reads that style — a `frame.content` on the report
   would let every consumer stop re-deriving it. *(medium, useful — it is a
   change to LayoutTool, not to this file.)*
2. **The compact readout shows `leading` three deep, hardcoded.** Four fit at
   1000px and none fit on a phone; the honest version measures the rail. *(simple,
   speculative.)*
3. **`full report` has no way back to the compact view** short of `re-run`.
   Fine — `re-run` is the button next to it — but it reads as a one-way door.
   *(simple, cosmetic.)*
