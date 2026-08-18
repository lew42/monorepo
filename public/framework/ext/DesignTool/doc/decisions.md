# DesignTool — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Measures a layout. `analyze(el)` reads the browser once — every rect, computed
style and line box under a root — and returns a ranked list of what is wrong, a
finding census, page metrics, and a proposed declaration for each finding.

⚠ **`analyze()` returns no score and no grade** (2026-08-17). It used to, and the
number came out *anti*-correlated with how pages actually look — it counted
findings, findings scale with content, so it rewarded emptiness. Every rule
survived; the average was deleted, and ranking is now the census, severest first
(`score.js`'s `worst_first`). **`taste/` is the only tier here that scores.**
Evidence: `ai/2026-08-17/vision-baseline/`; the removal:
`ai/2026-08-17/tier-calibration/`.

```js
import { analyze } from "/framework/ext/DesignTool/DesignTool.js";

analyze(document.querySelector(".page.active-page"));   // → report
frame("/framework/styles/layouts/grid/", 3440);         // → the same, in an iframe at 3440
sweep("/framework/", { from: 360, to: 3440 });           // → the widths where behaviour changes
```

**No AI at runtime.** Vision was used to *calibrate* the thresholds and is not
in the loop — see `knowledge/thresholds.md` for what agreed and what did not.

⚠ **`ask()` may only ever be reached from a `click` handler — never from a
timer, an observer, or a render.** It is a paid model behind a screenshot
($0.03–0.17 a page) and the dev rail re-measures on every resize by design, so
one `ask()` on that path is a bill wired to a gesture. `vision.js` is the only
caller in this module, behind one button, on two pages. Vision belongs *beside*
the tool — a separate pass whose committed results the tool displays — and the
reasoning, including why no vision number may sit next to a measured one yet,
is in `ai/2026-08-17/designtool-ui/design.md`, Job 4. (the owner, 2026-08-17.)

## The files

```
library/        the catalog of arrangements the site uses, each measured live
probe.js        the browser read: walk, measure, one flat array of facts
ratios.js       geometry derived from that array — spill, insets, gaps, overlaps
rules.js        what is BROKEN — geometry that fails
polish.js       what is OFF — alignment, proportion, hierarchy (caps at medium)
score.js        severity weights, the census + `worst_first`, page metrics
DesignTool.js   the front door: analyze(), frame(), the sibling roll-up
sweep.js        coarse stride + bisect, for the widths that actually matter
report.js       a report as a view
address.js      locate(root, path) — a finding's address, resolved
highlight.js    point($view, root, i) — hover a finding, ring the box it is about
mirror.js       the offending ELEMENT, before and after, at its own size
defer.js        a judgement call the reader has already made, remembered
vision.js       the backup path — ext/Ask, a screenshot, a second opinion
live.js         a score that follows a resize handle — one run once it stops
taste/          what is GOOD — eleven ideal ranges, weighted. The third tier
tests/          twenty-three layouts with a declared verdict — the ground truth
audit/          the whole site, ranked (page.js) + the before/after pair (twin.js)
knowledge/      the lessons, one file each
```

`audit/findings.json` is a **generated baseline** so the page is useful the
moment it opens — a live run is 168 iframe loads and about eight minutes. It is
written by the same headless pass as `audit/taste.json`, from one probe model per
row, so the two files always describe the same measurement. **No
row carries per-instance detail at all**: every row keeps a compact, *uncapped*
`rules` summary (rule, title, severity) and the page re-measures the row live
when you open it. 304KB. The file states that rule in its own `format` field, so
the next regeneration cannot quietly diverge from it. Full record:
`audit/readme.md`.

⚠ **It used to cap each row's issues at three or four, and the cap was written
down nowhere.** It did not match the row's own `counts.total` on **221 of 237**
sub-80 rows, and on **89** of them it dropped the row's single worst finding —
so the page has been hiding the very thing a reader opened the row to see. Then
following the *documented* rule honestly produced a **2.0MB** file, which is the
opposite failure on a statically-hosted site. Neither was the real defect: **the
cap existed, worked, and was undocumented.**

It is produced by driving this same module through globally-installed
Playwright. Two rules, both learned the hard way — see the ⚠ below:

```js
// Import in its OWN call, so a stall is attributed to the fetch and not to analyze().
await page.evaluate(async () => { window.LT = await import("/framework/ext/DesignTool/DesignTool.js"); });
await page.evaluate(() => window.LT.analyze(document.querySelector(".app")));
```

…and a **fresh browser context every ~40 navigations**. Recycling every 40, the
whole corpus — 168 pages × [1280, 3440] — is 336/336 measured with no stall.

**`vision.js` is a second opinion, never the detector.** It hands a model the
picture *and* the numeric findings and asks which it can actually see — the one
question vision answers better than arithmetic. It is **read-only by
construction** (`tools: "Read,Glob,Grep"`): a prompt typed into a page must not
be able to write to this repo, and that list is the only thing preventing it.
Off localhost `ext/Ask` is absent, so the button simply does not render.

## The library, and the don'ts

`library/` is the catalog: **eleven arrangements the site is actually built
from** — a reading column, a reading grid, a tile wall, a gallery, a stat strip,
a rail beside content, a list·detail split, a banded section, a dashboard row, a
wide table, a toolbar — each one a page holding the declaration, the pattern
rendered live, a score that follows the window, and the same pattern measured in
its own iframe at 400 / 1280 / 1920 / 3440.

`library/bad/` is the other half: **ten fragile patterns**, each a plausible
page shape rather than a minimal rule-tripper, each naming the rule it trips,
the width where it stops working, and the library entry that replaces it. A
don't with no alternative is a complaint, not doctrine.

**It is not `tests/`.** The corpus asks whether the analyzer is right; the
library asks what an author should write. They overlap in subject and not in
job, and both pages say so.

**Four entries were rewritten by their own measurements** — a rail whose article
ran 261 characters a line at 3440, a two-track split whose list collapsed to
62px at 400, a dashboard row that laddered at 2.4 characters a line, and two
paddings the proportion rule called thin. Writing the catalog from the doctrine
and then measuring it is what found them, and it is the argument for the
library existing rather than a list of recommended snippets.

## Knowledge base

| | |
|---|---|
| [Ratios](../knowledge/ratios.md) | Why every threshold is dimensionless, and the six that matter. **The frame gap** — text-to-edge over font-size — is the measurement the tool exists for. |
| [False positives](../knowledge/false-positives.md) | Six classes of box that make a sound measurement meaningless: inline, `contents`, scrollers, crops, shells, code. Every entry was a real analyzer bug found by running it on this site. |
| [Responsiveness](../knowledge/responsive.md) | Sweep by bisection, not by pixel. A robust layout changes signature at a handful of widths; an edge nobody chose is the finding. |
| [Thresholds](../knowledge/thresholds.md) | Every number the rules use and where it came from. |
| [Floors and ceilings](../knowledge/bounds.md) | A track with one bound instead of two is nearly every layout that breaks at an unchecked width. |
| [Spending a widescreen](../knowledge/widescreen.md) | What each shape actually uses of 3440, and the three ways to spend it. |
| [Characters per line](../knowledge/characters-per-line.md) | `52em` is 84–108 characters here, not 75 — **hand-counted**, after three instruments disagreed. ~2.0 characters per em, and it does not move with the viewport. |
| [Padding is not a misalignment](../knowledge/alignment-vs-padding.md) | The near-miss window is exactly the site's padding scale. One repeated offset is the tell. |
| [Blind spots](../knowledge/blind-spots.md) | Layouts broken on purpose that score clean — the inverse of the false-positive hunt, and the more dangerous direction. |
| [Ideal ranges](../knowledge/ideal-ranges.md) | The `taste/` tier's eleven bands, where each number came from, and which three quantities this site has a real consensus on. |

- [What the layout work taught us](./learned.md)

## What it costs

~25µs per node, near-linear — a demo case (238 nodes) is 4.2ms, a 1900-node
page is 47ms. [Full breakdown, per pass and the trap that would make it
quadratic →](./cost.md)

Cheap is not free at 60Hz: `live.js` and the dev rail both used to rerun on
every resize *frame*, which spends a whole drag measuring widths nobody asked
about — a single rail-width change cost nine analyses and ~180ms. Both now
restart a **200ms timer** on every resize event, so a drag costs one analysis,
at the width you let go at. Measured: 0 runs across a 40-event drag, 1 after.

## ⚠ 39% of what this tool audits, it never looked at (2026-08-16)

`probe.IGNORE` skips demo stages, and that policy is right — a stage is a picture
of another layout at another viewport, and measured as part of its host page it
produced 460–500 high findings per layouts page. What nobody had is the size of
the hole it leaves.

Ranking the whole site with `taste/` measured it: **132 of 336 page-widths — 73
distinct urls — are more skipped than read.** Those pages have been graded **on
their chrome** since this tool existed, and no report ever said so.

Counted from `audit/taste.json`, the 73 are:

| | |
|---|---|
| `styles/layouts/*` | 22 |
| `core/Page/*` | 16 |
| `web/nav/*` | 13 |
| `styles/elements/*` | 6 |
| `styles/layers/*` | 5 |
| eleven others | 1 each |

⚠ **`ui/*` is not on that list**, and two reports claimed it was — no `ui/*` page
crosses 50%; the highest is 29%. The count was right in both and the *description*
drifted twice, which is the failure mode this readme keeps meeting: a number is
checkable and a characterisation is not, so the characterisation is what rots.
**`core/Page/*` at 16 is the surprise** — the class that documents pages is
itself mostly pictures of pages.

`probe()` now returns `ignored` — the skipped share of the root's scroll area —
and both front doors carry it: `analyze()` passes it through, and `taste.rate()`
adds `mostly_picture` at ≥50%. `audit/taste/` pins those rows out of its ranking
and labels them, because a list that puts them at the bottom is not reporting the
site's worst layouts, it is reporting where the tool is blind.

⚠ **Two false starts on that number, both the same mistake.** Counting skipped
*elements* reported `1` everywhere — `closest()` matches the outermost ignored
box and the walk stops there, so one skip hides a subtree of five hundred. Then
skipped *area* over the root's **client rect** reported **207%**, because stages
stack down a page while the rect is only what is visible. Against the root's
**scroll** box it reads 100% where it should. A ratio is only as good as the
denominator nobody checked.

The readme has always said *"to audit a demo, point the tool at the demo's own
render at its own width"*. Nobody ever has. Doing it would take the site's real
coverage from ~61% to nearly all of it, and it is the biggest open question here.

## ⚠ And a second hole: the walk stops at depth 20 (2026-08-16)

`probe()`'s other two limits — `depth = 20` and `max = 4000` — were undocumented
until they manufactured a finding. `max` has **never** been reached: the largest
page on the site walks 1686 nodes. `depth` is reached on **5 of 168 pages**, and
costs 791 of 70 121 nodes site-wide (1.1%) — but **566 of them, a quarter of its
tree, on `ext/Panel/` alone**, plus 172 on `ext/editor/`. The site's real DOM
runs to depth 28.

Unlike `IGNORE`, this truncation reported nothing, and a rule then read the
absence as structure: a node whose children were cut has no block child to mark
it *blocky*, so `read_text()` gave it a text block aggregated from every
descendant's `textContent` and `text_bounds()` reported its own box as its
nearest text — `gutter: **high**` on three panel pages sitting 60px+ from every
edge. The cull now records itself (`n.cut`) and `read_text()` skips it;
`knowledge/false-positives.md` carries the mechanism.

⚠ **Raising `depth` is open, and it is a RULE#1 call.** It would move every score
on a nested page — `ext/Panel/` goes 65/D → 0/F with 16 high findings, on nodes
nothing has ever audited — for +40% probe time on that one page and nothing
measurable elsewhere. Numbers and the proposal:
`ai/2026-08-16/mastermind-layout/gutter.md`.

## Content nobody can reach outranks everything

The one finding severity could not express. `/web/nav/drill/` hides **4099px of
content in a 900px region with `overflow-y: hidden` and no scrollbar anywhere**
— unreadable by any means — and scored **82/B, rank 149 of 182**, because it was
one `high` and a `high` is 12 points. A 3% clip cost exactly the same.

`unreachable` is now its own rule (more hidden than shown, at least 200px of it)
and is weighted by the **rule** at 75 points, not by its severity. That page now
scores 19/F at every width, which is the bottom of the site. `empty` is weighted
the same way at 30, for the same reason in the opposite direction: a dead url
fires nothing and scored 94/A.

**A fourth severity tier lost.** `counts.high` is read by the corpus, by
`report()` and by the DevBar rail; a `critical` those three have never heard of
is a number that quietly stops adding up. Weighting two rules leaves every tier
meaning what it always meant. Both numbers: `knowledge/thresholds.md`.

## A third tier: what is GOOD (2026-08-16)

```js
import { rate } from "/framework/ext/DesignTool/taste/taste.js";
rate(document.querySelector(".page.active-page"));   // → { score, grade, bands, weakest }
```

`analyze()` **cannot rank two layouts that are both fine.** Nothing fires, both
score 100, and that is the correct answer to the question it asks. It is also
useless to anything trying to *choose* — which is precisely what
`styles/layouts/space/` needs, now that it generates layouts by the hundred.

So `taste/` grades against eleven **ideal ranges** rather than findings: measure,
padding as a share of its own box, the frame gap, gap, spacing scale, alignment
lanes, repetition, slivers, depth, width used, type contrast. Each pays full
credit inside `ideal`, tapering to nothing at the far edge of `ok`, and each
carries a weight. **A range with nothing to measure is dropped, not scored zero**
— a dashboard has no prose, and failing it for that would rank every dashboard
below every article; the divisor moves and `covered` reports how much of the book
was readable.

**Six of the eleven bands were refit on measurement** the day they were written —
36 pages at two widths, `ai/2026-08-16/layout-generator-rules/calibration.md`.
`repetition` was written at 0.30–0.75 from intuition and this site measures 0.23.
`pad-share` is the tightest quantity on the site (median 0.037, unchanged from
1280 to 3440) and gained weight; `frame-gap` turned out **bimodal** — chrome near
0.4–0.8, cards near 1.6–1.9, the median in the empty middle — and lost it. That
is the tier's own rule: **a weight is evidence, not opinion.**

It is a rating, not a rule: nothing here proposes a fix, nothing appears in an
issue list, and no score anywhere else moved. Record: `taste/readme.md`.

## Two tiers, and why the second one caps

`rules.js` reports geometry that **fails** — text unreachable, boxes
overlapping, content off screen. Nothing in it fires on a page that merely looks
wrong, which is most of what a designer would actually change.

`polish.js` is that second tier: near-miss alignment, padding that doesn't scale
with its box, a ragged row, two h1s, structure with nothing to see it by. **It
caps at medium**, always — a wobble must never outrank content nobody can read.
Its categories are also the only ones `defer.js` will let a reader wave through,
because a judgement call is a judgement call and content that cannot be reached
is not.

## The address is a path, not an index

Every finding carries a `:nth-child()` path from the analysis root, never a
walk index — an index shifts under async content, a path survives it and
doubles as the way back to the actual element. [Why, and the two bugs that made
the case →](./addressing.md)

That address is what makes a report **clickable**: `address.js` resolves it
(with `:scope >`, the trap that cost five wrong elements in 209) and
`highlight.js` rings the result — hover a finding to see where it is, click to
keep the ring and scroll to it. One overlay box on `<body>`, never a style on
the element, because anything written onto the page is one more thing the next
analysis reads back. ⚠ A live `root` is required — the audit page reports on a
frame that is long gone, so its findings stay inert and reach the element
through `mirror.js` instead.

**`point($view, root, i)` is the only door**, and all three surfaces
(`report.js`, `live.js`, the dev rail) go through it, because deciding *whether*
to offer a ring is the same decision three times:

- a **roll-up** attributes the finding to the container (that is where the fix
  goes) but its `spot` carries the **exemplar** — the box that actually broke,
  as `{ path, sel }`, so the ring and the caption agree with the detail line's
  "worst is `p`". Without it a roll-up rang boxes like 390×25731: 32 of 47
  rings covering ≥60% of the viewport were roll-ups.
- a **page-level** finding (`dead-space`, `invisible`) has an empty path, an
  empty path *is* the root (`address.js`), and a ring over the whole viewport
  carries no bits — so there is **no ring and no affordance**, not a lie.
- a path that **no longer resolves** is treated the same way, which is the one
  case that used to fail silently.

⚠ **A target outside the window is pinned to the edge it left by**, as a 3px
bar tagged `↑`/`↓`. The overlay is `position: fixed`, so before that a
below-the-fold target was drawn at coordinates off-screen and hover produced
nothing at all — measured on 37 of 93 leading findings.

## Used by

Grepped across `public/` for real imports, not prose mentions:

| caller | what for |
|---|---|
| [`styles/rules/demos.js`](/framework/styles/rules/) | `nesting_table()` calls `analyze()` on six live nesting patterns and prints the leading issue beside each — "every verdict on these pages is MEASURED... at render time, not asserted in prose." |
| `library/entry.js` | the same pattern, twenty-one times: `live()` for the current window and `frame()` for four viewports, on every catalog entry and every don't. |
| `ext/page.js` | declares `DesignTool` in `children:`, so `/framework/ext/` links to it as a card. |
| `dev/DevBar/tools.js` | a quick-jump entry, `["/framework/ext/DesignTool/", "layout tool"]` — reachable from the dev rail on every page. |

`styles/layouts/space/ruler.js` marks its own miniatures `data-layout-ignore`
for this tool's benefit but never imports it — a consumer of the contract, not
a caller. Everything else that mentions `DesignTool` (`styles/rules/*.md`,
`ext/editor/readme.md`) is a cross-reference in prose, not code.

**One real external caller.** Every other page that gets scored is scored *by*
this module's own `audit/` or `tests/` pages reaching out to *them*, not the
other way around — the site does not (yet) import `analyze()` to grade itself
inline anywhere but `styles/rules/`.

## Three things that will bite you

- **⚠ A rule that fires on the common case is worse than no rule.** Six of the
  thirteen rules needed a guard before they were usable, and every guard came
  from reading output against a page a human would call fine. When a new rule
  fires forty times, suspect the rule. `knowledge/false-positives.md` is the
  checklist.
- **⚠ `analyze()` must run after layout has settled.** It reads geometry
  synchronously, so calling it inside `content()` measures a page that is still
  being built. `page.js` waits, and `frame()` waits 350ms after load.
- **⚠ "Not in the document yet" is not "gone".** `live()` is called from a
  page's `content()`, so its first run can beat the render that attaches the
  page — and a panel that reads `isConnected` as *gone* disconnects its observer
  and then measures nothing, ever, showing an empty box with no error. Every
  library entry's live score was blank this way (2026-08-16). It now gives up
  only after it has measured at least once, and observes its own panel as the
  wake-up.
- **⚠ The probe reads through the ROOT'S OWN window**, never the bare global —
  that is the only reason it can measure an iframe from outside. `innerWidth`
  off the wrong window reports the parent's viewport and silently invalidates
  every responsive metric.
- **⚠ The measuring frame was clamped to the window, and reported the wide
  width anyway.** `framework.css`'s base reset is `iframe { max-width: 100% }`,
  so `frame(url, 3440)` from a 1920 window laid out at 1920 — identical scores
  and an identical `width_used` for the 1920 and 3440 rows, and nothing threw.
  Fixed in `DesignTool.css` (`iframe[data-layout-ignore] { max-width: none }`,
  in `@layer util`) **and in `frame()`'s own `cssText`**, for a caller that never
  loads the stylesheet. **Any wide measurement taken before this is suspect.**
- **⚠ `probe.IGNORE` skips demo stages, and that is a policy, not a
  measurement.** A `demo.stage()` simulates a different viewport at a different
  zoom; measured as part of its host page it reported 460–500 high findings per
  layouts page. There is no way to tell a deliberate miniature from text someone
  shrank by mistake — both are a `zoom` on an ancestor — so the tool is told.
  Pass `{ ignore: "[data-layout-ignore]" }` to see everything.

## Decisions

**Why not just ask a vision model?** Because it costs ~$0.14 and ~28s per
screenshot, per width, and the answer is not reproducible. The
`ai/2026-08-14/vision-*` tasks measured that: three models on fifteen images
agreed on the gross failures and disagreed on the rest, and the most expensive
one was the only one whose findings were fix-ready. Every consensus finding
they produced — clipped rails at 400px, ~95–130 character measure at 1920,
39–45% dead space at 3440 — is a **ratio a browser can compute exactly**, for
free, at every width, with a citation. So the numbers do the detecting and
vision is kept for what it is genuinely better at: judging whether the result
*looks* right. See `knowledge/thresholds.md` for the agreement rate.

**One score, or two?** A page can be sound and still waste a 3440 screen, and
those are different complaints. Options: two scores (integrity and fit); one
score with fit excluded; one score with fit weighted low. Two scores lost —
nobody ranks a site by two numbers, and the second would be ignored. **Verdict:
one score, and `dead-space` is capped at medium severity** so a widescreen miss
costs a grade step rather than a pass/fail.

**Penalties diminish per rule.** `weight × (1 + log₂ n)`. Forty cramped cards
are one mistake made once; a linear sum zeroes the score on any page with a
repeated component, which makes the number useless for comparing pages. The
cost of this: a page with one instance of five different rules scores worse
than a page with forty of one. That is the intended reading.

**A finding is one entry per thing an author would change.** Diminishing returns
were not enough on their own: `hit-size` reported one 60×17 control **437 times
across 71 pages** for a single CSS line, and the sibling roll-up could not merge
a row drawn three hundred times because each offender was the only child of its
own row (`span.sidebar-label` × 2504 site-wide, from one `Sidebar` declaration).
So identical selector × size collapses inside the rule, and rule × selector
collapses after the sibling pass, both carrying the count.

**The rules never touch the DOM.** `probe.js` produces a flat array of facts
and every rule is arithmetic on it. That is what lets the same rules run on a
live page, an iframe, or a JSON capture taken an hour ago — and what makes a
rule testable without a browser.

**Why a flat array with parent indices** rather than a nested tree? Because
half the derivations are bottom-up (text bounds, clipping) and half are
top-down, and preorder-with-parent-index gives both in one reverse loop. It
also serializes to JSON with no cycles.

⚠ **A sweep that "hangs in `analyze()`" is hanging in the `import()` above it.**
Headless Chrome's renderer main thread wedges *permanently* after roughly 85–110
navigations in one reused context — a trivial `for` loop, `page.screenshot()` and
`page.title()` all time out, and only a navigation frees it. The module fetch
then never resolves and `analyze()` is never reached. It reads as a page bug
because each width pass starts a fresh context, so the wedge lands on the **same
url in both passes**. Recorded once as three hung page-widths, since disproved:
`ai/2026-08-16/mastermind-layout/hang.md`.

## Open

- **`frame()`'s fixed 350ms is narrow, not systemic — measured 2026-08-17.**
  This entry used to say *"any ranking that mixes `ai/` pages with the rest is
  comparing two settle states."* It was measured: 21 pages (every one carrying a
  `high`, both named worst cases, and **10 clean controls**) × 350 / 1000 /
  3000ms × 3 runs, 306 navigations, zero stalls. Full working:
  `ai/2026-08-16/mastermind-layout/settle.md`.

  **17 of 17 `high` findings survive at 3000ms.** None vanish, none downgrade,
  and the controls never move. Ten rules — `empty`, `gutter`, `measure`,
  `hit-size`, `alignment`, `heading-offset`, `hierarchy`, `pad-scale`,
  `line-height`, `rhythm` — are bit-for-bit stable at every delay.

  ⚠ **Exactly one rule is settle-sensitive on exactly one page**, and it fails in
  the *opposite* direction to the fear: `cramped` on **`audit/` — this tool's own
  dashboard** — appears after ~1000ms and is absent at 350ms, so its published
  row **under-reports itself by a `high`** (65/D → 46/F at 1280). Two of 336 rows
  are wrong, both toward a false negative.

  ⚠ **And `ai/2026-08-13/sessions/` is now stable, while
  `ai/2026-08-14/editor-panel-review/` genuinely jitters at *every* delay**
  (3610–3754 nodes, score swinging 0–41) — so **no fixed delay, however long,
  makes that one deterministic.** A blanket longer wait taxes all 336 rows
  (+218s at 1000ms, +890s at 3000ms) to fix one. The narrow fix is a longer
  settle for `audit/`'s own row; the global "no DOM mutation for 250ms" rewrite
  is still the owner's call but no longer has this evidence behind it.

  ⚠ **A confound worth more than the finding:** the case that prompted this study
  — `styles/elements/lists/` reading 92/A, then 87/B, then B84 — reproduced at
  **no** delay. Its `page.js` was mid-edit under an uncommitted diff while both
  measurements were taken. **Measuring a repo while agents are editing it
  manufactures findings**, and this one fooled the mastermind into commissioning
  a study.
