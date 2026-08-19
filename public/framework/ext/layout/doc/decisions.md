# Layout — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

`layout.js` is the box, the bar and what counts as selectable; `panel.js` is the
selection and the drawer; `body.js` is what a selection reads as; `words.js` is the
control vocabulary; `controls.js` is the chips, menu and knobs everything draws.
Imports flow one way — `layout` → `panel` → `body` → `words` → `controls`.

Ships almost no look of its own: the box wears `flex gap auto` / `grid gap auto`
and the buttons are `--subtle` on nothing until hovered. Both from `framework.css`
tokens.

## The control vocabulary

`layout.words` is a `word → builder` map, extended by plain assignment — the
whole reason "add a knob" costs one line and never opens this folder. It is also
why `layout.bar()` is one function for a `View`, a bare `Element`, and a live
`Page`, rather than the two near-duplicate functions it used to be. Full record,
including why chips and a `<select>` coexist: [`doc/vocabulary.md`](./vocabulary.md).

## The drawer

One drawer per document, opened by a selection, and it **pushes** — `.app` yields
an inline-end rail (`--drawer`) rather than the panel floating over the page,
because a properties panel that covers what you're editing is the one thing this
widget must never do. It shares that edge with [`dev/DevBar`](/framework/dev/DevBar/)
(`.app` sums `--drawer + --devbar`) and survives a re-render by remembering the
selection's *host*, not the selection itself. Full record, including the
self-limiting width clamp and why it's `rem` not `em`: [`doc/drawer.md`](./drawer.md).

## What's selectable, and what it shows

A region, its direct items, and the items of any nested `flex`/`grid` — never
deeper — plus one fixed "sliders" chip on every bar that selects the bar's own
target (the only way to select a page, which must never become a hoverable
region itself). A selected page gets page words (`shape fill flow measure`), never
container words, because `.page.standard` already *is* a grid. Full record,
including why the panel is not a DOM inspector: [`doc/selection.md`](./selection.md).

## `controls.js` — reused directly, not only through `layout.words`

`pick`, `menu`, `toggle`, `chips`, `knob`, `btn` are the four widgets everything
above is built from, and several callers import them straight from `controls.js`
rather than going through a bar at all — [`ext/editor`](/framework/ext/editor/)'s
properties region and [`ext/Panel`](/framework/ext/Panel/)'s alignment popover,
notably. What each one guarantees, and the two option/knob timing traps:
[`doc/controls.md`](./controls.md).

## Who uses this

| caller | uses it for |
|---|---|
| [`web/layout/flex/`](/web/layout/flex/), [`grid/`](/web/layout/grid/), [`flow/`](/web/layout/flow/) | the guide pages for flex/grid/rhythm — a live bar over the demo row, plus per-page custom words |
| [`styles/layouts/word.js`](/framework/styles/layouts/) | one inline demo page per utility word — a bar over the live boxes on the stage |
| [`styles/sections/tone.js`](/framework/styles/sections/) | registers the tone-chip group into every section band's panel via `layout.context()` |
| [`ext/Panel`](/framework/ext/Panel/) (`workspace.js`) | `layout.bar($body)` per leaf panel body, when the leaf holds ordinary content |
| [`ext/editor`](/framework/ext/editor/) (`page.js`) | its properties region is built directly from `layout.words` + `controls.js` — not the floating bar |
| `ext/layout/page.js` | documents itself, live |

Six historical prototypes under `framework/ai/2026-08-08/`, `ai/2026-08-12/apps/*`
and `ai/2026-08-14/editor-panel-review/` also import this module — pre-`ext/Panel`,
pre-`ext/editor` sketches that predate the current shape (one still assumes the
now-deleted `layout.page()`). They still run, but nothing links to them from a live
page; the framework-proper callers above are the ones this module is designed for.

## Decisions

**One toolbar for three targets, and the vocabulary is a registry, not a
parameter list** — the two decisions that shaped every file here. Both live in
[`doc/vocabulary.md`](./vocabulary.md) now; summarized above.

**The drawer pushes, not floats** — weighed against wrapping every page in a row
div and against making `.app` a grid. [`doc/drawer.md`](./drawer.md) has the
full comparison and what's load-bearing in the CSS.

**Selecting no longer OPENS the drawer — reversed 2026-08-18.** The owner: "too
jumpy… if we're going to have one, it should remain?" `select()` now calls
`redraw()` (fills only if `drawer.showing()`), same as deselecting; `open()` is
the one exception, wired to the toolbar's sliders chip, which is the reader's
explicit "let me in." A page with a selectable region but no bar gets no
automatic way in, on purpose, pending the owner.
[`ext/Panel/doc/decisions.md`](/framework/ext/Panel/doc/decisions/) has the
matching reversal on the panel-focus side.

**What is selectable, and page-vs-container words** — [`doc/selection.md`](./selection.md).

## Traps

- **⚠ The bar fills itself in a microtask.** `page.view` is assigned only *after*
  `content()` returns, and reading `page.render()` from inside `content()`
  re-enters `render()` and recurses. So `layout.bar()` returns an empty strip and
  fills it on the next microtask, through `$bar.append(fn)` — which re-establishes
  the captor, so everything inside reads like ordinary page code.
- **⚠ `fill` used to break the page it was clicked on.** `.page.fill` carries
  `overflow: hidden` (Page.css), so writing it onto a live page taller than its
  region clipped everything below the fold — including the toolbar. The `fill`
  word pairs the class with an inline `overflow: auto`.
- **⚠ The outside-click listener runs in the CAPTURE phase.** Redrawing the panel
  from inside a panel click detaches the click's own target, and `closest()` on a
  detached node reads as a click outside. `popstate` deselects outright: Back
  strands the selection.
- **⚠ A `<select>`'s value is written after its options exist.** Marking an
  `option` selected while the list is still building silently picks the wrong one.
- **⚠ A knob READS at build and writes only on input.** It used to stamp its own
  default, which narrowed every page bar's `--measure` at load, before anyone
  touched it. It now reads the inline value, then the cascade, then its default.

## Open

- **The bar still steers one container.** Selection nests; the toolbar does not,
  so a nested box's own words are reachable from the panel and not from a bar.
- **A re-render is noticed on the panel's next click**, not when it happens.
- **`--page-pad` has no knob.** It is a padding *shorthand*, and a slider cannot
  drive one. A pair of knobs writing `--page-pad-y` / `--page-pad-x` would be a
  proposal against `Page.css`, not something to invent here.
