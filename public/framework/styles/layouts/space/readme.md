# Layout space — design record

Sixteen `layout()` functions in this directory are the **same tree**: a nest of
class strings whose leaves call parts of one shared `site` object (`web.js`).
Nothing else differs between two of them. So a layout is not code — it is a
**string** — and every point in the space currently costs a directory, a
`page.js`, a nav slot and a readme paragraph.

That is what this page is against. Eight files, plus a reference sheet:

```
spec.js     text → live view. Indentation is nesting; a line is `<tokens> > <part>`
model.js    WHAT A PAGE IS MADE OF, as weights: shapes, roles, what nests in what
draw.js     the chaos dial, and the only place it exists
gen.js      (seed, opts) → text. An integer is an ADDRESS, so a point is a link
search.js   roll N, rate each at three widths, report what the good ones shared
presets.js  nine named starting points; every name here is a directory in the rail
ruler.js    one spec at five SCREENS at once — one ROW, one SCALE
page.js     the lab: controls above, ruler below, the spec in the url hash
hunt/       the search, as a page — and where the model gets better
words/      every word the format accepts, each one live. doc/syntax.md is the grammar
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

## The ruler is one row at one scale (2026-08-16)

It shipped as a **sidebar**: a text panel at `flex: 1 1 22em` beside the shots at
`flex: 1 1 26em`, which at any real width stacked the five screens two-up inside a
`max-height: 82vh` scroller. So the curve — the whole reason the thing exists — had
to be scrolled through, and no two shots could be compared without moving.

**Verdict (Mike, 2026-08-16): controls above, five in one row, one scale.** Each
shot's width is written by `ruler.js` as its own screen's share of the room, so the
zoom is identical across all five and a card 200px wide on the 1280 screen is 200px
wide on the 3440 one. Per-shot fitting is what made them incomparable — five
different zooms, nothing lining up.

The cost is honest and worth recording: **7,750px of screen has to fit the room**,
so the scale is what the room allows — 37% at 3440, 19% at 1920, 12% at 1280. The
390 shot is 145px wide at 3440 and 45px at 1280. That is a wide-screen instrument,
which is the correct shape for a page arguing that layouts should use a wide screen.
Below a 10% floor the row scrolls sideways instead of shrinking further, because
five screens inside 400px of phone is five smudges.

Two small things fell out of it. The size caption is wider than the shot it labels
at the small end (`390 × 844` needs ~96px), so under that it drops to the width
alone and the pair moves to the `title`. And `.space-out`'s scroller went with the
sidebar — nothing scrolls now except the row, below the floor.

## A grammar, not a flat pick (2026-08-16, Mike)

**The generator drew a part uniformly from a flat list of eight, and that is why
nothing it rolled could be scored.** A `footer` could land in a rail; a `topbar`
could land three levels down inside a card. That is not a wilder layout, it is a
wrong one — and a search cannot learn anything from a space where most points are
category errors rather than bad arrangements. Mike's phrasing: *we don't
necessarily want to randomly select traditional sections for the wrong area.*

`model.js` replaces the list with three tables, and the split between them is the
design:

- **SHAPES** — the body of a page, as nine weighted arrangements. They are the
  nine `presets.js` spends a directory each on, and that is the argument for the
  list: they are what this rail is actually built from.
- **ROLES** — role → the parts that belong in it, weighted. `masthead` is
  `topbar 6 · toolbar 3 · brand 1`; a rail is `menu 6 · toc 2`. A part with no
  weight in a role is not forbidden, it is **off-model** — which is exactly what
  the chaos dial reaches.
- **INNER** — *what is best inside what*. When a track is deep enough to split,
  its children come from here: a `main` splits into prose and walls, a wall into
  more walls, and **a rail never splits at all** — it is not in the table, and
  `gen.js` treats any fixed-measure role as a leaf, because a nav rail that
  divides is two nav rails.

Two things fell out of it that are worth keeping in mind. **A claim is a fact
about the parent's axis, not about the role**: in a column nothing claims a share,
because `fluid` there is a 24em *height* basis and every band stretches to the
same size. And **a measure follows the PART, not the role** — `sections` is prose
wherever it lands, and without that a `main` track holding it measured 117
characters a line at 1920, from a generator whose own rulebook asks for 68.

## Chaos: one dial, and it is a distance (2026-08-16, Mike)

`gen(seed, { depth, chaos })`. At **0** the generator draws strictly from
`model.js` — the shapes as weighted, a part only in a role it belongs to, every
size inside the band the rulebook asks for. At **1** it is uniform over
everything the format can say, which is where this generator was before it had a
model at all. So the old behaviour is not gone, it is the right-hand end of a
dial.

The blend is **linear** — `p = (1−c)·w + c/n` — and that is deliberate. It is the
one curve a reader can predict from the number: at 0.5 an off-model part has
exactly half a uniform chance. A temperature (`w^(1/T)`) is the textbook answer
and reaches uniform only asymptotically, so a dial marked "1" would not be
uniform, which makes the label a lie.

⚠ The blend is over the **full vocabulary**, not over the weighted keys. Blending
toward uniform over the model's own options can never reach an off-model one, so
chaos would only reshuffle preferences — it has to be able to put a footer where
a footer does not go, or the dial means nothing.

Size bands widen the same way: four times as wide at chaos 1, around their own
middle, so the shapes stay recognisable while the numbers stop being tasteful.

## The tones are the site's, not invented (2026-08-16, Mike)

`--tone` was a random `oklch` hue, which meant every roll invented colours the
site does not own and a retheme moved none of them. It is a **token reference**
now — `var(--ink)`, `var(--subtle)`, `var(--prim)` — mixed at 9% by `spec.js`'s
`tone` word.

The mix is what keeps the old property that made the dial work: two boxes deep
still composites visibly darker than one, so nesting is still readable at a
glance, and `--tone` still inherits, so a subtree deepens **one** colour rather
than becoming a rainbow. And it needs no light/dark branch either — `--ink` is
`light-dark()`, so the stack lightens in dark mode and darkens in light, which is
the theme ladder's own rule.

⚠ It still cannot be `wash`/`tint`/`surface`. Those three are opaque by decision,
so nesting them cannot composite and ten levels look like one. That constraint is
unchanged; only the hue source moved.

## The loop — how the generator gets better (2026-08-16)

The ask was *how do we create a self-improving system?* This is the answer, and
it is four pieces that already existed pointing at each other:

1. **A rulebook with two sides.** `ext/LayoutTool/taste/ranges.js` holds eleven
   ideal ranges *and* an `AUTHOR` table — the same numbers from the writing end.
   `gen.js` samples `AUTHOR`; `taste.rate()` grades against `RANGES`.
2. **A score that can rank two good layouts.** `analyze()` cannot: it reports
   what is broken, and two clean rolls both score 100. Ranking clean layouts is
   the whole requirement.
3. **A search.** `search.js` rolls N seeds, rates each at 390 / 1280 / 3440, and
   ranks by its **worst** width — because a layout that is an A at 1280 and an F
   on a phone is not a B layout.
4. **Credit assignment.** `roll()` returns the *choices* it made alongside the
   text, so `credit()` can group every draw by the mean fitness of the layouts
   that took it. Those numbers are what `model.js`'s weights are a claim about,
   and where a weight and its column disagree, **the column is the evidence.**

`hunt/` is that as a page: run it, read the two tables, and the second one is a
proposed weight column you can paste. The improvement is not automatic and
should not be — a weight is a design decision with evidence attached, which is
the same standard the rulebook itself is held to.

### What the first run said (8 sweeps × 120 seeds × 3 widths)

Data: `ai/2026-08-16/layout-generator-rules/hunt.md`.

- **Chaos hurts, monotonically, and the damage accelerates.** Mean worst at
  depth 2: **60.5** at chaos 0, 59.0 at 0.25, 56.2 at 0.5, **51.0** at 1.0 — a
  16% drop at full uniform. That is the number the whole grammar was for: the
  model is measurably better than the flat pick it replaced. It also means the
  chaos slider is a real quality trade and not just "more variety", and the
  default belongs near the left.
- **The best single layout came from chaos 0.25, not from chaos 0.** Best `worst`
  anywhere was 81; no chaos-0 sweep beat 80. Chaos widens the tail in **both**
  directions — most perturbed rolls are worse, and the occasional one beats
  anything the strict model can draw. Which is the argument for the dial existing
  rather than for the model being loosened.
- **Depth is nearly flat.** 1–4 span 2.4 points, best at 2. Depth 0 has the
  lowest mean and the highest median — a single-leaf layout is either fine or
  fails hard on one range, and the mean hides that.
- **`fit` is a null result.** `screen` 1.001, `page` 0.998, n=296/184. Recorded
  because a null result is worth as much as a positive one: the fixed/flowing
  choice changes what a layout *is for*, and not how well it scores.

⚠ **And then the first run's shape table was thrown out**, because three bugs in
the rating tier were fixed *after* it started — two of them in exactly the ranges
it named as the discriminating ones. `gallery` and `deck` are the two
text-poorest shapes in the model and they were the bottom two; `width-used` was
measured over text blocks only, so a wall of sixteen image tiles reported
spending 11% of a 3440 screen while filling it. **A search is only as good as the
scorer it searches against, and the first thing a search finds is the scorer's
bugs.**

### Run two, against the corrected ranges — and the weights it wrote

The clean measurement of the fixes: **seed 85 scored `worst 63` under the old
ranges and `worst 87` under the corrected ones** — same generator, same seed, a
24-point swing at 3440 that was entirely the scorer.

- **Chaos still hurts, by two thirds as much.** 65.5 → 63.6 → 59.4 at chaos
  0 / 0.25 / 1.0, so the penalty went from −16% to **−9.3%**. About a third of
  what run one called the cost of chaos was the bugs punishing a wilder draw.
  The remaining ~9% is real, and it is the model's whole justification.
- **The shape order reshuffled.** `shell` went from mid-table to first (lift
  1.14) and `mail` — run one's winner — fell to a four-way tie for third.
  `gallery` and `deck` recovered by 8–10 points and are **still the bottom two**,
  so their penalty was real but overstated. Run one's "raise `mail`" did not
  survive, which is the entire argument for never retuning off one run.
- **`SHAPES` now carries those numbers**, each old weight scaled by lift cubed —
  cubed so one run moves a weight without replacing it.
- **`measure` woke up** (gap 0.05 → 0.16, on a healthy sample rather than a thin
  one) and **`width-used` went silent** (0.26 → **0.00**). That second one is the
  honest cost of a fix: this generator now clears 70% width-use so reliably that
  the range cannot tell a good roll from a bad one. It keeps its weight anyway,
  because the nine hand-written presets fail it hard at 3440 — a range can be
  saturated for one population and the sharpest thing you own for another.
- **Five ranges carry no information here at all** — `slivers`, `depth`,
  `repetition`, `scale`, `gap-share`. That is a *result*, not a gap: the model
  already keeps every roll clear of the zones those exist to catch. They are
  what would start firing the moment someone loosened it, which is exactly what
  the chaos dial does.

### What the loop actually changed, in order

The four edits the search paid for, each with its number. Two are in the
generator and two are in the rulebook — which is the shape of the thing: a
search that only ever improves the generator is not measuring, it is fitting.

1. **`--pad` inherits, and the band inset was cascading onto the cards.** A
   3em inset on a wide track is 3em on the 300px card inside it too — a card the
   rulebook expects ten pixels on. Every leaf reclaims a card's pad now.
   Measured, 14 seeds at chaos 0: **mean worst 56 → 66, median 54 → 68, best
   65 → 75.** The largest single win of the session, and it was one word.
2. **`pad-share` and `frame-gap` were in direct conflict**, and only the presets
   showed it. Fixed by measuring against the site's own `min(3.5%, 3.5em)`
   rather than a raw share — see the rulebook entry, which carries the argument.
3. **`SHAPES` carries measured weights** (run two, lift cubed).
4. **The depth dial could not reach its own top.** `DEPTHS` stops at 5 and the
   slider goes to 10, so on the model alone the right half of the dial drew
   nothing new. Chaos reaches it now — `c` of the time the depth draw is uniform
   over the whole range, which is the promise the dial makes everywhere else.

### Run three — where it ended up

Same harness, same 120 seeds, after the four edits above:

| | chaos 0 | chaos 0.25 | chaos 1 |
|---|---|---|---|
| run 2 (corrected ranges) | 65.5 | 63.6 | 59.4 |
| **run 3 (after the fixes)** | **73.8** | 72.6 | 65.9 |

- **The padding fix was worth +8.3 points of mean fitness**, on the same scorer,
  which is the cleanest before/after in the whole exercise.
- **Chaos still hurts, and the sign is settled at n=120**: −10.7% from 0 to 1,
  monotonic. The 12-seed hand check had the right sign and could not have shown
  the shape — which is the argument for having a harness rather than an opinion.
- **The best layout in the grid scores 86 at 390, 86 at 1280 and 86 at 3440.**
  Every earlier ceiling had one width dragging it down. A flat curve is what the
  prime objective actually asks for, and it took a search to find one.
- **The shape table went flat** — lift now spans 0.98–1.12 where it spanned
  0.90–1.14, and the nominal leader's sample fell to n=6, under the believability
  floor. **So `SHAPES` was left alone this round.** A table that flat is noise,
  and fitting it again would be fitting noise. That is the loop declining to run,
  which is a thing a loop has to be able to do.

### Three ranges went quiet the moment their own bug was fixed

`width-used`, `lanes` and now `frame-gap` each looked like a strong
discriminator, and each collapsed to a ~0.0 top-vs-bottom gap as soon as the
defect in it was corrected. That is not three coincidences — it is one lesson:

**A broken range discriminates beautifully, because it is measuring its own
defect.** `width-used` separated layouts by how much *text* they happened to
contain; `frame-gap` separated them by how many undecorated swatches they drew.
Both were real, repeatable signals. Neither was about the layout.

So a range's apparent power is not evidence that it is right — and the ranking
it produces is the first thing to distrust when it is suspiciously clean. The
cure was the same each time: point it at work someone actually made (the nine
presets, this tool's own doc page) and find the case where two honest numbers
disagree.

### The price of a self-improving generator: an address is version-scoped

⚠ **Retuning a weight re-addresses the whole space.** A seed still replays
exactly — same browser, any browser, forever — but only against the model that
drew it. Measured immediately: seed 85 was the best roll in a 600-roll search at
`shell`, and the very weight fit that search produced moved it to `rail` and a
17-point lower score. The two claims "an integer is an address" and "the model
gets better" cannot both be unconditional.

The resolution is already in the page and needs no new machinery: **the URL hash
carries the TEXT, not the seed.** A spec you keep survives every retune; a seed
is a citation inside one version of the model. The seed wall and the stepper are
a way to *search*, and the hash is the way to *keep*. Worth saying out loud
before someone bookmarks a seed and finds it has moved.

**The rulebook was already refit this way once**, before the search existed:
36 pages measured, and six of eleven bands moved. `repetition` was written at
0.30–0.75 from intuition and this site measures 0.23. `pad-share` turned out to
be the tightest quantity there is — median 0.037, unchanged from 1280 to 3440 —
and gained weight. `frame-gap` turned out **bimodal** and lost it. The lesson is
the transferable part: **a weight is evidence, not opinion, and a diffuse
quantity earns less influence than a tight one.** Data:
`ai/2026-08-16/layout-generator-rules/calibration.md`.

## What the rulebook says about the nine hand-written presets (2026-08-16)

The first thing worth pointing a new instrument at is the work it is meant to
judge. Every preset, rated at 390 / 1280 / 3440, ranked by its **worst**:

| | 390 | 1280 | 3440 | worst |
|---|---|---|---|---|
| landing | C 79 | B 83 | C 75 | **75** |
| dashboard | B 86 | C 73 | D 67 | 67 |
| document | C 79 | D 69 | D 62 | 62 |
| masonry | C 73 | C 71 | D 62 | 62 |
| docs | C 77 | C 76 | D 61 | 61 |
| gallery | B 81 | C 70 | F 50 | 50 |
| mail | F 49 | **B 87** | D 69 | 49 |
| shell | F 47 | C 71 | D 60 | 47 |
| split | F 46 | C 72 | D 66 | 46 |

Three readings, and none of them is about the generator:

- **The app shells fail on a phone.** `split`, `shell` and `mail` are the three
  with a fixed rail *and* a fixed list track, and at 390 there is nothing left
  for the third. `mail` is the sharpest case on the site: **B 87 at 1280 and
  F 49 at 390**, which is exactly why fitness is the worst width and not the mean.
- **`--measure: 52em` is the single most common complaint at 3440**, at zero
  credit on five of the nine. Montserrat runs ~2 characters an em here, so 52em
  is ~117 characters a line — `knowledge/characters-per-line.md` already said so,
  and this is the same finding arriving with a score attached. `AUTHOR.measure`
  in the rulebook writes 27–34em for that reason, and deliberately disagrees with
  the token.
- **Padding in `em` does not scale to 3440.** `pad-share` is at or near zero on
  every preset at 3440 — a 1em inset on a 1200px band is 1.3% where the site's own
  measured consensus is 3.7%. The generator's answer is a second `--pad` on wide
  tracks; the site's would be the `clamp(0.75em, 3.5%, 3.5em)` pattern it already
  uses in places.

⚠ **`repetition` reads ~0.95 on everything in this rail, and that is a fact about
`web.js`, not about the layouts.** The fictional site is made *entirely* of
repeated components — `sections`, `cards`, `rows`, `tiles` and `notes` all draw N
identical children, and `hero` is the only part with unique prose. Real pages on
this site measure 0.23. So the band is right and the corpus cannot reach it; a
layout here is capped at about 96 by that one range alone. Fixing it means giving
`web.js` a paragraph nobody repeats, which is a change to the shared content
object and belongs to whoever owns that.

## One generator, and ext/Panel needed no edit (2026-08-16)

`compose/` is the same roll as real panels, and the `space_dashboard` button on
every bar rerolls one section. Both now go through the **same** model, chaos and
fit — and not one line of `ext/Panel` changed, which mattered because another
session owns that module.

The seam is one line of signature: **`gen(seed, opts)` accepts a number or an
options object**, and `structure(seed, depth)` / `sow(item, seed, depth)` pass
their second argument through untouched. So `compose/` hands `structure()` an
object, `tree.depth` carries it, and every per-section reroll inherits the dials.
`gen.js` states that compatibility as a promise, because it is one now.

`fit` is the other half of Mike's question — *for a fixed size area, should it
generate fixed-size layouts, or long scrolling content?* **Both, as a control.**
`fit: "screen"` doubles the weight of the row shapes and `"page"` doubles the
column ones: a column of bands inside a box with a definite height is a stack of
slivers, and on a scrolling page it is what a document is made of. Doubled rather
than excluded, so a rail on a scrolling page is still reachable. `compose/`
defaults to `screen` because a panel is a fixed area; the lab lets the roll
decide.

## Depth replaced the detail dial (2026-08-16, Mike)

`gen(seed, depth)`, where **depth is a max nesting depth 0–10 and every top-level
section draws its own depth from 0 to it** — so one dial gives a page of flat bands,
a page of deep nests, or the uneven mix most real pages are. The generator became
*recursive*; it was a fixed skeleton before.

**Mike asked whether this generates every permutation, and whether many would look
broken. No, and yes.** The old generator was a hand-written skeleton with two
families and about ten draws inside a fixed shape — roughly 3k reachable strings but
only **two structural skeletons**, which is why nothing it rolled ever looked broken.
It was a sampler of a curated region, not an enumerator.

Depth makes it a **search over a mostly-invalid space**, and the invalidity is
specific: this format's silent words are *position-sensitive*, and nesting multiplies
exactly them. `scroll` a level too deep never engages, `stick` on a stretched rail
does nothing, `fluid` inverts against `flex-1` inside a wrapping row. Past about
depth 4 most rolls are slivers.

**Verdict: ship it raw** (Mike). No score, no guard rails — broken rolls are the
honest output of a search, and the wall is where you see what the space actually is.
`ext/LayoutTool` scoring stays phase 2, where it already was.

Two things that are *not* guard rails and are in anyway. `CAP` (80 boxes) exists
because a fresh depth per child can branch faster than it shrinks, and five shots
plus twelve tiles render at once. And a fixed `--basis` claim is emitted only on a
**leaf** — see the compose section below, where a fixed *container* was measured
collapsing its children to 20px.

## Blocks are translucent, and the stacking is the point (2026-08-16, Mike)

A depth dial needs depth to be *visible*, and an opaque ground makes ten levels look
like one. `tone` is a fourth spec word: `oklch(0.72 0.15 var(--tone, 250) / 0.12)`.
Two boxes deep composites darker than one.

**It cannot be `wash`, and that is a real constraint rather than a preference.** This
theme's three-step ladder is **opaque by decision** — `styles/layers/theme/lew42/lew42.css`
records that `.app` paints itself `--wash`, and a translucent value there composited
over the browser's own white and rendered pale in dark mode. So the stacking ground is
this format's own word and the site's ladder is untouched.

`--tone` is a **hue**, and it inherits: a section declares one and its whole subtree
deepens that colour, which is what makes it a scheme rather than a rainbow. Alpha
rather than a `light-dark()` pair, so it needs no mode branch — 12% of any hue reads
over a white page and a near-black one alike.

## `compose/` — the same roll as real panels (2026-08-16, Mike)

**Almost none of this was new code, and that was the finding.** `ext/Panel` already
held both directions of the seam: `structure(seed)` translates a spec into a detached
`Panel` tree, `sow(item, seed)` makes a panel *become* a rolled layout, and the roll
is a `space_dashboard` button on **every** bar, split or leaf. Rerolling one section
independently already worked. The delta was threading `depth` through it and giving it
a page.

`depth` rides the **root panel** (`root.depth`), never `data` — it is a roll
parameter, not a property of any panel, and the tree is its own address the moment it
exists. Same instance-state rule as `templates` and `focus`.

Three things it cost, all measured:

- **A `fill` page has nothing to fill inside a Doc tab.** `.page.fill` is
  `min-height: 100%`, which needs a parent with a definite height, and `.doc-page` is
  a wrapping flex box in a scrolling region. The page measured 0 and rendered blank
  with fourteen panels in the DOM. The stage declares its own height instead, the way
  `ext/demo`'s does.
- **`--panel-height: 100%` was the same bug one level down.** A percentage height
  resolves against the parent's *computed* height, which is `auto` for a `flex-1` box.
  `auto` plus the `flex: 1 1 0` `panel.css` already gives lets a flex parent stretch
  it, and needs no definite height anywhere.
- **A fixed `--basis` container collapses its children.** `share()` translates
  `--basis` to a *fraction* of the row where on a real page it is a *minimum*, so a
  fixed-measure box that then splits hands its children a fraction of an already-small
  share. Measured at 3440: columns down to ~20px with headings laddering one letter
  per line, `ext/LayoutTool` **F 8**. Emitting a fixed claim only on leaves took the
  same page to **D 64** and the narrowest panel from 20px to 410px.

`compose/` defaults to **depth 1** where the lab defaults to 3, because a panel holds
a real band and a band does not reflow. The slider still reaches 10; the page just
does not open on a broken one. It scores in the same band as `/framework/ext/Panel/`
itself at every width, which is the right comparison — a workspace full of real bands
is a hard thing for the analyzer, and that is not this page's to fix.

## The detail dial was a guarantee, not a cap (2026-08-16, superseded)

**Kept because the lesson outlived the control.** `gen(seed, detail)` had five steps
built as a **cap** — `detail` bounded a randomly drawn region count — and on seed 7
step 4 had nothing to allow: the dial moved and the layout did not. **A control that
sometimes does nothing reads as broken**, so each step became something the generator
was *guaranteed* to add.

The depth dial above replaced it the same day, and it deliberately does **not**
inherit that property: a fresh random depth per section means a step cannot elaborate
the same layout, it rolls a different one. That is the trade Mike asked for, and it
is worth knowing it was made knowingly — the "unconditional draw, gate only what is
printed" trick that made the old dial feel like a dial does not apply here, because
depth changes the tree wholesale rather than revealing more of one.

## Three things that will bite you

- **⚠ A BACKGROUND TAB NEVER FITS.** `ruler.js`'s `watch()` is a ResizeObserver,
  and observer delivery rides the browser's rendering steps — which a hidden tab
  does not run. A ruler rendered while the tab is in the background keeps all
  five shots at max-content (4184px each at 3440, *identical*) and its scale
  caption stays empty until someone looks at the tab. This is not a bug in the
  ruler and there is nothing to fix; it is a trap for whoever measures it. An
  agent driving this page through `Server/plugins/MCP.js`'s `eval` is **always**
  in a hidden tab, and it cost half an hour of chasing a layout bug that was a
  measurement bug. Check `document.visibilityState` before believing a geometry
  read; use `mcp__site__shot` or headless Playwright for real numbers.
- **A screen is a width AND a height.** The ruler shipped as widths alone and the
  390 shot rendered **2839px tall**, swamping the other four: with no height a
  `fill` page has nothing to divide and its `scroll` regions never engage. The
  list is pairs for that reason, and a shot's `.page` takes the height directly,
  the way `demo.layout`'s `frame()` does.
- **`render()` marks its root `default`.** `Page.css` hides any `.page` the
  Router did not mark, and nothing throws — the same trap `demo.layout` documents.

## What the analyzer said, after the one-row pass (2026-08-16)

`ext/LayoutTool` on the Overview: **C 76 at 1280, 1920 and 3440, zero high
findings** — against C 79 / C 71 / **D 68** for the sidebar version below. The 3440
column is the one that moved, and flat-across-widths is the right shape for an
instrument whose whole subject is width. `words/` reads **B 82 / C 77 / C 79**, also
with no highs.

One finding was real and was mine: `words/` first marked the whole card wall
`data-layout-ignore`, which hides the cards' own text as well as the miniatures — so
the tool read each wall as a single **625px gap** and fired `rhythm: high`. The
marker belongs on the **miniature**, never on the wall around it. The seed tiles on
the Overview are the exception that proves it: a tile is *only* a miniature, so
there the wall is the right place.

Everything left is the pre-existing set below, plus one that is `ext/doc`'s: every
Doc tab carries two `h1`s (`well()`'s and the routed page's), so `hierarchy` fires on
every Doc on the site. Reproduced on `/framework/ext/doc/` itself and recorded in
that module's Open list.

## What the analyzer said (the sidebar version)

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
- The generator still covers **two families** (rails, bands). Overlays and the
  nested-column shapes are not in its range, so parts of the rail cannot be reached
  from an integer — `presets.js` reaches them by hand instead, and the nine names
  there are the list of what a third family would have to generate. `shell` is the
  interesting one: a column *inside* a rail is the shape `gen()` has no move for.
- **`packed` is the one utility `words/` cannot show.** It needs the measuring pass
  in `styles/layouts/masonry/masonry.js`, and nothing in the spec format runs JS —
  so the format reaches `masonry` and stops. Either the renderer learns to call the
  packer for that one word, or the word stays out of the vocabulary; it is currently
  neither, which is the honest gap.