- **The corpus tests detection, not severity.** A `bad` case passes when its
  named rule fires; nothing checks that the *score* is in the right band. `quiet`
  and `at_most` now let a case claim silence, which is what a guard needs, but
  neither is a band.
- **`sweep()` is not wired into the audit page** — it runs from the console and
  the tests page. One width at a time is what the site report uses. `frame()` now
  times out, so a hung sweep fails loudly, but nothing retries.
- **`empty` has ~13 characters of margin.** Dead urls measure 63–64 in the
  content region and the sparsest live page measures 141. It is the one
  threshold on the site with no room, and `region()` picking the wrong box is
  the way it would break.
- **The before/after frames under-paint their panes.** Measured, the geometry is
  right: two equal 679px tracks, both iframes carrying an identical
  `scale(0.529)`. Painted, each fills only ~350px of its 679px pane, leaving
  dead space on the right — the same in both panes, so the *comparison* is
  honest, but the pair is smaller than it should be. Transforming an iframe does
  not reliably re-rasterize its content at the new scale. A screenshot-based
  pane (`Server/plugins/Shot.js` already exists) would sidestep it entirely, at
  the cost of the panes no longer being live.
- **Accept writes to a review queue, never to site CSS.** `audit/accepted.css`
  is not loaded by anything; applying a proposal is still a human's edit. The
  selectors the rules emit (`div.page-preview`) are *labels*, not source
  locations — there is no reliable way back from a computed node to the rule
  that styled it, which is the real blocker on ever making this automatic.
