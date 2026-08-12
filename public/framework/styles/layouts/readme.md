# Layouts — design record

Two claims, and the section exists to make both falsifiable: **a page layout is a
class string**, and **the utility set is enough**. So the interesting output is not
the layouts, it is the short list of times a rule had to be written. That list is
two lines long: the full-window overlay, and one hairline on the shape previews.

## The shape

```
page.js        the index, as a catalog: eleven live shapes in a rail, prose beside it
preview.js     shape() — a frame, empty washed regions; preview() adds the name
word.js        one class string as an INLINE CHILD PAGE: card, stage, panel, source
flex/ grid/    the two arrangements — nine and three child pages, no directories
fit/           the long version: the two tokens, the breakout tracks
<eight>/       one worked layout each — layout() returns its own div.c("page …")
detail.js      the shared config: demo.exhibit() over that layout, + preview()
full.js        one layout, the whole window, at its own url (+ layouts.css)
```

## One card shape, drawn by the child

**Question.** Three walls here used to draw their own cards, out of a shared gallery
module. Where does a preview live?

**Options.** (1) Keep `gallery.card()/wall()` — a module whose job is walls.
(2) `Page.preview()` / `Page.previews()` — the child draws its own card, the parent
arranges them. (3) Both, with gallery as the "rich" one.

**Verdict: (2), and gallery dies** (`ai/2026-08-09/proposal.md`, decision 3). The
cost of (1) was never the code — it was that a card was not a *page*, so a shape on
the index linked nowhere. Now `detail.js` overrides `preview()` in one line and every
wall here is `previews()`. A shape on the index and the same shape on `flex/` are
the same object; they cannot drift.

## The index is a catalog, and the ladders are gone

**Question.** The index drew two `ladder()`s — flex's nine words and grid's three,
each a heading over that page's `previews()` — inside a `demo.stage`. At 3440 that
stage was 546px: a page arguing that layouts respond to their box, demonstrating it
in a sixth of the screen.

**Options.** (1) Un-nest the ladders from the stage and keep them.
(2) Promote `ladder()` to a `Page.walls()` method (`ai/2026-08-11` T5).
(3) **Convert the index to `catalog()`** — the eleven children as a live rail beside
whichever one you clicked, at full size.

**Verdict: (3).** The rail is the nav, so the wall, the two ladders and the stage
all collapse into one mechanism, and a layout now opens *beside* its siblings
instead of replacing them. The ladders showed **grandchildren** as cards, which the
depth rule forbids anyway — flex's nine words belong on `flex/`, one click away.
`ladder()` is deleted; **T5's "replace `ladder()` with `walls()`" is moot for this
file** — `walls()` still has the `/framework/` landing as its consumer, and must
not be wired back in here.

## Two width behaviours, and one deliberate exception

**Question.** The eight layout pages had four: the measure, `pad`, `full`, and
`full fill`. `split` demonstrated a two-pane split at 900px on a 3440 monitor.

**Verdict: a layout page is a screen.** `split` and `stack` joined `masthead`,
`sidebar`, `holy-grail` and the two `pad` walls — the page is the region, and any
narrowness belongs to a `.measure` column *inside* it, which is what `stack` does.
`split`'s panes are now the band that reaches the edge, with the prose that explains
them in a `pad` band below, the way a masthead's bands work.

**`centered` stays 612px, on purpose.** The page *is* the centered layout: a
34em `.measure` column is the thing being demonstrated, and widening it would
demonstrate the opposite. It is the one page here that is allowed to look narrow —
do not "fix" it.

## A variant is a page, not an exhibit

**Question.** `variant()` printed a template beside a live render. Nine of those
on one page is nine exhibits and zero urls. What replaces it?

**Options.** (1) Keep the exhibit. (2) A directory per word — nine `page.js` files.
(3) An **inline object child** built by one factory.

**Verdict: (3), `word.js`.** A directory per word is nine files of boilerplate for
four fields; an inline child is one line in `children:` and buys the url, the nav
entry, the card and the deep link. `variant.js` is deleted. What it protected — the
code and the picture built from the same two arguments — survives: `word()` renders
the boxes and prints the template from the same `words`/`kids`.

The leaf shape is fixed: **stage first**, full-bleed, at real size; one caption; the
source in a closed `details` below. Not above — a code block that pushes the render
under the fold is the thing this whole wave is undoing.

## Three things that will bite you

- **`children` is the only list.** Declared children auto-import at construction, so
  `previews()` can ask each child to draw itself. There is no map to keep in step —
  there used to be, and `fit` fell out of it silently.
- **A layout page reaches UP for the nav, never sideways.** `this.parent.rail()`.
  A mutual import between the index and a layout would break deep reloads only.
- **`overflow-y` belongs to the ROW, not to the panel inside it.** A wrapping flex
  line is sized by its content — `align-content` can grow a line, never shrink one —
  so a scroller one level too deep never engages and a `fill` page clips with no way
  down. Both Holy grail and Dashboard hit this; both fixed it on the row.

