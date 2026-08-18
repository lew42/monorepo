# Layouts — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Two claims, and the catalog exists to make both falsifiable: **a page layout is a
class string**, and **the utility set is enough**. So the interesting output is not
the layouts, it is the short list of times a rule had to be written. That list is
two lines long: the full-window overlay, and one hairline on the shape previews.

## The shape

```
page.js         the index: `BANDS`, a title, and one call to ext/catalog's
                browse() — which is this wall, factored out (2026-08-17)
model/          the prose that used to be the index — the seven-sentence model,
                the vocabulary table, what the two extremes cost
space/          the same tier as a STRING: a text format, a seed→layout generator,
                and one spec live on five screens at once. The search, not the curriculum
web.js          `site` — one fictional site's content, rendered by ten of the layouts
preview.js      shape() — a frame, empty washed regions, and nothing else
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
content object means the only difference between two pages is where the boxes go, and the
comparison is available at every width on the stage. A page that teaches by writing its
own prose into its layout cannot make that comparison, and six of the eight were teaching
a word rather than a page. (The *card* used to make it too — a 390 phone beside a 3440
monitor. That is the twin, and 2026-08-17 moved it to the stage: it was unreadable at
card size.)

**Why `sidebar` and `stack` came through it.** Neither is a screen: one places the
framework's own `Sidebar` with two utility classes, the other is spacing. Their prose is
their content, which is why they are the two pages here that read at one width — and why
they are still the two weakest cards on the wall (Open, below).

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

**Reopened by the owner, 2026-08-16: a rail is a list, and this tier is a gallery.** A
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

## The wall the owner actually asked for (2026-08-17)

**Question.** *"our styles/layouts/ page's layout SUCKS. it has 1 item in the first row.
3 items in the second… on my 3440 screen, i wanted a masonry layout there — a way to see
ALL THE THINGS."* Plus: the flex and grid words belong on the main page, one card per
*category* rather than per trivial variant, no more mobile+3440 twin cards, and no
scrollbars in a preview.

**The 1-then-3 rows were never CSS.** `previews()` emits **one flat run** — a full-width
heading, that group's cards, the next heading — so a group with one member gets a row
holding exactly one card. `Read this first` held only `model`; `Vocabulary` held three.

**The mechanism moved out the same day.** `/framework/ui/` wanted this exact wall for
its nineteen components, and two walls with their own styles is how they drift — so the
rail, the bands, the search and the grid are `ext/catalog`'s
[`browse(bands, tokens)`](/framework/ext/catalog/api/browse/) now, and `layouts.css`
gave up its two rules to `browse.css`. This page is `BANDS`, an `h1` and one call.
Nothing here changed shape except the title, which came **out** of the rail and sits
above the row, where a page title normally does. Two things browse() learned on the way
that this page had wrong and nobody had measured: the band heading has to sit *outside*
its grid (a `1 / -1` span leaves `auto-fit` nothing to collapse), and the grid wants
`auto-fit` rather than Page.css's `auto-fill`.

**Verdict: one grid PER BAND, and four bands.** A band is its own `.page-previews`, so
only a band's *last* row can be ragged and a short band is a short band rather than a
hole in a wide row. The bands are declared once, in `BANDS` at the top of `page.js` —
order included, and `children:` is derived from it so no name is written twice.

| band | members | why |
|---|---|---|
| Words | 6 | one card per category of class string — **borrowed** from `flex/` and `grid/` |
| Pages | 6 | the whole-page reading layouts |
| Apps | 11 | every application shell — the old `Streams` four merged in |
| Reference | 6 | `model` `fit` `flex` `grid` `space` `400` — things you consult, not copy |

**Cards on the wall: 23 → 29, and the vocabulary 12 → 6.** More cards, deliberately:
The owner asked for the flex and grid items *on* the main page, and the consolidation happens
inside that promotion — `gap` versus no-gap is one row, two columns versus three is one
wall. The six folded-out variants (`row`, `wrap`, `v-center`, `three` × 2, `grid/stack`)
stay one click inside Flex and Grid, whose own nine- and three-card walls are untouched.

**Bands are declared, not derived from `group:`, and that is a reversal.** The 2026-08-16
entry below celebrates the sections being free. They were — until two bands appeared that
`group:` structurally cannot express: **Words is made of grandchildren**, and `space/`
belongs to another effort so its `group:` is not mine to set. A taxonomy that cannot
express two of four bands is not the taxonomy. `group:` stays on the children as their own
metadata; this wall reads `BANDS`.

**Borrowed, never moved.** The Words cards are `flex/`'s and `grid/`'s own children shown
here — so a card keeps its real url and the seven links to `flex/auto/` from
`styles/sections/` keep working. The cost is that `nav_for()` addresses a child at *its*
parent's url, so the owning page has to build the nav; `entry()` is where that happens and
it is the whole reason this wall draws its own cards instead of calling `previews()`.

**Filtering rebuilds the wall.** The old page tagged every card with `data-group` and
`data-find` on the way past, then walked the DOM hiding cards and then hiding headings
left standing over nothing — about 60 lines. Rebuilding from the model instead is ~10, and
it fixed a bug for free: the needle is now the card's own title, description and url
rather than its `textContent`, so `mail` no longer matches Stack and Sidebar (both of
which *contain* the word).

## Verdict reversed: no panel here (2026-08-17)

`panel()` is gone from the index. Three ⚠ comments existed only to fight it, and two
measurements settled it:

- **At 3440 the wall got 1450px of 3440.** A panel body is a grid with
  `justify-items: safe start`, which shrink-wraps what it is handed; the `width: 100%`
  workaround recorded below did not hold once the wall's content was the thing being
  measured. ~2000px of a mega monitor was gutter — the exact opposite of the prime
  objective.
- **At 390 the panel row would not stack.** The rail kept its basis and the wall got
  **155px of a 390 screen.**

The replacement is the row `sidebar/` already documents: `flex gap wrap`, the rail at a
`12em` basis, the wall at `flex: 1 1 22em`. ⚠ **A real basis, never `.flex-1`** — that is
`flex: 1; min-width: 0`, so the wall shrinks for ever instead of wrapping, which is
exactly how the 155px happened a second time before `layouts.css` said the ask out loud.
Dragging a seam is not worth a dependency and a class of traps on a page whose two halves
are a filter and a wall. **`ext/Panel` itself is untouched and still right where it is
used as a workspace.**

## Cards: a whole screen at quarter size, never a twin (2026-08-17)

The owner: *"I'm not 100% the responsive mobile + 3440 previews are the way: they're too hard
to see. I like the dual slider mode, but not for those previews."* He is right by
arithmetic — a twin card is two panes at half a card each, so the 3440 pane renders at
about **0.07×**.

**Verdict: `demo.layout`'s `preview()` ignores `twin:` and draws one `zoom-25` frame at
`56em`.** `twin:` still steers the **stage**, where a two-up has the room it needs. Two
things fell out:

- **`56em`, not the frame's natural height.** A card four times narrower than the layout
  it draws makes `56em` roughly 16:10, so a `fill` shape pins its footer and the wall
  crops nothing. Left to its natural height a card was the top fifth of a 4000px
  document, cut mid-sentence — which is a large part of what read as *unfinished*.
- **`--column: 22em` is a legibility argument, not a taste one.** A thumb is the page at
  `zoom-25`, so the card's width **times four** is the width the layout lays out at. 22em
  lands on ~1450–1800px, a real desktop; a 14em card would have shown all 23 layouts in
  their tablet form.

This also resolves *"Two pedagogies in one rail"* in Open, below: there is now one card
shape for every layout on the wall.

## A preview is a picture, so it has no scrollbar (2026-08-17)

*"the previews render scrollbars at full size (they don't obey zoom)."* `overflow: hidden`
was already on `.page-preview-thumb` — the scroller is the **`.page` inside it**, and a
scrollbar is painted at full size whatever the `zoom` above it, so a quarter-scale render
wore a grey bar four times too wide. **Verdict: `scrollbar-width: none` on the thumb and
everything in it, in `Page.css`** — site-wide, and correct site-wide: a thumb is
`pointer-events: none`, so no reader could ever have used that bar. Measured after: 12
nested scrollers on this index, 0 of them showing a bar; the other five preview walls on
`/framework/` have no thumbs at all, so nothing else moved.

## A fixed thumb height, not a ceiling (2026-08-17, wall-polish)

The Words band was the one place left with genuinely ragged children — `flex gap`
(tall) beside `flex v gap` (short stacked bars) — because `.page-preview-thumb` was
`max-height`, natural height up to 12/14em. **Verdict: `height`, in `Page.css`,
site-wide** — a thumb is a picture, so a fixed size reads the same as any other
image on the wall; the masonry rejection above is untouched by this, since it was
never about the thumb rule. Cost here is small and honest: a schematic shape
(`word.js`'s washed boxes) that ends up shorter than 14em just shows more empty
frame below it, which reads as "an empty region" rather than "broken" — unlike a
live component thumb, which is the harder case `ui/readme.md` records.

## Why an `ext/Panel` and not two divs (superseded 2026-08-17 — see above)

A filter rail beside a wall is `flex gap` and needs no panel at all — which was the
first thing tried. **the owner asked for the panel, and it earns itself twice:** the seam
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

## `web.js` grew real prose, and `repetition` didn't move (2026-08-16)

`sections()`, `rows()` and `notes()` used to draw one shared `blurb` string N
times each. They now draw from `blurbs` (eight short, topic-matched
paragraphs, same length budget as `blurb`) and `stories` (eight longer
paragraphs, ≥205 characters, so `notes()`'s `LENGTHS` cycle — up to 205 — stops
clipping to a 117-character source and actually realizes its own ~5× ragged
ratio). `blurb` itself is untouched: six `page.js` files outside this
directory read that exact field.

**This does not, and structurally cannot, move `ext/DesignTool/taste/`'s
`repetition` band.** `read.js`'s `repetition()` groups siblings by
`probe.js`'s `label(el)` — tag plus first three CSS classes — never by text.
N boxes sharing `div.flex.v.gap` are "repeated" whatever their paragraphs say.
Measured before/after across all 23 layouts × 2 widths: `repetition` is
bit-for-bit identical on every single run (median 0.894, both times) —
`ai/2026-08-16/web-prose-variety/measured.md`. `cards()` and `tiles()` were
left alone: neither ever drew `blurb` (`cards()` shows a number, `tiles()` has
no text at all), so there was nothing there to vary.

## The long form

| | |
|---|---|
| [`twin.md`](twin.md) | the card that is two screens: measured zoom, the auto-height stage, parts as checkboxes, and why `web()`'s prose is short |
| [`previews.md`](previews.md) | `zoom` vs `transform` for a live thumbnail (measured), the card shape, and the overturned per-layout `layout.js` |
| [`full-view.md`](full-view.md) | maximize as a url with a router that only knows path segments |
| [`css-cost.md`](css-cost.md) | which layouts ever needed a rule, and the two gaps (`.basis`, `.measure`) that closed |
| [`masonry/readme.md`](../masonry/readme.md) | the two ragged walls, why one needs JS, and the zoom trap that cost `pack()` a rebuild |

## Open

- ~~**`doc/file/` is orphaned.**~~ Closed 2026-08-17: verified nothing reads it (`page.js`
  is a plain `Page` with no `files:` list, so `Doc`'s Files-tab mechanism never fires for
  it; the only hits were the gitignored, auto-regenerated `directory.json` crawl dumps) and
  deleted the seven stale `.md` files.

- ~~**Two cards are weak, and it is the layout, not the preview.**~~ Closed 2026-08-17:
  `stack` and `sidebar` now draw a designed screen — `site.topbar()`/`site.footer()`
  bracketing the actual demonstration content (the form; the article) — the way `hero` and
  `pricing` do, instead of documentation prose. `.measure` is unchanged and still centres;
  the fix was giving the column something to sit beside, not touching the token.

- ~~**`space/`'s card is the one out of family.**~~ Closed 2026-08-17: removed the custom
  `preview()` override entirely — it now takes the plain `Page.preview()` default every one
  of its five Reference-band neighbours already uses, so it conforms exactly rather than
  needing a taller thumb budget. The stopgap "space last" ordering comment in `BANDS` came
  out with it; the order is unchanged because it still reads fine thematically.

- **The wall is a dense tile grid, not masonry, and that is deliberate.** the owner asked for
  masonry at 3440. After the consolidation every card in a band is the same height, and a
  masonry wall of uniform children is a grid with extra steps (`web.js` says the same
  thing about `notes()`); CSS-columns masonry would also put the band headings *inside* a
  column and break left-to-right reading order. What they asked masonry *for* — see all the
  things, no gutters — is delivered: 6 columns at 3440, the entire 29-card catalog inside
  ~1700px. Revisit if cards ever become genuinely ragged.
- **Sixteen layouts share `flex gap wrap flex-1` and none has been checked at a width
  where the band runs taller than its content.** `align-content` defaults to `stretch`,
  which grows every wrapped line — the masonry pair declares `start`; the rest do not.
  Cheap to check with `ext/DesignTool`, and the finding would be one line each.
- **Media queries do not follow `zoom`**, so a layout that responded with a breakpoint
  would preview wrongly on the index. None of them does, which is an accidental but
  real argument for intrinsic techniques.
- ~~**Two pedagogies in one rail.**~~ Closed 2026-08-17: every layout card is now one
  `zoom-25` frame at `56em`, and the twin lives on the stage.

## 2026-08-18 — the Figma wave: nine designs, and what they taught the tier

Eleven minions worked one Figma file (`July-2026`) against this directory in one night. The record
is [`/framework/ai/2026-08-18/figma/`](/framework/ai/2026-08-18/figma/); the verdicts that belong to
*this tier* are folded in here, as the minion that found the last of them asked.

**Reuse won, repeatedly and by a wide margin.** Of nine designs resolved, **three needed no new code
at all**: `163-613` was `gallery/` verbatim, and four of `181-1456`'s seven screens were `landing/`
(twice), `document/` and `stack/` wearing different content. Wave 1's seven Figma children collapsed
into **two** class strings; `54-1055`'s six frames collapsed into the same two. The standing rule
that came out of it: **demonstrate the class string and link the real layout; add a directory only
for a shape we genuinely cannot already make.**

**`fill` is a claim that a layout fits one screen.** Documented above. `landing`, `document`, `docs`
and `stack` still wear it and are each one longer demo from the same collapse — open, not fixed.

**Two words were added to `framework.css`** (recorded in `styles/doc/decisions.md`): `.tint`, which
was a token with no class and painted nothing silently; and `--grow`, which needed correcting twice
— the first comment was false (1.58, not 2), and the fix then moved the wrap threshold, so weights
must be expressed near 1 rather than as smallest integer pairs.

**Four traps that never throw**, all found by building, all now in skills or the readme:

- `.wash` / `.tint` follow the **page's** colour-scheme, never the band they sit on — a highlight
  where a recess belongs. A band-relative surface is proposed and deliberately not shipped:
  [`figma/surface-proposal.md`](/framework/ai/2026-08-18/figma/surface-proposal.md).
- `--code-bg` and `--code-ink` are a **pair**; taking one renders dark-on-dark.
- `icon:` names are Material **Icons**, not Material **Symbols** — a Symbols-only name renders as
  literal ligature *text* (291px of it, inside a 219px label). Probe `offsetWidth`; a glyph is ~19px.
- Verifying `scrollWidth === clientWidth` proves only that nothing overflows *horizontally*. Assert
  the vertical twin too, and test an odd width — **1440 found what 400/1280/1920/3440 all missed.**

**Still open for the owner:** promoting `400/entry.js` to `layouts/entry.js` (three minions
independently rewrote the same three-liner); whether `ui.table()`'s `width: 100%` can ever stretch
its inner table given framework.css's `display: block`; and whether a `dark`-tone band should invert
a second time on an already-dark page.
