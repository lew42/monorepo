# Layout space — design record

Sixteen `layout()` functions in this directory are the **same tree**: a nest of
class strings whose leaves call parts of one shared `site` object (`web.js`).
Nothing else differs between two of them. So a layout is not code — it is a
**string** — and every point in the space currently costs a directory, a
`page.js`, a nav slot and a readme paragraph.

That is what this page is against. Four files:

```
spec.js    text → live view. Indentation is nesting; a line is `<tokens> > <part>`
gen.js     seed → text. An integer is an ADDRESS, so a point is a link
ruler.js   one spec at five SCREENS at once, each fitted, never magnified past 1:1
page.js    the lab: text left, ruler right, the spec in the url hash
```

## What this does not replace

**The sixteen stay.** A generated layout is a sample; a written one is a
*lesson*, with a note saying which trap it teaches and parts you can switch off.
This page is the search, the rail is the curriculum, and a spec worth keeping
gets promoted by hand into a real `page.js` — which is still six lines of
`div.c()`, because that is what the format prints.

## Three decisions

**Why text and not JSON.** A layout is edited by a person, in a textarea, at the
speed of a thought. `["flex gap", ["basis", "menu"]]` is the same information
with four times the punctuation and no way to indent it wrong. The text format
has exactly one representation, so nothing round-trips and nothing can drift —
`gen()` emits text, `render()` consumes text, and the url holds text.

**Why a `:` means a declaration.** Every hand-written layout in this rail carries
inline state (`--basis: 15em`, `flex: 1 1 24em`), and the readme is explicit that
this is correct: it is per-layout state, not a look. A format that could not
express it would only be able to describe two thirds of the tier. `_` reads as a
space, which is the whole of the escaping.

**Why `scroll` and `stick` are words here and not in `framework.css`.** Both are
declaration sets the layouts readme names as traps — a wrapping row is the box
that scrolls, and a stretched rail has nothing to stick to. Promoting them to
utilities is a real proposal and it is Mike's call, not this page's; until then
they are this format's vocabulary and they expand in `spec.js`, where the three
declarations are visible on the line that names them.

## Two things that will bite you

- **A screen is a width AND a height.** The ruler shipped as widths alone and the
  390 shot rendered **2839px tall**, swamping the other four: with no height a
  `fill` page has nothing to divide and its `scroll` regions never engage. The
  list is pairs for that reason, and a shot's `.page` takes the height directly,
  the way `demo.layout`'s `frame()` does.
- **`render()` marks its root `default`.** `Page.css` hides any `.page` the
  Router did not mark, and nothing throws — the same trap `demo.layout` documents.

## What the analyzer said

`ext/LayoutTool` at 1280 / 1920 / 3440, after marking the miniatures: **C 79, C 71,
D 68, zero high findings** — against `docs` at B 84–89 and `fit` at F 54. Ten of the
~18 remaining are `cramped` and `pad-scale` on `td`, which is `framework.css`'s
`th, td { padding: 0.25em 0.75em }` and belongs to every page on this site carrying a
table; three are this readme's own prose inside `md.details`; and `dead-space`
("content spans 27% of a 3440px viewport") is an artifact of the ignore markers —
the lab and the wall *are* the width, and they are the boxes the tool was told to
skip. Net of those the page sits at the tier's baseline. Three things worth someone's
attention, none of them this page's to fix:

- **`--measure: 52em` runs ~96 characters a line at 3440**, above the tool's own
  45–85 band, because the measure is in `em` and the body font-size clamp grows with
  the viewport. That is a site-wide number, and either the token or the rule is wrong.
- **A `<li>` is indented from its heading by definition**, so `heading-offset` fires
  on every bulleted list under an `h2`. Possibly a ninth false-positive class.
- **The table rule is ten findings on any page with a table.** A bug report about
  `framework.css`, per the ladder — not something to override locally.

## Open — phase 2

- **Neighbours.** Change one word, render the six results: the space becomes
  *navigable* rather than merely sampled. The strongest next move.
- **Promote.** A button that prints the spec as the `layout(){ … }` function it
  is equivalent to, ready to paste into a new directory.
- **Score.** `ext/LayoutTool` already grades a rendered box. Running it over each
  of the five shots turns "does this work from mobile to mega" into a number, and
  turns the generator into a search rather than a sampler.
- **Pins.** Keep a spec; `core/Item` + `ext/Saver` already do the storage.
- The generator covers two families (rails, bands). Overlays, splits and the
  three-pane shapes are not in its range yet, so parts of the rail cannot be
  reached from an integer.
