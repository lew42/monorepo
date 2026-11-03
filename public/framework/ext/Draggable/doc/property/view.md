The `View` this instance drags and registers — set once, in the constructor's
config object, and read everywhere: `grab()`/`end()` mark it (`ac`/`rc("dragging")`),
`under()` excludes it from its own hit-testing (`this.view.el.contains(el)`), and
`Draggable.registry` keys on `this.view.el`.

**Usage** — required, with no default and no setter. `handle` falls back to it
(`initialize()`, Draggable.js:13) when no separate grip is given, which is what
makes `new Draggable({ view: $bin, handle: false })` — a pure drop target — a
one-liner.
