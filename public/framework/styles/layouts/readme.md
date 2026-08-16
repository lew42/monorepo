# Layouts — design record

Two claims, and the catalog exists to make both falsifiable: **a page layout is a
class string**, and **the utility set is enough**. So the interesting output is not
the layouts, it is the short list of times a rule had to be written. That list is
two lines long: the full-window overlay, and one hairline on the shape previews.

## The shape

```
page.js         the index, as a BROWSER: a filter rail and a grouped wall, both
                ext/Panel leaves, in a full-bleed fill-height page
model/          the prose that used to be the index — the seven-sentence model,
                the vocabulary table, what the two extremes cost
space/          the same tier as a STRING: a text format, a seed→layout generator,
                and one spec live on five screens at once. The search, not the curriculum
web.js          `site` — one fictional site's content, rendered by ten of the layouts
preview.js      shape() — a frame, empty washed regions; preview() adds the name
word.js         one class string as an INLINE CHILD PAGE: card, stage, panel, source
fit/ flex/ grid/  the vocabulary: the page shapes, nine flex words, three grid ones
<seventeen>/    one worked layout each — layout() returns its own div.c("page …")
masonry/        the exception that ships JS: two ragged walls, and `pack()`
full.js         one layout, the whole window, at its own url (+ layouts.css)
```

Every layout is `new Page(demo.layout({ meta, title, layout(){ … } }))` — config over
`ext/demo`'s one exhibit (`ext/demo/layout.js`), which is where the card, the stage,
the source and the `parts:` chips are built. **No stylesheet in any layout directory,
and there must not be one:** everything is the twelve layout words plus the three page
shapes, and the handful of `overflow`, `align-content` and `position: sticky`
declarations are inline because they are per-layout state, not a look.

**`masonry/` is the first directory here to ship a `.js`, and the claim survives it.**
Masonry needs CSS that no utility had, so the two words went into `framework.css` where
the other twelve live (`masonry`, `packed`) — a thirteenth and fourteenth in the
vocabulary, not a private sheet. What `masonry/masonry.js` holds is the *measuring
pass* `packed` needs, which is behaviour rather than a look; it lives beside its one
caller because `util/`'s own bar is "two callers that must agree". If a second caller
ever appears, that is when it moves.

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

## The index was a catalog, and is now a browser (2026-08-16)

The index first drew two `ladder()`s inside a `demo.stage` — at 3440 that stage was
546px: a page arguing that layouts respond to their box, demonstrating it in a sixth of
the screen. **First verdict: `catalog()`**, a rail of live cards beside the routed
child. That collapsed the wall, the ladders and the stage into one mechanism, and it
held for four days.

**Reopened by Mike, 2026-08-16: a rail is a list, and this tier is a gallery.** A
one-column rail shows about six of twenty-three cards at a time and gives the widest
card ~26em, so finding a layout meant scrolling a column while the rest of a 3440
screen sat empty. The prime objective is *the fewest possible clicks to any thing*, and
a catalog spends its width on the thing you already chose.

**Verdict: a `previews()` wall, sectioned, inside a two-leaf `ext/Panel`.** The rail
became a **filter** rather than a list — search, plus one row per `group:` with a count
— and the wall shows every layout at once, seven across at 3440. Three things fell out
that were not the reason but are worth recording:

- **The sections were free.** `previews()` already heads each run of a shared `group:`
  with an `h4`, and every layout already declared one. Nothing was added to get them.
- **The prose had to move.** A fill-height page has nowhere to scroll, so the
  seven-sentence model and the vocabulary table became `model/` — the first card, under
  a *Read this first* group. Every word kept, one click away, and it gained a url.
- **`catalog()` is not deprecated.** It is still right for a tier you read *through* —
  every Doc Overview is one. The distinction is whether the reader is choosing from the
  set or reading the set in order.

`ladder()` stays deleted, and `walls()` must still not be wired back in here: its
consumer is the `/framework/` landing. The ladders showed **grandchildren** as cards,
which the depth rule forbids anyway — flex's nine words belong on `flex/`, one click
away.

## Why an `ext/Panel` and not two divs

A filter rail beside a wall is `flex gap` and needs no panel at all — which was the
first thing tried. **Mike asked for the panel, and it earns itself twice:** the seam
between rail and wall is draggable, so a reader who wants more wall drags for it
instead of asking for a token; and the wall is a real panel, so the whole ext/Panel
toolbar (tone, alignment, divide) is available over a gallery without this page owning
any of it.

**`panel(seed)`, never `workspace()`.** No saver, so a visitor can rearrange the index
freely and a reload restores it. A persisted index is a document one visitor can leave
in a state the next one has to undo, and this page is documentation, not a workspace.
The vocabulary is private — two entries, `filters` and `wall` — which is also what
withholds `random` from the `T` menu (`workspace.js`'s `offer()` only offers it to the
global vocabulary), so the index cannot be rolled into an arrangement nobody asked for.

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
- **A wrapping row hands its slack to the LINES, not the bottom.** `align-content`
  defaults to `stretch`, so a `flex gap wrap flex-1` band taller than its content grows
  every wrapped line: at 400 the rail took its own line and the wall was pushed ~390px
  down it. Both masonry pages declare `alignContent: "start"`; **the other sixteen share
  the idiom and have never been checked at a width where their band runs tall**, which
  is a real thing to look at. It only shows when the band exceeds its content, which is
  why the twin stage's `level()` is where it surfaced.
- **Measure with `offsetHeight`, never `getBoundingClientRect()`, anywhere a card or a
  stage might zoom.** A rect is in viewport space and `ext/demo`'s twin zooms every pane
  it draws, *uncapped* — while a computed length beside it (`grid-auto-rows`,
  `column-gap`) stays in author space. Probed live: at `zoom: 1.8` an item reporting
  `offsetHeight: 57` has `rect.height: 102.59`, and computed lengths come back unzoomed.
  Mixing the two cost `pack()` a note-sized hole under every note in the 400px pane.
  `ext/demo/two.js`'s `level()` already carried this note; it is now in two places.

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
| [`masonry/readme.md`](masonry/readme.md) | the two ragged walls, why one needs JS, and the zoom trap that cost `pack()` a rebuild |

## Open

- **`doc/file/` is orphaned, and was before this pass.** Six `.md` files documenting
  this directory's files, and **nothing reads them**: `page.js` is a plain `Page`, so
  there is no `files:` list and no Files tab, and `doc/file/page.js.md` still says
  *"Became a `Doc` in this pass"* about a conversion that is not in the code. Either
  this index becomes a `Doc` — which fights the panel, since `Doc.render()` owns the
  view — or the tree moves to `notes:`-style breakouts the readme cites. **The four new
  files (`model/`, `masonry/` × 3) deliberately have no `doc/file/` entry**: adding to
  an unreachable tree is not coverage. The two that were touched (`page.js.md`,
  `web.js.md`) are current.
- **Sixteen layouts share `flex gap wrap flex-1` and none has been checked at a width
  where the band runs taller than its content.** `align-content` defaults to `stretch`,
  which grows every wrapped line — the masonry pair declares `start`; the rest do not.
  Cheap to check with `ext/LayoutTool`, and the finding would be one line each.
- **Media queries do not follow `zoom`**, so a layout that responded with a breakpoint
  would preview wrongly on the index. None of them does, which is an accidental but
  real argument for intrinsic techniques.
- **Two pedagogies in one rail.** Ten cards are a phone beside a monitor; `sidebar` and
  `stack` are a quarter-size page. Justified above, and worth revisiting if the mix
  reads as an accident rather than a distinction.
