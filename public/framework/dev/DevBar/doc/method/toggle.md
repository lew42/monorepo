> If this page shows a "Replaced at runtime" banner above the source: it's
> wrong, for the same reason [refresh](/framework/dev/DevBar/api/refresh/)'s
> page does — see this audit's top recommendation in
> `framework/audit/modules/dev.md`.

## Usage

- `public/app.js` — `devbar.toggle(true)` on the demo button this module's own
  Overview shows.
- `DevBar.js` — the `Ctrl`/`Cmd` + `\` keydown listener, and the header's `✕`
  (`toggle(false)`).
- Internally, `toggle` is exported both as `devbar.toggle` (the public name)
  and the local `toggle` function `DevBar.js` calls for its own listeners.

## Necessity

Essential — it is the only place `dev-open` is written. `open = !open()` by
default, so calling it with no argument **flips**; every caller that wants a
specific state (`✕`, the demo button) passes one explicitly.

Three lines, three jobs: toggle the class (`dev-open` on `<html>` is the
entire visible state — see [docking](/framework/dev/DevBar/doc/docking/)),
persist it (`set({ open: on })`), redraw (`devbar.refresh()`, which no-ops if
the rail just closed since `open()` now reads `false`).

## Simplicity

Right-sized. Calling `refresh()` unconditionally rather than only when
opening costs nothing — `refresh()`'s own `if (open())` guard makes the call
free when closing — and it means `toggle` doesn't have to know which
direction it just went.
