# Decisions — what was settled here, what was measured, and what is still the owner's call

Built 2026-09-17 in one task, `ai/2026-09-17/layout-browser/`, from the owner's sentence:
*"we need a layout browser… I kind of think we need an approve or improve for the layout
system."*

## Settled

**Three tiers, not one list.** The owner said it directly: *"the global layouts need to be
different from the smaller templates, like mobile card UI, just from the actual layout of
those pages in terms of what goes where."* So Global is the shape of a whole page, Sections is
a band inside one, and Components is the pieces a band is made of. Every item lands in exactly
one, and the tier strip counts each tier's verdicts separately — because "have I finished the
global layouts?" is the question a reviewer actually asks.

**A card is a picture, never a live instance.** Ninety-nine live pages on one wall is
ninety-nine module loads and a wall that takes a minute to settle, and it would also make the
browser's own layout depend on ninety-nine other layouts not breaking. Twelve cards draw a
wireframe live from `layouts.json` (the layout standard already owns that drawing and it costs
nothing); the rest are jpegs taken once.

**The inventory is data, built from the realms' own manifests.** `items.json` was assembled by
reading nine `children:` lines, one `APPROVED` array, one `BANDS` object and `layouts.json` —
so the browser agrees with each realm by construction rather than by somebody keeping a second
list in step. The realms themselves were not touched. [`inventory.md`](/layouts/browse/doc/inventory/)

**Verdicts are append-only, over the same seam `/imagine/importance/` uses.** One line per
press to `/layouts/verdicts.jsonl` through the dev server's `rpc:append`. There is no edit and
no delete: a verdict you want to change is answered by a *later* verdict on the same item, the
newest one is the mark, and the whole history is one click down. That keeps the file a record
of what the owner thought over time, which is the thing worth having.

**The writer does not apply its own line.** The appended line comes back off the dev socket
like anybody else's, so there is exactly one code path and the server is the only orderer —
the rule `/imagine/stream/` learned the expensive way. `verdicts.js`'s `expect()` is the
safety net: if no frame carrying the line has arrived in two seconds it applies the row
locally and warns, because a press that visibly did nothing is the worst failure this page
could have.

**Off the dev server the buttons are not drawn at all.** A static host has nothing to append
with. A control that cannot work is worse than no control, so the row is replaced by one
sentence saying where the buttons are. Reading is a plain fetch and works anywhere.

**The owner is the only writer.** Approve and Improve were driven headless once, for real, to
prove the whole path — press, append, the line back off the socket, the verdict rendered, the
mark on the wall, the tier count. The file was then truncated back to zero bytes.

## Measured

Read back at 400 / 1280 / 1920 / 3440 on 2026-09-17. 99 cards, 3 walls, **1 / 3 / 5 / 8 grid
columns**, no horizontal overflow, nothing at x:0, no broken image, no console error.

**The wall was auto-FILL, not the framework's `.grid.auto`.** *(Superseded 2026-09-18, see
below — the hand-rolled wall this described is gone.)* `.grid.auto` is auto-*fit*, which
collapses the tracks nobody is standing in and stretches the survivors — so the last row of a
45-card wall would draw five cards a thousand pixels wide at 3440. A wall of pictures wants
every card the same size always, so `.std-browse-wall` declared its own tracks at
`--column: 20em`.

**The item page's body is the reading track, not `wide`.** It was `wide` first, and `wide`
removes the reading cap from everything inside it: a one-line `<summary>` became a 1,766px
grey bar at 1920 and a paragraph ran 3,260px at 3440. Only the three pictures want the whole
screen. (This is the same trap `.std-body` exists to answer in `layouts.css` — but `.std-body`
caps its *direct children*, and the box in question was a grandchild.)

**A sticky bar paints `--wash`, the page's own background — not `--surface`.** White over a
grey page made the tier strip a bright empty band across the wall, which is exactly the
"random blank space" the owner opened this whole effort with.

**The tier line takes its own measure back.** It sits in the `wide` box beside the walls, so
without `.std-browse-say`'s `max-width: var(--measure)` one sentence ran 3,260px at 3440.

## The critic's pass, 2026-09-17

