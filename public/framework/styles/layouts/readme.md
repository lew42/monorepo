# Layouts — design record

Two claims, and the catalog exists to make both falsifiable: **a page layout is a
class string**, and **the utility set is enough**. So the interesting output is not
the layouts, it is the short list of times a rule had to be written. That list is
two lines long: the full-window overlay, and one hairline on the shape previews.

## The shape

```
page.js         the index, as a catalog: fifteen live pages in a rail, prose beside it
space/          the same tier as a STRING: a text format, a seed→layout generator,
                and one spec live on five screens at once. The search, not the curriculum
web.js          `site` — one fictional site's content, rendered by ten of the layouts
preview.js      shape() — a frame, empty washed regions; preview() adds the name
word.js         one class string as an INLINE CHILD PAGE: card, stage, panel, source
fit/ flex/ grid/  the vocabulary: the page shapes, nine flex words, three grid ones
<twelve>/       one worked layout each — layout() returns its own div.c("page …")
full.js         one layout, the whole window, at its own url (+ layouts.css)
```

Every layout is `new Page(demo.layout({ meta, title, layout(){ … } }))` — config over
`ext/demo`'s one exhibit (`ext/demo/layout.js`), which is where the card, the stage,
the source and the `parts:` chips are built. **No stylesheet in any layout directory,
and there must not be one:** everything is the twelve layout words plus the three page
shapes, and the handful of `overflow` and `position: sticky` declarations are inline
because they are per-layout state, not a look.

## What is here, and what the merge deleted

`core/Page/layout/`'s ten whole-page layouts moved in on 2026-08-12 and the two tiers
became one catalog at one url. Twelve survivors, one `/path/` each.

| kept | teaches |
|---|---|
| `document` | header, one measure column, footer — the layout every other one departs from |
| `docs` | two rails and an article, re-flowing on the row's own width |
| `landing` | full-bleed bands, each holding its own reading column |
| `stack` | rhythm (`--flow`) versus `gap`, and a whole form with no CSS of its own |
| `shell` | six regions, five checkboxes — turn them all off and it **is** `document` |
| `dashboard` | two walls, one `--column` each: numbers at `9em`, panels at `20em` |
| `split` | list · detail — two independent scrollers, and what the wrap costs |
| `gallery` | a filter rail beside a wall that re-counts its own columns |
| `sidebar` | the real `Sidebar` at `--sidebar`; this site's own `/framework/` layout |
| `feed` | a capped centre column between two sticky rails |
| `mail` | three panes, three widths, one row that sheds them in order |
| `chat` | a composer pinned by the transcript rather than by itself |

`fit`, `flex` and `grid` sit beside them and are not layouts — they teach words.

