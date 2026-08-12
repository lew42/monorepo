# Layout

A toolbar you can put over anything, and a drawer on the right for whatever you
click — which **pushes** the app over rather than covering it.

```js
layout(() => { box("Alpha"); box("Beta"); })   // layout owns the box
layout.bar($box)                               // …or steer one you built
layout.bar(page)                               // …or a live page's shape words
layout.bar($box, "mode gap column radius")     // …or name the controls yourself
layout.words.radius = $el => knob($el, "--radius", 0, 2, 0.1)
layout.context($box, $sel => …)                // extra panel content, for it or anything in it
```

Register `layout.context()` **once, on the region**: the panel draws the nearest
registration at or above the selection, so a click on any descendant finds it and
a re-render cannot strand it.

`layout.js` is the box, the bar and what counts as selectable; `panel.js` is the
selection and the drawer; `body.js` is what a selection reads as; `words.js` is the
control vocabulary; `controls.js` is the chips, menu and knobs everything draws.
Imports flow one way — `layout` → `panel` → `body` → `words` → `controls`.

Ships almost no look of its own: the box wears `flex gap auto` / `grid gap auto`
and the buttons are `--subtle` on nothing until hovered. Both from `framework.css`
tokens.

## Decisions

**One toolbar for three targets.** `layout.bar()` took a container; `layout.page()`
was a second, near-identical function for a live `Page`, with its own control list
inline. They were merged: `layout.bar(target, list)` takes a `View`, a bare
`Element`, or a `Page`, and `view_of()` is the whole difference. What made two
functions look necessary was that a page's element does not exist yet — solved
once, for every target, by filling the bar in a **microtask** (see the traps
below) rather than by keeping a second code path. `layout.page()` is gone; it had
one call site.

**The control vocabulary is a registry, not a parameter list.** The bar's controls
were literals in `layout.bar`, and the panel's were a second set of literals in
`panel.js` — so "add a knob" meant editing this module, and the two files already
disagreed about which words existed. Options: a config object per call (an option
is API surface forever, and every call site would restate the default); subclassing
(there is no class); **a word → builder map** (`layout.words`) that any call site
can extend. The map won because it makes the bar's second argument a *sentence* —
`layout.bar($box, "mode gap column")` — reads at the call site, and because a
consumer adding `radius` writes one line and never touches this folder. An
unregistered word is skipped rather than thrown: half a bar beats no bar.

**Two knobs on the bar, still.** `.flex.auto > *` reads `--column` as a basis and
`.grid.auto` reads it as the `minmax()` floor, and `.gap` reads `--gap` — so one
pair covers *gap, wrap, columns, basis and minmax* across both modes. `--pad` is
panel-only for the same reason: a bar that has to be read is a bar in the way.

**Chips or a menu?** Both, by length. Two modes are a segmented pair you can hit
without reading; four page shapes are a `<select>`, because four chips plus two
flags is a row of noise in a bar that is supposed to disappear.

**The sliders chip.** Every bar ends with one, and it selects the bar's own target.
It closes the oldest hole in the module — *a region with no padding of its own is
unclickable*, because `pointed()` always lands on a child — and it is the only way
to select a **page**, which is not a region and must not become one (outlining
every block on a docs page as you move the mouse is not a docs page). One chip,
two problems, no new concept.

**Is the right panel a DOM inspector?** It was ruled one and not built. Overruled.
An inspector shows every property the browser has and edits declarations; this
panel knows exactly one vocabulary — the utility words in `framework.css` and the
tokens they read — and its output is `div.c("flex gap auto")`, the line you paste
into a page. Devtools can tell you `display: flex`; it cannot tell you the word
this site spells that with, and it cannot hand you the call.

**The drawer pushes.** It was `position: fixed` over the page, which is the one
thing a properties panel must not do: you lose sight of the element you are
editing at exactly the moment you edit it.

| | |
|---|---|
| wrap `$pages` in a row div, panel as a sibling | correct, and every site pays a shell div for an ext nobody may load |
| `.app` becomes a grid with a rail column | the shell would have to place its own chrome explicitly (`.nav` spans, `.pages` is column 1) — and `.app` is a **column**, so its children declare their own flexibility today |
| **the shell yields an inline-end rail** | ✓ one declaration, no structure moved |

**Verdict:** `framework.css` reads `--drawer` as `padding-inline-end` on `.app`, and
`panel.js` declares it on that same element when the drawer opens. Both the nav and
the region narrow, `.pages` keeps its own scrollbar at its own new edge, and the
panel stays `fixed` so no `overflow: hidden` anywhere can clip it. The width is one
number in one place: the panel's own width reads the token it inherits from `.app`.

Two details are load-bearing. It is **`rem`**, not `em` — the padding resolves
against `.app`'s font size and the width against the panel's own `0.85em`, so an
`em` value reserves the wrong strip. And the reservation is **self-limiting**,
`min(var(--drawer), max(0px, 100% - 24em))`, so a narrow window keeps its page and
the drawer covers instead: a media query would have put a breakpoint in the
framework for one ext.

