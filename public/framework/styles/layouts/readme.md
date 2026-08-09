# Layouts — design record

Two claims, and the section exists to make both falsifiable: **a page layout is a
class string**, and **the utility set is enough**. So the interesting output is not
the layouts, it is the short list of times a rule had to be written. That list is
two lines long: the full-window overlay, and one hairline on the index's previews.

## The shape

```
page.js        the shape previews, then the wall of eight worked pages
preview.js     one shape: a frame, empty washed regions, a name
fit/           the long version: the two tokens, the breakout tracks
flex/ grid/    the two arrangements, as trees — and a live toolbar at the end
<eight>/       one worked layout each — the page IS the layout
Layout.js      the Page subclass that makes that true
recipe.js      the class string + the page's own source, inside the layout
variant.js     a class string, printed as a template and rendered from the same string
full.js        one layout, the whole window, at its own url (+ layouts.css)
```

## The index leads with renders, not class strings

It used to open with a six-row table of page-shape words and a second table of
what each layout was built from — a reference, before you had seen a single
layout. Now the first thing under the title is a full-width wall of **shapes**:
flex on the left, grid on the right, simplest first, each one more word than the
one above it. The class string is each preview's `title` attribute, so it is one
hover away and never in the way; the code is on `flex/` and `grid/`.

The whole wall lives inside one `demo.stage()`, so a single drag handle squeezes
every shape at once. That is the section's thesis in one gesture — none of them
contains a media query, so all of them re-flow together.

## Three things that will bite you

- **`children` is the only list.** Declared children auto-import at construction,
  so the index's gallery renders `page.layout()` off `this.children` and the test
  for "is this child a layout" is whether it *has* a `layout()`. There is no map to
  keep in step — there used to be, and `fit` fell out of it silently.
- **A layout page reaches UP for the nav, never sideways.** `this.parent.rail()`.
  A mutual import between the index and a layout would break deep reloads only.
- **`overflow-y` belongs to the ROW, not to the panel inside it.** A wrapping flex
  line is sized by its content — `align-content` can grow a line, never shrink one —
  so a scroller one level too deep never engages and a `fill` page clips with no way
  down. Both Holy grail and Dashboard hit this; both fixed it on the row.

## A preview's `--column` is an argument

`preview(name, classes, regions, column)`. The frame is about twelve em wide, so
the real `14em` would make every wall one column and every ladder look identical.
It is an argument rather than a `.style()` on the returned view because the box
**declares** the token, and a declaration beats anything a caller inherits down.

## What `Layout` does, and why it is a subclass

`Page.render()` draws an `h1` for whatever `title` it has, and a heading above a
masthead means it isn't one. `Layout` overrides `render()` to emit
`div.c("page").ac(this.classes)` and call `this.layout()` — so `classes` is the
page's layout, which is the thing this whole section is trying to teach, and the
title still reaches `document.title` through the Router. Eight pages, one override.

The three things an override owes, all silent when missed: set `this.view`, carry
`.page`, never nest a second `.page` inside.

## The long form

| | |
|---|---|
| [`doc/previews.md`](doc/previews.md) | `zoom` vs `transform` for a live thumbnail (measured), the gallery card, and the overturned per-layout `layout.js` |
| [`doc/full-view.md`](doc/full-view.md) | maximize as a url with a router that only knows path segments; the eight `full/` directories that became one `route()` |
| [`doc/css-cost.md`](doc/css-cost.md) | which layouts ever needed a rule, and the two gaps (`.basis`, `.measure`) that closed |

## Settled this pass

- **Holy grail's nav rail is `basis`, not `flex-1`.** As `flex-1` it split the row's
  slack with the article and rendered *wider* than the reading — the one thing a
  fixed rail must never do. The recipe rail beside it is `basis` at `17em`, because
  a 14em panel clipped the class string it exists to show.
- **A `Sidebar` `header:` replaces `brand()`, which is the element carrying the
  panel's inset.** A bare `span.c("h4", "LAYOUTS")` therefore sat flush against the
  panel edge on both Holy grail and Sidebar. Wrap it in `div.c("brand", …)`.
- **"Honestly cramped at 900px" is overruled.** The `--sidebar` note stands for the
  Sidebar page, which is *about* that token; Holy grail takes the default `--column`
  and now reads correctly from 900 up.

## Open

- **`stack` and `centered` overlap** — both are `measure` with different contents.
  If the section ever needs to be seven pages, these merge.
- **Media queries do not follow `zoom`**, so a layout that responded with a
  breakpoint would preview wrongly on the index. None of them does, which is an
  accidental but real argument for intrinsic techniques.
- **The previews carry no toolbar.** `flex/` and `grid/` each end in one
  (`layout()` / `layout.bar()`); putting thirteen on the index would be thirteen
  things to point at instead of a menu. Nesting a shape inside a shape live is
  still not possible — see `ext/layout/readme.md`.
