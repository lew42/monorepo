# layout

A toolbar over a container, quiet until you point at it.

```js
layout(() => { box("Alpha"); box("Beta"); })   // layout owns the box
layout.bar($box)                               // …or steer one you built
layout.page(this)                              // …or a live page's shape words
```

Ships almost no look of its own: the box wears `flex gap auto` / `grid gap auto`
and the buttons are `--subtle` on nothing until hovered. Both from `framework.css`
tokens.

## Decisions

**Where does the toolbar live?** Over the box's top-right corner, absolutely
positioned inside `.layout`, at `opacity: 0` until `:hover` or `:focus-within` —
and always visible under `@media (hover: none)`, because a touch screen has no
hover to reveal it with. It was a row of big `button.prim` chips above the box,
which added height to every call site and read as the loudest thing on the page.
A widget you have to look past is a widget in the way. A `.layout-bar` with no
`.layout` above it stays in the flow at 40% instead — that is the `layout.page`
case, where the bar is the page's own control rather than chrome over a box.

**How many knobs?** Two. `.flex.auto > *` reads `--column` as a basis and
`.grid.auto` reads it as the `minmax()` floor, and `.gap` reads `--gap` — so one
pair of tokens covers *gap, wrap, columns, basis and minmax* across both modes,
and switching mode keeps the numbers meaningful. Wrap is not a knob because
`.flex.auto` already wraps.

**Chips or a menu?** Both, by length. Two modes are a segmented pair you can hit
without reading; four page shapes are a `<select>`, because four chips plus two
flags is a row of noise in a bar that is supposed to disappear.

**The container handoff** — the open question, now closed. `layout(fn)` builds the
box, so a call site whose own builder makes the container had no way to point the
bar at it. `layout.bar($box)` takes the container as its argument and returns just
the toolbar; `layout()` is now two lines on top of it. `styles/layouts/flex` and
`/grid` are the first consumers.

**⚠ `fill` used to break the page it was clicked on.** `.page.fill` carries
`overflow: hidden` (Page.css), so writing it onto a live page taller than its
region clipped everything below the fold — including this toolbar, which left no
way to click it off. The bar now pairs `fill` with an inline `overflow: auto`. An
inline style rather than a rule on purpose: this is live widget state, not a
stylesheet's opinion, and a `.page.fill` rule here would be an ext overriding core.

**⚠ `page.view` is read late.** It is assigned *after* `content()` returns, so
`layout.page(this)` cannot touch the element while it builds — reading
`page.render()` there re-enters `render()` and recurses. The bar therefore reads
the live element on click, and seeds its pressed states in a `queueMicrotask`.

## Open

- **A right panel of contextual properties — considered, not built.** Hover or
  select a region, see its classes and tokens in a quiet rail. The 80% of it that
  earns its weight is already here: a toolbar that appears at the corner of the
  thing it steers *is* contextual chrome, with no panel to dock and no selection
  model to maintain. The remaining 20% — arbitrary regions, a live class readout,
  writing values back — is a DOM inspector, and every browser ships a better one.
  It becomes worth building the day this repo has an editor to put it in.
- **No nesting.** You can shape one container, not a container inside it. A second
  bar would need a selection model, which is the same 20% above.
