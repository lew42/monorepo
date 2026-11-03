# `controls.js` — the four widgets everything draws

`words.js` and `body.js` are both built from four functions in `controls.js`:
`pick` (a segmented set, one pressed), `menu` (a `<select>` once a set is too
long for chips), `toggle` (one class, pressed = present) and `knob` (a labelled
range bound to a custom property). `chips(words)` is `toggle` applied to a
space-separated list, and `btn(text, fn)` is the plain button both the bar and
the panel build every other control from.

These six are the module's second public surface. Several callers reach past
`layout.words` and import them directly: [`ext/editor`](/framework/ext/editor/)
draws its own properties region with `chips` and `btn` rather than opening the
floating bar over an element mid-canvas; [`ext/Panel`](/framework/ext/Panel/)
builds its alignment popover with `pick`, and its `T` template menu with `menu`;
[`styles/sections/tone.js`](/framework/styles/sections/) uses `pick` for the tone
chips it registers into `layout.context()`. `words.js` is the recommended surface
— one word, one control, extend by assignment — but when a caller wants a control
in a place `layout.bar()` does not reach, these six are the primitive underneath
it, and stable on their own.

## Two traps worth knowing before you use one directly

- **`menu()`'s selected option is written after the list exists.** Marking an
  `<option>` selected while `select.c(...)` is still building its children is
  silently the wrong pick — `menu()` sets `$menu.el.value` after the loop, not
  inside it.
- **`knob()` reads its value once, at build, and never stamps a default.** A knob
  that wrote its own default the moment it drew itself narrowed every page it was
  ever placed on, before anyone touched it — [`words.md`](/framework/ext/layout/doc/file/words.js.md)
  has the incident. `read()` checks the element's own inline value, then the
  cascade, and only falls back to the argument if neither exists.
