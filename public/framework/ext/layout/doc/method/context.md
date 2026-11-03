`layout.context(el, fn)` registers extra panel content for `el` — or *anything
inside it*. `fn($sel)` runs every time the drawer opens on a selection at or
below the registered element, drawn after the built-in `container`/`item`/`page`
groups. The call site that knows what belongs there registers it once, on the
region; nothing about the panel interprets a marker or reaches out to find it.

`host_of()` (`panel.js`) walks up from the selection to the nearest registered
element, so a click on any descendant of the registered region finds the same
`fn`. That "nearest, not exact" match is also what survives a re-render — see
[The drawer](/framework/ext/layout/doc/drawer/#sharing-the-edge-with-devbar) for
why the registration has to sit on the region rather than the selection itself.

## Who uses it

[`styles/sections/tone.js`](/framework/styles/sections/) registers a tone-picker
chip group on every section band; [`web/layout/word.js`](/framework/styles/layouts/)'s
demo wall registers a `checkered` toggle nobody else in the module knows exists.
Both are one call, on the region, at render time.

## Traps

- **⚠ Registering twice on the same element appends, it does not replace.**
  `contexts.set(el, [...(contexts.get(el) || []), fn])` — a region rendered twice
  without a page reload accumulates duplicate groups in the drawer.
- Registering on an element that never becomes, or stops being, the panel's
  `host` simply never draws — there is no warning, because an unclicked
  registration looks identical to a correct one that has not been opened yet.