| deleted | where the lesson went |
|---|---|
| `cards` | `grid gap auto` is a word (`grid/auto/`), and the whole-page version of a wall is `gallery` |
| `centered` | a measure column with no bands is `document` with its header and footer unchecked — the overlap this file already had open |
| `dashboard` (this tier's) | same board, without toggleable regions or a card that shows both extremes |
| `holy-grail` | five regions, static; `shell` is the same five as checkboxes |
| `masthead` | hero over bands — `landing`, plus a footer and a CTA you can turn off |
| `split` (this tier's) | two equal panes is one flex word (`flex gap auto`); the name goes to the whole-page list · detail |

**Why the incoming tier won every contested pair.** Ten layouts rendering **one**
content object means the only difference between two pages is where the boxes go, and
each card is the layout *twice* — a 390 phone beside a 3440 monitor, both live. A page
that teaches by writing its own prose into its layout cannot make that comparison, and
six of the eight were teaching a word rather than a page.

**Why `sidebar` and `stack` came through it.** Neither is a screen: one places the
framework's own `Sidebar` with two utility classes, the other is spacing. They keep the
plain `zoom-25` card — `twin: true` is for a specimen that is a *screen* — and their
prose is their content, which is why they are the two pages here that read at one width.

**No aliases.** Core has no url-alias mechanism and deliberately does not want one
(`core/Router/doc/backed-out.md`: *support redirect, not alias* — two live urls for one
state breaks the injective url→state encoding). The old `/framework/core/Page/layout/*`
urls are a week old and simply die.

## One card shape, drawn by the child

**Question.** Three walls here used to draw their own cards, out of a shared gallery
module. Where does a preview live?

**Verdict: `Page.preview()` / `Page.previews()`, and gallery dies**
(`ai/2026-08-09/proposal.md`, decision 3). The cost of a gallery was never the code —
it was that a card was not a *page*, so a shape on the index linked nowhere. Now
`demo.layout()` overrides `preview()` in one line, a shape on the index and the same
shape on `flex/` are the same object, and they cannot drift.

## The index is a catalog, and the ladders are gone

The index drew two `ladder()`s inside a `demo.stage` — at 3440 that stage was 546px: a
page arguing that layouts respond to their box, demonstrating it in a sixth of the
screen. **Verdict: `catalog()`.** The rail is the nav, so the wall, the two ladders and
the stage collapse into one mechanism, and a layout opens *beside* its siblings. The
ladders showed **grandchildren** as cards, which the depth rule forbids anyway — flex's
nine words belong on `flex/`, one click away. `ladder()` is deleted, and `walls()` must
not be wired back in here: its consumer is the `/framework/` landing.

## A variant is a page, not an exhibit

`variant()` printed a template beside a live render; nine of those on one page is nine
exhibits and zero urls. **Verdict: `word.js`** — an inline object child is one line in
`children:` and buys the url, the nav entry, the card and the deep link. The leaf shape
is fixed: **stage first**, full-bleed, at real size; one caption; the source in a closed
`details` below. Not above — a code block that pushes the render under the fold is the
thing this whole wave is undoing.

## Three things that will bite you

- **`children` is the only list.** Declared children auto-import at construction, so
  `previews()` can ask each child to draw itself. There is no map to keep in step —
  there used to be, and `fit` fell out of it silently.
- **A layout page reaches UP for the nav, never sideways.** `this.parent.rail()`.
  A mutual import between the index and a layout would break deep reloads only.
- **`overflow-y` belongs to the ROW, not to the panel inside it.** A wrapping flex
  line is sized by its content — `align-content` can grow a line, never shrink one —
  so a scroller one level too deep never engages and a `fill` page clips with no way
  down.

⚠ Two more the exhibit handles for you, and both fail silently if you hand-roll one:
that nested `.page` needs **`default`** (`Page.css` hides any `.page` no Router
marked), and `height:` belongs only where the shape wears `fill`.

## A shape's `--column` is a CARD argument only

`shape(classes, regions, column)`. The frame is twelve em wide, so the real `14em`
would make every ladder look identical. It is an argument rather than a `.style()` on
the way out because the box **declares** the token, and a declaration beats anything a
caller inherits down. It is deliberately **not** passed to the leaf's box — a stage is
forty em wide, where the same token makes `basis` a sliver.

## `centered` is gone, and `stack` is not narrow

`stack` is a `full` page with a `.measure` column inside it: the page is the region and
the narrowness belongs to the column. The page that *was* its own measure is deleted —
that width lesson is `fit/`'s, and a reading page with bands is `document`.

## The long form

| | |
|---|---|
| [`doc/twin.md`](doc/twin.md) | the card that is two screens: measured zoom, the auto-height stage, parts as checkboxes, and why `web()`'s prose is short |
| [`doc/previews.md`](doc/previews.md) | `zoom` vs `transform` for a live thumbnail (measured), the card shape, and the overturned per-layout `layout.js` |
| [`doc/full-view.md`](doc/full-view.md) | maximize as a url with a router that only knows path segments |
| [`doc/css-cost.md`](doc/css-cost.md) | which layouts ever needed a rule, and the two gaps (`.basis`, `.measure`) that closed |

## Open

- **Media queries do not follow `zoom`**, so a layout that responded with a breakpoint
  would preview wrongly on the index. None of them does, which is an accidental but
  real argument for intrinsic techniques.
- **Two pedagogies in one rail.** Ten cards are a phone beside a monitor; `sidebar` and
  `stack` are a quarter-size page. Justified above, and worth revisiting if the mix
  reads as an accident rather than a distinction.