**Closed (Aug 2026).** The twelve short leaf pages here were the first `.page.standard`
pages shorter than the region, and they exposed row-stretch — a 50px `h1` painting
130px. Fixed upstream with `align-content: start` in `Page.css`, never here.

## A shape's `--column` is a CARD argument only

`shape(classes, regions, column)`. The frame is twelve em wide, so the real `14em`
would make every ladder look identical. It is an argument rather than a `.style()`
on the way out because the box **declares** the token, and a declaration beats
anything a caller inherits down.

It is deliberately **not** passed to the leaf's box — a stage is forty em wide,
where the same token makes `basis` a sliver. A second knob for the real box was the
alternative; it bought two grid cards differing only by a number, so `grid/` has
three children and the token lesson stays in its `--column` demo.

## REVERSED — `Layout` was a subclass, and is now `detail.js` (2026-08-12)

**What it was.** `Page.render()` draws an `h1` for whatever `title` it has, and a
heading above a masthead means it isn't one. `Layout` overrode `render()` to emit
`div.c("page").ac(this.classes)` and call `this.layout()`, so the page **was** its
layout. Eight pages, one override, and the subclass earned itself on that one line.

**What changed.** The eight detail pages were the last tier on the site still
assembling their own — a render, no `ext/Layout` bar at all, and a `recipe()` block
printing the class string and the page's own `page.js`. `demo.exhibit()`
(`ext/demo/readme.md` §15) is that assembly, built once.

| | |
|---|---|
| keep the subclass, add a bar | the bar is the smallest part; the stage, the source, the file link and the caption are the rest, and a fifth hand-roll of them is what §15 exists to stop |
| `Layout extends Page` **and** an exhibit inside it | two ideas of what the page is, in one class. `render()` would have to stop being the layout anyway |
| **a config factory, `detail(config)`** | ✓ the `demo.tree()` / `demo.page()` / `word()` shape — spread-overridable, no new identity |

**Verdict: `detail.js`.** The subclass's whole reason was overriding `render()`, and
on a stage the page is no longer its layout — it is an ordinary `standard` doc page
*showing* one. `ext/demo/readme.md` §13 already weighed subclass-versus-factory for
exactly this and said factory; the reason `Layout` was the exception expired, so the
exception did. `recipe.js` went with it: the class string is the **first line of the
printed definition** and the whole `page.js` is the link beside the summary, so the
block was printing what the assembly already prints.

Three things to know:

- **`layout()` returns its own `div.c("page full fill flex v")`.** The class string
  is the lesson on these eight pages, so it has to be the first line of what the
  reader is shown — not a `classes:` key the source never mentions.
- **⚠ That nested `.page` needs `default`.** `Page.css`'s arrangement contract hides
  any `.page` no Router marked, so without it the stage renders nothing at all and
  nothing throws. `default` is the contract's own word for "shown without being
  routed to", and `demo.app()` marks the pages in its box the same way. `detail.js`
  adds it in `frame()`, once.
- **⚠ `height:` only where the shape wears `fill`.** `.page.fill` is
  `min-height: 100%`, which needs a parent that has a height, and a stage's render
  is sized by its content. Holy grail and Dashboard declare one; the other six are
  their content's height, exactly as they were as pages.

What the conversion also bought, unasked: the eight cards are now `zoom-25` of the
**framed** layout rather than of its contents, so a thumbnail wears the same
`full`/`pad`/`fill` the page does. A card and the page it links to could previously
disagree about the page shape; now they cannot.

Where `recipe()` occupied a real region — Holy grail's second rail, Dashboard's
feed, the seventh cell of the Cards wall — ordinary content took its place rather
than a hole. A five-region layout with four regions in it is not the layout.

## The long form

| | |
|---|---|
| [`doc/previews.md`](doc/previews.md) | `zoom` vs `transform` for a live thumbnail (measured), the card shape, and the overturned per-layout `layout.js` |
| [`doc/full-view.md`](doc/full-view.md) | maximize as a url with a router that only knows path segments; the eight `full/` directories that became one `route()` |
| [`doc/css-cost.md`](doc/css-cost.md) | which layouts ever needed a rule, and the two gaps (`.basis`, `.measure`) that closed |

## Open

- **`stack` and `centered` overlap** — both are a 34em `.measure` column with
  different contents, and since `stack` went `full` the two render at *identical*
  width (612px at 3440). The difference is now entirely the content: rhythm versus
  line length. If the section ever needs to be seven pages, these merge.
- **Media queries do not follow `zoom`**, so a layout that responded with a
  breakpoint would preview wrongly on the index. None of them does, which is an
  accidental but real argument for intrinsic techniques.
- **`word.js` borrows `.demo-source`** because `demo.source()` takes a *function* and
  a word's template is a built string. Rung 3 of the ladder; a third caller means
  `demo.source` should grow a string form instead.