**The panel's own shape.** A pinned head (name, `copy`, `✕`) over a scrolling body,
because a drawer whose ✕ scrolls away is a drawer you cannot shut. Knobs are a
three-column grid *inside the panel only* — names down the left, values down the
right — which is the difference between a wide panel and a wide bar. Groups are
`container` / `tokens` / `item` / `page` with an `.h4` eyebrow, borrowed rather than
invented (rung 2 of the ladder). The empty state is reachable: a re-render that
takes both the selection **and** its host leaves the drawer open saying so, where
it used to slam shut mid-edit and jolt the whole shell.

**A selected page gets page words, not container words.** `.page.standard` *is* a grid,
so the container section would offer to flip it to `flex` and destroy the breakout
template. The panel asks one question — `hc("page")` — and offers `shape fill flow
measure` instead.

**What is selectable?** The region, its direct items, and the items of any nested
`flex`/`grid` inside it — never deeper. `pointed()` walks up from the event target
to the first element whose parent lays its children out, so clicking a `<p>` selects
the card it lives in. Deeper would make every span in a sentence a target, and the
vocabulary has nothing to say about a span.

**`flex`/`grid` chips on a load-bearing container: left alone.** Flipping a section
band's wrapper to `flex` breaks its bleed until a reload — but the panel is a
playground, every edit is a class on a live node, and `--pad` or `v` break a layout
just as thoroughly. Letting `layout.context()` registration suppress the container
section would be the black magic this module refuses: an unrelated call silently
deleting controls, on exactly the elements a consumer cares most about.

**Container *or* item?** Both, when both are true — a nested box is an item of the
row above and a container of the boxes below. The container section always shows,
since any element can be given `flex`; the item section shows only when the parent
is `flex` or `grid`, because `basis` and `flex-1` do nothing anywhere else.

**The selection dies on re-render.** A consumer that re-runs its render (a tone chip
re-runs the whole band) replaces the selected element, leaving the panel editing a
detached node. The host names the survivor: a registration sits on the region, and a
re-render *empties* the region rather than replacing it. So the panel remembers the
selection's host and re-resolves on its next click — the code readout if the
selection is still connected, **the host** if it isn't, the empty state if even that
is gone.

## Traps

- **⚠ The bar fills itself in a microtask.** `page.view` is assigned only *after*
  `content()` returns, and reading `page.render()` from inside `content()`
  re-enters `render()` and recurses. So `layout.bar()` returns an empty strip and
  fills it on the next microtask, through `$bar.append(fn)` — which re-establishes
  the captor, so everything inside reads like ordinary page code.
- **⚠ `fill` used to break the page it was clicked on.** `.page.fill` carries
  `overflow: hidden` (Page.css), so writing it onto a live page taller than its
  region clipped everything below the fold — including the toolbar. The `fill` word
  pairs the class with an inline `overflow: auto`: live widget state, and a
  `.page.fill` rule here would be an ext overriding core.
- **⚠ The outside-click listener runs in the CAPTURE phase.** Redrawing the panel
  from inside a panel click detaches the click's own target, and `closest()` on a
  detached node reads as a click outside — which would shut the panel on every tone
  switch. `popstate` deselects outright: Back strands the selection.
- **⚠ A `<select>`'s value is written after its options exist.** Marking an
  `option` selected while the list is still building silently picks the wrong one.
- **⚠ A knob READS at build and writes only on input.** It used to stamp its own
  default, which was harmless on a box this module had just built and destructive
  everywhere else: the page bar's `--measure` knob narrowed every page it was placed
  on, at load, before anyone touched it. It now reads the inline value, then the
  cascade, then its default — and the cascade is empty for a tree not yet mounted,
  which is the one case where the readout can start wrong.

## Open

- **The bar still steers one container.** Selection nests; the toolbar does not, so
  a nested box's own words are reachable from the panel and not from a bar.
- **A re-render is noticed on the panel's next click**, not when it happens.
- **`--page-pad` has no knob.** It is a padding *shorthand*, and a slider cannot
  drive one. A pair of knobs writing `--page-pad-y` / `--page-pad-x` would be a
  proposal against `Page.css`, not something to invent here.

## Recommendation: the `Layout` name collision

`styles/layouts/Layout.js` is a `Page` subclass — the base class of the eight layout
showcase pages — and this folder is now `ext/Layout`. Two unrelated things share a
name in a codebase whose stated rule is *the class name is the registry*. Nothing
breaks today (they are never imported into the same file), which is exactly why it
will be imported into the same file eventually.

| option | |
|---|---|
| leave both | free, and the next reader has to open two files to find out which `Layout` a line means |
| rename this folder back to `ext/layout` | undoes a rename Mike just made, and lowercase makes the collision quieter rather than absent |
| **rename `styles/layouts/Layout.js` → `Shape.js` (`class Shape extends Page`)** | ✓ it is a page that *is* a shape — `classes` shapes the page, `layout()` fills it — and `shape` is already the word this module's page menu uses for exactly that vocabulary |
| rename it to `LayoutPage.js` | accurate, and length earned by nothing; the collision is with `Layout`, and `LayoutPage` still starts with it |

**Pick: `Shape`.** It touches one class, its eight subclasses' imports and a handful
of doc references — a rename with a large edit attached, so it wants Mike's word
first. Not done here; this folder does not own that file.