- **`alignment` cannot tell an inset from a wobble.** Its 3–12px near-miss
  window is exactly the site's padding scale, so a padded box hands it one
  finding per child — 16 to 20 of them on one library entry, every one at the
  same 9.4px. The roll-up now reports that as one finding with a count, which
  makes it readable without making it right. The fix is still a guard, not a
  looser window: `knowledge/alignment-vs-padding.md`.
- **Four rules never fired in 854 site runs**, and they are not one story.
  `doc-overflow` and `collision` are reachable and simply do not happen here —
  both trip in the corpus. `invisible` needs a page with structure and no
  painted surface, which this site never has; it now has a corpus case.
  `double-pad` was **unsatisfiable**: it demanded ≥6px of parent padding and
  then tested the child against `parent.clientWidth − padding` once, where a
  filling child is `− padding × 2`. Fixed, with a case.
- **Nothing checks that a don't is still bad.** `library/bad/` demonstrates ten
  failures live, but only `tests/` has declared verdicts — a rule retuned so a
  don't stops firing looks exactly like a don't nobody measured.
- **`sweep()` is not wired into the library either**, and one entry
  (`bad/scroller-in-a-wrapping-row/`) is explicitly a case only a sweep can
  catch: vertical overflow of a visible box trips no rule at any single width.
- ~~`audit/pages.js` is a hand-typed, ungenerated list of urls.~~ **Retired
  2026-08-16.** It is now a plain filesystem walk (168 pages, minus the
  sandboxes, `ai/` task dirs and `core/new/**`), regenerated and committed —
  see the header comment on the file itself, or `ai/2026-08-16/taste-audit/`.
  Still no automation re-derives it on a rename; someone has to re-run the
  walk and re-commit.
