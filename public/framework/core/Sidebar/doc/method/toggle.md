The hamburger. A real `<button>` with three painted spans.

## Usage

`Sidebar.js:40` — `bar()`, the only caller. Assigns `this.$toggle`, read twice: the
Escape handler refocuses it (`Sidebar.js:31`) and `open()` writes its
`aria-expanded` (`Sidebar.js:72`).

## Necessity

Keep. **Always in the DOM; the media query decides when it shows** — so there is no
resize listener and no state to reconcile with one.

A real `<button>` rather than a clickable div or a checkbox hack: focus, Enter and
Space, and `aria-expanded` all come free, and none of the three can be forgotten
later.

Three `span.sidebar-toggle-bar` painted `currentColor` rather than an icon: this
component must not depend on a font the app may never have loaded — the same rule
that makes the active chevron a `"\203A"` and not `chevron_right`.

## Simplicity

Right-sized. The `aria-expanded` is initialised here as `"false"` and maintained in
`open()`, which is two places for one fact — but the alternative is calling
`open(false)` during construction, which would touch classes before the element is
anywhere.

`.attr("aria-label", "Menu")` is the only user-facing string this class hardcodes.
Nothing localises it, and nothing can.
