## What this file is

The four widget primitives everything else in the module draws from —
`pick`, `menu`, `toggle`, `knob` — plus `chips()` (toggle over a word list) and
`btn()` (the plain button both the bar and panel build every control on top of).
Deliberately import-free of the rest of the module (only `View` factories), so
`layout.js` and `Panel/workspace.js` can both depend on it without a cycle.
Fuller picture, including who imports these directly:
[`controls.js`](/framework/ext/layout/doc/controls/).

## `pick()`'s `on` argument

`pick(words, choose, on)` builds every button unconditionally, then marks the
one matching `on` — never the reverse. That ordering matters: `$btns.indexOf(on)`
depends on every button already existing, so marking-then-building would silently
select nothing.

## `menu()`'s option-timing trap

Flagged directly in the source comment: `$menu.el.value = on ?? words[0]` runs
**after** the `select.c(...)` callback has already appended every `<option>`.
Setting `.value` while options are still being appended is a well-known browser
footgun — the assignment silently no-ops or picks the wrong option — and this is
the one place in the file that could not be reordered without breaking.

## `knob()`'s read-then-write asymmetry

`read($box, token)` runs once, synchronously, at build time — inline style
first, then computed style, falling back to the passed-in default only if
neither resolves. `set()` only ever runs from the `input` event. The asymmetry is
deliberate: see [`controls.js`'s traps](/framework/ext/layout/doc/controls/) for
the incident that made it that way (a knob that wrote its own default narrowed
every page it was placed on).

## Improvements

1. **`knob()`'s unit is hard-coded to `"em"`.** Every call site multiplies a
   plain number by an implicit `em`, so a future token meant to read in `rem` or
   `px` (the drawer's own width token is `rem`, on purpose — see
   [The drawer](/framework/ext/layout/doc/drawer/)) cannot use this control
   without a wrapper. A `unit` parameter defaulting to `"em"` would cost one
   argument and remove the ceiling. *(medium, useful)*
2. **`toggle()` reads `$el.hc(word)` twice per click** — once inside the click
   handler to decide `ac`/`rc`, and once at build time for the initial `.ac(...)`
   call. Both reads are correct and cheap; noted only because a future edit that
   changes what "pressed" means would have two places to update in lockstep.
   *(simple, speculative)*
3. **No control here validates its own arguments** (a `knob()` with `max <= value`,
   a `pick()` with an empty `words` array). None of that happens today because
   every call site is inside this module or a handful of trusted callers, but the
   six functions are also a documented public surface
   ([`controls.js`](/framework/ext/layout/doc/controls/)) that outside modules
   import directly — worth a line in that note, not necessarily a code change.
   *(simple, speculative)*
