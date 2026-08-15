# LayoutTool

Measures a layout and scores it. `analyze(el)` reads the browser once — every
rect, computed style and line box under a root — and returns a grade, a ranked
list of what is wrong, and a proposed declaration for each finding.

```js
import { analyze } from "/framework/ext/LayoutTool/LayoutTool.js";

analyze(document.querySelector(".page.active-page"));   // → report
frame("/framework/styles/layouts/grid/", 3440);         // → the same, in an iframe at 3440
sweep("/framework/", { from: 360, to: 3440 });          // → the widths where behaviour changes
```

**No AI at runtime.** Vision was used to *calibrate* the thresholds and is not
in the loop — see `knowledge/thresholds.md` for what agreed and what did not.

## The files

```
probe.js        the browser read: walk, measure, one flat array of facts
ratios.js       geometry derived from that array — spill, insets, gaps, overlaps
rules.js        what is BROKEN — geometry that fails
polish.js       what is OFF — alignment, proportion, hierarchy (caps at medium)
score.js        weights → score, grade, leading issues, page metrics
LayoutTool.js   the front door: analyze(), frame(), the sibling roll-up
sweep.js        coarse stride + bisect, for the widths that actually matter
report.js       a report as a view
mirror.js       the offending ELEMENT, before and after, at its own size
defer.js        a judgement call the reader has already made, remembered
vision.js       the backup path — ext/Ask, a screenshot, a second opinion
tests/          sixteen layouts with a declared verdict — the ground truth
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

## Knowledge base

| | |
|---|---|
| [Ratios](knowledge/ratios.md) | Why every threshold is dimensionless, and the six that matter. **The frame gap** — text-to-edge over font-size — is the measurement the tool exists for. |
| [False positives](knowledge/false-positives.md) | Six classes of box that make a sound measurement meaningless: inline, `contents`, scrollers, crops, shells, code. Every entry was a real analyzer bug found by running it on this site. |
| [Responsiveness](knowledge/responsive.md) | Sweep by bisection, not by pixel. A robust layout changes signature at a handful of widths; an edge nobody chose is the finding. |
| [Thresholds](knowledge/thresholds.md) | Every number the rules use and where it came from. |

## What it costs

Four passes, all arithmetic, all synchronous.

| pass | what it does | share |
|---|---|---|
| **probe** | one preorder walk: `getBoundingClientRect` + `getComputedStyle` per element, then a `Range` per text block for real line boxes | **~91%** |
| **ratios** | derived geometry — spill, text bounds, gaps, overlaps — one reverse pass and one per-container pass | included above |
| **rules** | 13 structural rules, arithmetic on the flat array | ~3% |
| **polish** | 7 alignment/proportion/hierarchy rules | ~5% |
| **score** | group, weight, cap | <1% |

Measured on this site:

| page | nodes | total |
|---|---|---|
| a demo case | 238 | **4.2ms** |
| `/framework/` | 682 | **17.1ms** |
| `/framework/core/Page/` | 895 | **25.1ms** |
| the audit page | 1884 | **47.2ms** |

**≈25µs per node, near-linear.** The probe dominates because every element costs
a style resolution; the rules are free by comparison. Two things keep it linear
rather than quadratic: text bounds propagate **bottom-up in one reverse pass**
(children always have a higher index than their parent), and overlap is checked
**per container** rather than across the whole tree.

**Fast enough to run on resize** — `live.js` does. A demo case is 4ms, a quarter
of a frame; a 1900-node page is 47ms, which is why the panel coalesces to **one
run per animation frame and never queues**. A 40-step resize sweep produced
exactly 40 recomputes with no backlog.

⚠ The one thing that would break this is measuring text per node instead of per
text block. `read_text` runs only on elements whose every child is inline —
without that filter the root's Range spans the whole document and the walk goes
quadratic.

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

⚠ **A walk index is not stable across page loads.** A page whose content arrives
asynchronously — a classdoc tab, a fetched markdown file — walks in a different
order next visit, and every issue then points at the wrong element. Each node
carries a `:nth-child()` path from the analysis root instead, which is exact,
survives async, and doubles as a human-readable address in the report.

That is what makes `mirror.js` possible: it reloads the page, resolves the path,
and clones the offending element **twice at its own size** — once as it is, once
with the fix applied inline. The whole-page before/after answers "is it
different"; at 0.5× the difference is a few pixels somewhere. The element
answers *what exactly is wrong, and what exactly fixes it.*

## Three things that will bite you

- **⚠ A rule that fires on the common case is worse than no rule.** Six of the
  thirteen rules needed a guard before they were usable, and every guard came
  from reading output against a page a human would call fine. When a new rule
  fires forty times, suspect the rule. `knowledge/false-positives.md` is the
  checklist.
- **⚠ `analyze()` must run after layout has settled.** It reads geometry
  synchronously, so calling it inside `content()` measures a page that is still
  being built. `page.js` waits a frame; `frame()` waits 350ms after load.
- **⚠ The probe reads through the ROOT'S OWN window**, never the bare global —
  that is the only reason it can measure an iframe from outside. `innerWidth`
  off the wrong window reports the parent's viewport and silently invalidates
  every responsive metric.
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

**The rules never touch the DOM.** `probe.js` produces a flat array of facts
and every rule is arithmetic on it. That is what lets the same rules run on a
live page, an iframe, or a JSON capture taken an hour ago — and what makes a
rule testable without a browser.

**Why a flat array with parent indices** rather than a nested tree? Because
half the derivations are bottom-up (text bounds, clipping) and half are
top-down, and preorder-with-parent-index gives both in one reverse loop. It
also serializes to JSON with no cycles.

## Open

- **`frame()` waits a fixed 350ms.** A page whose layout depends on a fetch
  that takes longer is measured mid-build. There is no general signal for
  "settled"; a per-page hook would be the honest fix.
- **The corpus tests detection, not severity.** A `bad` case passes when its
  named rule fires; nothing checks that the *score* is in the right band.
- **`sweep()` is not wired into the audit page** — it runs from the console and
  the tests page. One width at a time is what the site report uses.
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
