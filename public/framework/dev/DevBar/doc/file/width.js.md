The head's second line: **the four presets that set the page's width, and the
number they promise.** One line, in the head, so it is on every tab.

## Why it is not a section

It was one — `viewport`, on the `page` tab: the four presets, `size`, `font` and
`em`. And the `layout` tab, a click away, reported the same state as a different
number:

| | shown | what it actually was |
|---|---|---|
| `page` tab | `size 1920 × 1080` | the **window** |
| `layout` tab | `root 1648px` | the **page** |

272px apart — exactly the rail — neither labelled as which, and the buttons that
*set* the page width were on the tab that showed the window. The width is the one
piece of state every tab's content depends on, so it belongs where every tab can
see it. `size`, `font` and `em` are deleted; `em` rides along on the one line,
because every token on this site is `em` off the body clamp and that is the unit
the layouts are written in.

## The reading is `.app`'s CONTENT box

```js
app.clientWidth - paddingLeft - paddingRight
```

`.app` reserves the rail as `padding-inline-end` (`framework.css`), so its border
box reads the full window however far the page has been squeezed — the number the
presets promise is the content box. Same subtraction the `layout` readout used to
do for itself; there is one copy now.

## One `ResizeObserver`, and it watches the app the App built

```js
new ResizeObserver(() => $px.text(reading(app.$app.el))).observe(app.$app.el);
```

A `ResizeObserver` reports the **content** box by default, which is the only
thing that moves when the rail is dragged — so one observer covers the grip, the
four presets and the window with no listener for any of them, and it delivers an
initial observation, so nothing has to paint the first value.

⚠ **`app.$app.el`, never `document.querySelector(".app")`.** This runs inside
`App.render()`, and the shell does not reach the document until `inject()`,
several awaits later. The query comes back `null`, there is no retry, and the
reading stays blank forever — which is exactly what shipped for one build of this
file. An observer on a detached element simply waits for it to have a size.

## The presets are lit off a setting, not a measurement

`.app` eases its push over 0.18s, so anything measured right after a click reads
mid-transition. `mark()` compares `settings.width` with `innerWidth - target`
instead, and repaints only the buttons — the rail's full redraw drops focus, and
the `ai` tab is focus-sensitive. The floor, and why a preset clears
`--rail-floor` permanently: [sizing](/framework/dev/DevBar/doc/sizing/).

⚠ At 390 every preset is unreachable by construction (`innerWidth - 390 = 0`), so
all four grey out and say which window they need. That is the width where the
rail stops being a rail at all — [it becomes a bottom
sheet](/framework/dev/DevBar/files/) (`devbar.css`).
