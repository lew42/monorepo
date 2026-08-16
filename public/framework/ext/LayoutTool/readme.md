# LayoutTool

Measures a layout and scores it. `analyze(el)` reads the browser once — every
rect, computed style and line box under a root — and returns a grade, a ranked
list of what is wrong, and a proposed declaration for each finding.

```js
import { analyze } from "/framework/ext/LayoutTool/LayoutTool.js";

analyze(document.querySelector(".page.active-page"));   // → report
frame("/framework/styles/layouts/grid/", 3440);         // → the same, in an iframe at 3440
sweep("/framework/", { from: 360, to: 3440 });           // → the widths where behaviour changes
```

**No AI at runtime.** Vision was used to *calibrate* the thresholds and is not
in the loop — see `knowledge/thresholds.md` for what agreed and what did not.

## The files

```
library/        the catalog of arrangements the site uses, each measured live
probe.js        the browser read: walk, measure, one flat array of facts
ratios.js       geometry derived from that array — spill, insets, gaps, overlaps
rules.js        what is BROKEN — geometry that fails
polish.js       what is OFF — alignment, proportion, hierarchy (caps at medium)
score.js        weights → score, grade, leading issues, page metrics
LayoutTool.js   the front door: analyze(), frame(), the sibling roll-up
sweep.js        coarse stride + bisect, for the widths that actually matter
report.js       a report as a view
address.js      locate(root, path) — a finding's address, resolved
highlight.js    aim($view, find) — hover a finding, ring the element it is about
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
moment it opens — a live run is 116 iframe loads and about two minutes. Every
row carries enough to rank; only rows worth opening (score < 80) carry their
issue list, and a clean row re-measures live when clicked. Keeping issues for
all 232 runs made an 854KB file the page downloaded just to draw a table.

It is produced by driving this same module through globally-installed
Playwright:

```js
await page.evaluate(async () => {
    const m = await import("/framework/ext/LayoutTool/LayoutTool.js");
    return m.analyze(document.querySelector(".app"));
});
```

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
| [Ratios](knowledge/ratios.md) | Why every threshold is dimensionless, and the six that matter. **The frame gap** — text-to-edge over font-size — is the measurement the tool exists for. |
| [False positives](knowledge/false-positives.md) | Six classes of box that make a sound measurement meaningless: inline, `contents`, scrollers, crops, shells, code. Every entry was a real analyzer bug found by running it on this site. |
| [Responsiveness](knowledge/responsive.md) | Sweep by bisection, not by pixel. A robust layout changes signature at a handful of widths; an edge nobody chose is the finding. |
| [Thresholds](knowledge/thresholds.md) | Every number the rules use and where it came from. |
| [Floors and ceilings](knowledge/bounds.md) | A track with one bound instead of two is nearly every layout that breaks at an unchecked width. |
| [Spending a widescreen](knowledge/widescreen.md) | What each shape actually uses of 3440, and the three ways to spend it. |
| [Characters per line](knowledge/characters-per-line.md) | `52em` is 83–103 characters here, not 75 — the token is the finding, not the pages. |
| [Padding is not a misalignment](knowledge/alignment-vs-padding.md) | The near-miss window is exactly the site's padding scale. One repeated offset is the tell. |
| [Blind spots](knowledge/blind-spots.md) | Layouts broken on purpose that score clean — the inverse of the false-positive hunt, and the more dangerous direction. |
| [Ideal ranges](knowledge/ideal-ranges.md) | The `taste/` tier's eleven bands, where each number came from, and which three quantities this site has a real consensus on. |

## What it costs

~25µs per node, near-linear — a demo case (238 nodes) is 4.2ms, a 1900-node
page is 47ms. [Full breakdown, per pass and the trap that would make it
quadratic →](./doc/cost.md)

Cheap is not free at 60Hz: `live.js` and the dev rail both used to rerun on
every resize *frame*, which spends a whole drag measuring widths nobody asked
about — a single rail-width change cost nine analyses and ~180ms. Both now
restart a **200ms timer** on every resize event, so a drag costs one analysis,
at the width you let go at. Measured: 0 runs across a 40-event drag, 1 after.

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
import { rate } from "/framework/ext/LayoutTool/taste/taste.js";
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
the case →](./doc/addressing.md)

That address is what makes a report **clickable**: `address.js` resolves it
(with `:scope >`, the trap that cost five wrong elements in 209) and
`highlight.js` rings the result — hover a finding to see where it is, click to
keep the ring and scroll to it. One overlay box on `<body>`, never a style on
the element, because anything written onto the page is one more thing the next
analysis reads back. All three surfaces use it: `report.js`, `live.js` and the
dev rail. ⚠ A live `root` is required — the audit page reports on a frame that
is long gone, so its findings stay inert and reach the element through
`mirror.js` instead.

## Used by

Grepped across `public/` for real imports, not prose mentions:

| caller | what for |
|---|---|
| [`styles/rules/demos.js`](/framework/styles/rules/) | `nesting_table()` calls `analyze()` on six live nesting patterns and prints the leading issue beside each — "every verdict on these pages is MEASURED... at render time, not asserted in prose." |
| `library/entry.js` | the same pattern, twenty-one times: `live()` for the current window and `frame()` for four viewports, on every catalog entry and every don't. |
| `ext/page.js` | declares `LayoutTool` in `children:`, so `/framework/ext/` links to it as a card. |
| `dev/DevBar/tools.js` | a quick-jump entry, `["/framework/ext/LayoutTool/", "layout tool"]` — reachable from the dev rail on every page. |

`styles/layouts/space/ruler.js` marks its own miniatures `data-layout-ignore`
for this tool's benefit but never imports it — a consumer of the contract, not
a caller. Everything else that mentions `LayoutTool` (`styles/rules/*.md`,
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
  Fixed in `LayoutTool.css` (`iframe[data-layout-ignore] { max-width: none }`,
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

## Open

- **`frame()` waits a fixed 350ms, and every `ai/` page proves that is not a
  settle.** They render in **two waves** — a shell, then the log — and the
  measurement you get is a fact about your delay, not about the page.
  `ai/2026-08-13/sessions/` is 1195 nodes scoring 79 at a 500ms delay and 2217
  nodes scoring **43** at 3000ms, three runs each, identical every time.
  `ai/2026-08-14/editor-panel-review/` is the same page shape with its wave
  landing at **1.5–2.0s** — right where a crawler waits — so it alone reads as
  non-deterministic: repeatable at 400ms (84, 1163 nodes) and 0 / 32 / 38 / 36
  at 1500ms, stable again past 2.5s. Nine screenshots decoding inside that
  window are part of it. The analyzer is not the variable. The honest fix is
  "no DOM mutation and no incomplete image for 250ms", which changes `frame()`'s
  cost for every caller and wants proposing before it lands; until then, **any
  ranking that mixes `ai/` pages with the rest is comparing two settle states.**
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
- **`audit/pages.js` is a hand-typed, ungenerated list of urls.** It already
  drifted once — see the audit report's top recommendation. Nothing re-derives
  it from the filesystem, so the next module rename or new top-level page is
  silent until someone notices a 404 in the audit table.
