# `mode.js` — light / dark / auto, as one button

A plain-function module beside `App`, not a class and not a theme. Four functions,
two exported.

```js
import mode from "/framework/core/App/mode.js";

mode(app)         // the button — returns a View, append it wherever
mode.apply(app)   // the stored choice, with no button
```

## Members

**`mode(app)`** — the button. `Sidebar.js:113` (`if (this.app) this.$mode =
mode(this.app)`) is the only caller. Returns `button.mode-btn` with a Material
Icons glyph, cycling `auto → light → dark → auto`, writing `localStorage` and
restyling itself in place.

**`mode.apply(app)`** — applies the stored choice without rendering anything.
`app.js:70`, one caller: a route with no sidebar would otherwise silently ignore
the reader's saved mode.

**`read()`** — module-private. `localStorage`, guarded, defaulting to `auto`. The
`NEXT[…] ? … : "auto"` idiom is doing validation work with the cycle table, which is
clever and slightly opaque — a stored value outside the three is treated as `auto`.

**`apply(app, m)`** — module-private, and the only line that touches the DOM:

```js
app.$app?.style("color-scheme", m === "auto" ? "" : m);
```

## Necessity

Keep, and keep it here. A theme is CSS; this is theme-**agnostic behaviour** — any
theme shipping both modes wants it, and core's `Sidebar` renders it in its footer.
It lived under `styles/layers/theme/` once and was the single thing `core/` imported
from outside `core/`, across a directory that had just proved it can move. The
import took the site down for exactly as long as it took to notice.

`mode.apply` is not sugar for `mode()`: one renders, one doesn't, and a page with no
sidebar needs the second without the first.

## Traps

**The `queueMicrotask` is required, and its absence is silent.** `mode(app)` can run
*inside* `div.c("app", …)`'s capture callback, and `app.$app` is not assigned until
that callback returns — applying immediately is a no-op, and a stored mode is simply
forgotten on reload.

**`.app`, not `<html>`.** The theme's tokens live on `.app`, and two themes can
render side by side on one page; a mode forced at the root would take both.

**`auto` clears the override** rather than storing a resolved value, because the OS
can change while the tab is open.

## Simplicity

Right-sized — 45 lines, no class, no state outside `localStorage` and one closure
variable. Two things are worth naming:

- **`current` is per-button.** Two `mode()` buttons on one page each keep their own
  idea of the cycle position; they agree only because both write the same key. No
  page renders two.
- **The `try/catch` around `localStorage` appears twice**, for Safari private mode.
  Correct, and the second `catch {}` swallows a write failure with no warning — the
  reader's choice is silently not saved.