A second agent pressed every control at 400 / 1280 / 1920 / 3440 against the owner's own
sentences and found fifteen things. Thirteen were fixed; the two that were not are at the
bottom of this section, with their measurements. The whole run is in
`framework/ai/2026-09-17/browser-critic/task.jsonl`.

**A card now pictures the thing, not the page the thing is documented on.** All thirty
Components cards were screenshots of a documentation page — the same left nav, the same
topbar, the same "Variants" heading and the same dark code block in the same place on every
one — and ten of the Sections cards were screenshots of the paging editor with the template a
small white box in the middle of it. 126 jpegs were re-shot as a 16/9 frame grown around each
page's own demo region. A Card card shows a card now. `doc/inventory.md` has the recipe.

**`--a` is read off the picture, never assumed from the viewport.** An item page declares each
picture's aspect ratio so the row can lay out before a single jpeg arrives, and that number
used to be the viewport the shot was taken at. That held only while every jpeg was a whole
screen: the moment 42 items became crops, 72 of the 246 pictures were more than 2% off and
`object-fit: cover` threw the difference away. Every shot's real pixel size is now in
`items.json` under `sizes`, and the page reads it.

**`scroll-margin-top` is in `rem`, not `em`.** Pressing a tier chip scrolled that tier's
heading to y:0 — underneath the sticky bar the reader had just pressed, 0px of it visible at
all four widths. The head box now carries a scroll margin; it has to be `rem` because the body
font on this site is a viewport clamp, so an `em` margin shrinks to 84px exactly where the bar
is tallest (85px at 400).

**The verdict is the one box on the item page.** Approve, Improve and "Open the real page" all
computed to `rgba(0,0,0,0.08)` on `rgb(63,63,63)` at weight 500 — three identical grey buttons
in a column, the one that navigates *away* looking exactly as important as the two that record
what the owner thinks. The two verdict buttons now sit in a `--surface` box with `--pad` and a
hairline, and the exit is a plain link under it. No colour was spent on the hierarchy.

**A badge is not a verdict.** The five layouts the owner approved on 2026-09-01 carried a chip
saying so 57px under a line reading "No verdict yet." — two opposite statements about one
layout on one screen. It is one sentence now, and the tier count stays honest: no verdict has
been cast *here*.

**A chip that is not a control does not behave like one.** The tier chip on an item page and
the approved badge were `<span>`s wearing `.std-tag`, which turns accent-orange under the
pointer because every chip that class was written for is a link. They lit up exactly like the
real "Every layout" link beside them with nothing to click. The tier strip's chips had the
opposite problem — real controls wearing an `<a href="/layouts/browse/">` that sent a copied
link to the top of the page instead of to the tier. They are `<span role="button">` now.

**The page shows before it tells.** The opening five lines explained Approve, Improve and the
append-only file — two controls that are not on that page at all — and pushed the first
picture to y=623 at 1920 and y=703 at 3440, with not one card fully on a phone's first screen.
One line now, and the tier head puts the name, the count and the sentence on one row: the
first picture starts about 200px higher at every width.

**A card says where it comes from.** `framework/ui` and `framework/ux` each own a Tree, a Menu
and a Pagination, and two different things are called Sections — eight cards in four
indistinguishable pairs, because a card showed only the name. The same quiet line says
`drawing` when the picture is a wireframe rather than a photograph, which is why twelve flat
grey cards used to read as empty ones.

**An item page is for the verdict, so a phone puts it first** *(settled the same day)*. The two
buttons sat **1,043px** down at 400, past three stacked pictures — a screen and a third of
scrolling on the page whose whole job is those two buttons. Below 40rem the order is now the
heading, the verdict box, the picture of the reader's *own* width, and then a fold reading "The
other widths — 1920 and 3440 pixels". The row is at **y=153**. At 40rem and up nothing moved.

Two things are worth carrying away from how it was done.

**Four boxes, and the other three take `order: 1` — never `order: -1` on the one that moves.**
The item page is four direct children of the page grid (pictures · lede · seat · rest) so that
one declaration can hoist the seat. `order: -1` put the verdict *above the page's own `<h1>`*,
because the heading is a child of the same grid with the default order of 0 (seat at y=49,
heading at y=147). Pushing the other three to 1 leaves the seat tied with the heading, and a tie
breaks on DOM order — so the heading keeps its place and the decision lands directly under it.

