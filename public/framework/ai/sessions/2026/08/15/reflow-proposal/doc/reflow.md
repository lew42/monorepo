# Should a split reflow?

`ext/Panel`'s readme records the limitation as Open: *"A translated layout does
not reflow. A spec row wraps at 390px; a split does not, at any width — so a
`rails` tree at 700px keeps its three columns and the bands inside them squeeze.
Faithful at desktop widths only."* The panel system is becoming a real web
editor, so the question is now a design decision rather than a known gap: below
desktop widths, should a split change its axis, wrap, stack, or hold — and by
what mechanism, given that `dir` is document state, the grip reads its axis from
the DOM, and `ext/editor` has shipped a five-region shell on top of all of it.

## What reflows today, and what doesn't

**The spec side reflows intrinsically — no query anywhere.** `gen.js:12` emits
`flex gap wrap flex-1 scroll` for two of its three body rows; `gen.js:37,43`
give the rails a real basis (`--basis:12–18em`, `11–16em`) and `spec.js:39`
expands `fluid` to `flex: 1 1 24em`. A rails row therefore wraps when
15em + 24em ≈ 624px is not available. `space.css:6-8` records the trap that
forced it: `.flex-1` is `flex: 1 1 0%`, and a `1 1 0` track in a wrapping row
*shrinks* instead of pushing its neighbours down — measured at 80px wide at a
430px screen. Note that one of the three rows carries no `wrap` at all, so a
third of generated rails don't reflow either.

**Panel chrome already responds — by container query, never media query.**
`toolbar.css:109` folds the verb run at `@container panel-bar (max-width: 19em)`;
`templates.css:53-54` picks `wall`'s column count from an unnamed `@container`
resolving to `.panel-body`; `grip.css:79` is the one `@media`, and it asks about
hover, not width. The reason is recorded in `ruler.js:14`: a simulated width is
not a viewport, so `@media` answers the real window and lies inside a stage.

**The split itself is the one thing with no width behaviour at all.**
`panel.css:17,20` size every panel `flex: 1 1 0` with
`flex-grow: var(--panel-grow)`, and direction comes from data alone —
`workspace.js:119,129` writes `.v` onto `.panel-items` from `item.get("dir")`,
`workspace.js:177` rewrites it on repaint. Nothing between a phone and 3440
changes either one.

**Axis is read in four places, from three different sources** — this is the cost
centre for any flip. `grip.js:12` `sideways()` reads the `.v` *class* and drives
four things: which custom property the pill writes (`:28`), which client axis the
drag measures (`:48`), which offset dimension feeds the grow arithmetic (`:49`),
and which arrows the hug/fill menu shows (`:71`). `grip.css:24,47` reads the same
class for the cursor and the pill's dimensions. `PanelDrag.js:39` reads
`item.get("dir")` — the *data* — to decide drop position. `doc/file/grip.css.md:49`
already flags "the axis is encoded twice"; it is encoded three ways.

**One more constraint, reasoned from `panel.css:13,17` (not measured).** `.panel`
cannot become a query container — the readme's measured scar is that hugging
makes it `flex: 0 0 auto` and a contained box in a shrink-to-fit context reports
0. `.panel-workspace` can: its height is explicit and its inline size comes from
`flex: 1 1 0`, never from content. So a query keyed on the **workspace** is cheap
and a query keyed on an **individual split** is not — and a container cannot
query itself anyway, which is precisely what a direction flip on `.panel-items`
would need.

## The candidates

**1 · Container-query direction flip.** `.panel-items` flips to column below a
width. *Mechanism:* needs `.panel` as the container (blocked above), or the
workspace, which flips every nested split at one threshold. *Costs:* a CQ can
change `flex-direction` but cannot add `.v`, so all four axis readers go wrong
at once and silently — wrong cursor, pill on the wrong axis, `offsetWidth` fed
into vertical grow math, drops on the wrong side. Honest repair is `sideways()`
re-pointed at computed style, `PanelDrag.before()` re-pointed at the DOM, and
`grip.css`'s two rules restated inside the query. That trades "the data is the
truth about axis" for "the DOM is the truth" — the persistence model's loss, not
a line count. *Serves:* a reader on a phone; nobody arranging anything.

**2 · Wrap-enabled splits.** `flex-wrap` plus basis floors on `.panel-items`.
*Mechanism:* panels are `flex: 1 1 0`, which `space.css` measured as the thing
that shrinks instead of wrapping — so wrap requires a real basis, i.e. a second
sizing currency beside `grow`, which is the one thing the grip writes.
`generate.js:79` already fixes the exchange rate (one share = 8em), and
`flex: var(--panel-grow) 1 calc(var(--panel-grow) * 8em)` keeps sizes exactly
proportional to `grow` at every width — but it then wraps as soon as
Σ(grow × 8em) exceeds the line, which for a 1.6/8/1.4 rails tree is ~88em ≈
1408px. Desktop breaks. A fixed floor instead (`--panel-hug`, 16em) wraps at a
sane width but stops sizes being exactly grow-proportional. *Costs:* worse than
the arithmetic — a grip between two wrapped lines is no longer a seam between
two panels, so drag-to-resize has no meaning at exactly the widths this was
meant to fix. *Serves:* nobody, once the grip is priced in.