**Both framework rhythm rules follow DOM order, not `order`.** `.page-title + *` (1.5 × `--flow`)
and `.flow > * + *` each landed on the wrong box the moment anything moved: the heading rhythm
went to the pictures, which are DOM child one but drawn third, and the box now under the heading
got none at all. Each box takes the rhythm of the position it is actually *drawn* in. That is a
trap for any use of `order` in this framework, not just this page.

The arrangement itself has to be chosen in JS — no CSS can open a `<details>` — so `pictures()`
reads a `matchMedia` and `redraw()` rebuilds the row when the width crosses the line in either
direction. The listener drops itself once its box has left the document, the same discipline
`live()` follows for verdicts.

**Still left, with the measurement.** A single borrowed picture fills 614px of a 1,766px row at
1920, leaving 1,150px empty beside it — the cap is `.std-shot`'s fold budget in `layouts.css`,
and raising it is a change to the layout standard, not to this browser.

## The wall moved onto `this.browse()`, and the verdict keyspace merged (2026-09-18, `browse-on-browse`)

Two things, one task: `ai/2026-09-18/browse-on-browse/`, item 5 of the overlap study
(`ai/2026-09-18/overlap-study/overlap.md`) plus the mastermind's `verdict-keyspace` decision
(`ai/2026-09-17/mastermind-layout-browser/task.jsonl`).

**The wall now draws with `this.browse()`** (`ext/catalog`), the same method `core/Layout/`
and `framework/ui/` stand on, instead of an independent 644-line hand-rolled grid — the study
found the two were doing the same job. `browse()` needs its band members to be real children,
declared before the router walks, so every catalogued item is now a real `BrowseItem` (a
`Page` subclass) added to this page's `children:` — the whole inventory is fetched with a
**top-level await** on the same `items.json` request this page always made, so it is in hand
before `new Page({...})` ever runs. `items.json` itself did not change shape or move — it stays
a plain fetchable file, because `/layouts/doc/studies/approved/page.js` fetches it directly by
url. `Page` reserves `.name` (the url segment) and `.url` (the item's own address), which
collide with two of `items.json`'s own field names, so `BrowseItem`'s constructor renames the
entry's own `name`/`url` to `title`/`real_url` on the way in.

One seam was added to `ext/catalog/browse.js` for this: `rail: false` skips `browse()`'s own
sticky search-and-facets rail (this page keeps its own tier strip — a rail has no notion of an
approved-count, and two competing filter bars for the same three tiers would be worse than
one), and every band's own heading now always carries `data-band="<group>"` so a caller with
its own strip can still scroll to one. Both are documented in `ext/catalog/readme.md` and
`ext/catalog/doc/method/browse.md`.

**The old `.std-browse-wall`/`.std-browse-head`/`.std-browse-say` classes are gone.**
`browse()`'s own wall is `auto-fit` with a `28em` card cap (`ext/catalog`'s `stage-cap`, landed
the same day) rather than this page's old `auto-fill` — a short band's last row may now stretch
its cards up to 28em instead of leaving gutter. Every tier here is large (24–48 items), so this
was accepted rather than re-forking the grid. The tier's own one-line description, which used
to sit above each wall, now rides as the strip chip's `title` tooltip instead of being drawn
three times down the page — `browse()` draws no room for it inline, and repeating a sentence a
reader can hover for once was worse than dropping the repeat.

**A real, non-obvious win, not just fewer lines.** The old async `DATA`/`route()`/"heading
corrected once items.json arrives" dance — needed only because the inventory arrived over the
network after the router had already claimed the name — is gone entirely: every item is a real
child now, known synchronously, so a deep link's heading is right from the first paint and a
bad id 404s the ordinary way core gives every page. The per-item verdict mark and the strip's
counts are their own small `live()` boxes now (mirroring `ext/Ask/verdict.js`'s own pattern,
landed the same day) instead of one `live()` wrapper that rebuilt the whole hundred-card wall
on every press.