**3 · Responsive `dir` in data.** A split carries per-breakpoint direction.
*Mechanism:* `get()` returns one value, so this needs a width-aware resolver and
a `ResizeObserver` per split; a resize would redraw structure. *Costs:* nested
`data` shape in every saved document; `properties.js:53` shows `dir` as a
two-word picker and would have to grow a breakpoint axis; and it is API surface
forever, which the house rule spends only on things the override lever can't
already reach. *Serves:* an author who wants per-layout control — at the price
of every reader of the format.

**4 · Translator-level choice.** `structure(seed)` emits a different tree per
target width. *Mechanism:* pure — `gen` and `parse` already are, and the spec
side already thinks in screens (`ruler.js:17`, five width/height pairs). Zero new
CSS, zero grip change, zero persistence change if the width is chosen at roll
time. *Costs:* if a workspace picks at *render* time it holds two trees for one
document, and a drag makes the choice unanswerable — the same asymmetry
`doc/generator.md` already records, where the seed stops being the address the
moment the layout is a tree. *Serves:* the translator's fidelity claim, and a
panel analogue of the ruler. Does not make a live workspace respond to anything.

**5 · Do nothing; say so.** *Mechanism:* none. *Costs:* the readme's fidelity
gap stays real, and an embedded demo read on a phone (`Panel/page.js:59`,
`panel(structure(42))` at 26em; `framework/page.js:63`) shows three ~130px
columns — which reads as a prime-objective violation, since every layout on this
site is supposed to work from mobile to mega. *Serves:* `ext/editor`, whose five
regions were arranged by hand and persisted to a second document, and every
other workspace where the arrangement is the user's own work.

**6 · The shell swaps, not the split** *(added — the honest narrow-width
answer)*. Below a threshold the workspace shows one leaf at a time with a strip
to pick between them. *Mechanism:* one named container on `.panel-workspace`
(the one box that can safely be one), and `root.focus` already exists as an
un-saved selection id (`workspace.js:74-86`). The tree, the data and the grips
are untouched — hidden panels simply have no seams. *Costs:* a tab strip is new
chrome, and new chrome is a proposal under the five-blocks rule. *Serves:* a
phone reader, without a single lie about what a split is. This is also what
every desktop editor with a mobile mode actually does.

## Recommendation

**A split holds its axis at every width. Record it as a decision, not a
limitation — and move the two real complaints to the mechanisms that already own
them.**

The reasoning is that `dir` is the *user's* answer, not the viewport's. A
workspace is a document somebody arranged and saved; a shell that restacks
itself at 700px moves the canvas under the hands of the person who put it there,
and `ext/editor` is a shipped consumer of exactly that promise. Every candidate
that makes the split respond also makes the DOM, not the data, the truth about
axis (1), or adds a second sizing currency that empties the grip of meaning (2),
or buys per-breakpoint fidelity with permanent API surface (3). None of the
three is worth what a split *is*.

The two complaints that are real do not need the split to change:

- **The embedded demo at phone width** is a picture of a desktop tool, and this
  site already has exactly one sanctioned way to show a layout at a width that
  isn't the reader's — `ext/demo`'s stage and `simulate()`, which is how
  `ruler.js` fits a 1280px layout into a 300px column. Scale it; don't reflow it.
  No new mechanism, and it stays inside the five blocks.
- **The translator's fidelity claim** belongs to the translator. If phone-width
  translation ever matters, `structure(seed, width)` (candidate 4) is pure,
  contained, and costs `Panel` nothing — chosen at roll time, so the tree stays
  the single address.

**Weight.** Firm on the live workspace: this is a decision with a shipped
consumer depending on it, and the readme's Open bullet should graduate to the
Decisions list with the reasoning above. Medium on the demo/scale fix — it is
the obvious reuse, but nobody has measured a scaled panel workspace yet.
Low, deferred, on `structure(seed, width)` and on candidate 6: both are good
designs with no current demand, and candidate 6 is the one to build if narrow
ever has to be *interactive* — never the direction flip, which breaks the grip's
arithmetic silently, and never wrap, which breaks what a seam means.

## Open questions for Mike

- Does "every layout works from mobile to mega" bind the panel *workspace*, or
  only what a workspace *contains*? The whole recommendation turns on chrome
  being exempt.
- Is a scaled (zoomed) panel demo acceptable on a phone, or does an embedded
  workspace below some width want to be a static picture instead?
- Is `structure(seed, width)` worth building now, or does the fidelity note just
  gain "above ~1000px" and wait for someone to want it?
- If narrow ever has to be interactive, is candidate 6 (one leaf at a time,
  keyed off `root.focus`) worth a tab strip — i.e. is that a sixth block, or an
  extension of the existing bar?
- The axis is encoded three ways today (`.v` class, `grip.css` selector,
  `item.get("dir")`). Worth collapsing to one reader on its own merits, even if
  nothing here ships?