**Lines: `page.js` 646 → 624 (-22), `browse.css` 297 → 280 (-17).** Smaller than the study's
300–400 estimate, honestly reported rather than forced: the study costed deleting the old grid,
not the adapter a cross-realm catalogue actually needs (`BrowseItem`'s field-renaming, the
`vkey` merge below) — both landed in this same file. `ext/catalog/browse.js` gained 14 lines for
the seam, which is now shared, reusable infrastructure rather than a fourth independent wall.

**The verdict keyspace merged into one trail, keyed by url.** `ext/Ask`'s corner control
(landed the same day, `verdict.js`) casts a verdict for the whole page it is mounted on, keyed
by that page's own url — a second, independent trail from this browser's, which used to key
every verdict by its own short catalogue id regardless. The mastermind's `verdict-keyspace`
decision chose one trail: `vkey(item) = item.wire ? item.id : (item.real_url ?? item.url)`,
used everywhere this page reads or writes a verdict. The twelve `wire` items (a picture of the
abstract layout standard, not of any page a reader can open) keep their short id — the decision's
own reasoning, "the wire-only items keep their id and never collide with a url." Proven live: an
Approve pressed on a card whose real page is `/layouts/doc/studies/approved/` writes exactly
that string to `verdicts.jsonl`, and `/layouts/doc/studies/approved/page.js` — **untouched** —
already reads any url-keyed row into its own "library" section, so the merge needed no change
there at all; it needed the browser to start writing the same keyspace `ext/Ask` already did.

⚠ **Several `items.json` entries share one url on purpose, and now share one verdict too.** The
five `approved-*` items (the taxonomy page's own five shapes) all point at the one page
`/layouts/doc/studies/approved/`, and several `arrangement-*` items share a url with the `wire`
item that draws the same layout standard's own page (e.g. `arrangement-1-stack` and
`layout-1-flow` both resolve to `/layouts/1-flow/` — the wire keeps its id, so the two never
collide with each other, but pressing Approve on any of the five `approved-*` cards now marks
all five, because they are five cards for one page). This was true of the underlying pages
before this merge; the merge just means the browser's own cards now show it too, which is the
whole point of "one library."

**Found, out of this task's fence, not fixed.** `/layouts/doc/studies/approved/page.js`'s own
`library_card()` assumes every non-wire item it lists has a jpeg at
`/layouts/browse/shots/<id>-1920.jpg`; the five `approved-*` items use `items.json`'s `shot`
field instead, pointing elsewhere, so that one thumbnail 404s once any of the five carries a
verdict (confirmed live: one console 404, the page still renders and still lists the right
title and link). This is not new — the same 404 fires if the owner approves one of those five
from the page's own `ext/Ask` corner control, unrelated to anything in this task — and the fix
belongs in `library_card()`, which is the approved page, outside this task's fence.

Re-proven at 400 / 1280 / 1920 / 3440, headless, private server: every check the 2026-09-17
critic's pass above recorded still holds (102 cards now, not 99 — the inventory grew between the
two tasks), Approve and Improve both pressed for real (a real page and a wire item, one each),
zero console errors, `verdicts.jsonl` copied then restored to its exact prior state.

## Open — the owner's call

- **Granularity.** An item is one *url*. `/layouts/labs/sections/` is four items (the realm and its
  three children) even though the realm's own page draws a dozen distinct bands, because a
  band with no url has nothing to link to and nothing to screenshot. If the owner wants to
  judge those separately they need urls first.
- **Whether an approval should freeze anything.** Right now a verdict is a note; it does not
  gate a build, mark the realm, or appear anywhere but here. Wiring an "approved" mark back
  into each realm's own page is a small change and a real decision.
- **What "Improve" should do next.** Today it records one line. The obvious next step is that
  an improve note opens a task — the AI board already renders one — but that is a workflow
  choice, not a layout one.
- **3440 for the Components tier.** Every item is pictured at all three widths, including the
  thirty components, where the ultrawide shot mostly shows the same component with more empty
  room beside it. It costs 30 jpegs and answers "does this stretch?", so it stayed.
