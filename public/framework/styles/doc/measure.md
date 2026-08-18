# `--measure` — the reading-column token, measured

**Correction, 2026-08-16, same day as the first draft.** That draft led with a
~53-character median from `rate()`. It was an instrument bug, not a
measurement — `read.js`'s `measure` band takes a median **over text blocks**,
so a two-line caption and a forty-line article each cast one vote, and on a
page with cards, captions or a code listing the median reports those, not the
reading column. Three parties disagreed that afternoon — this file said 53,
`space/readme.md` said 117, the site's own `characters-per-line.md` said
83–103 — and an Opus judge settled it with no tool in the loop: two
independent hand-count methods, four viewports, two token values, the real
Montserrat font, agreeing to within 2 characters and perfectly flat across
viewport width. Full method and receipts:
[`mastermind-layout/measure-verdict.md`](/framework/ai/2026-08-16/mastermind-layout/measure-verdict.md).

> **`--measure: 52em` produces about 100 characters per line on this site —
> 106 on a full line of plain prose, 84 to 108 across real copy, ~2.0
> characters per em — and the number does not change with the viewport.**

Everything below is re-argued on that number. The `width-used` and
`dead-space` cost tables are unchanged from the first draft — they measure
box geometry, never counted a character, and the bug never touched them.
**No file was edited to produce any number in this document, and this
document does not change the token.** The verdict at the bottom is the owner's.

## The finding, in one table

The verdict's hand count, cited directly — two independent methods on the
site's own prose (`web/layout/measure/page.js`'s `LONG` string), rendered
inside the real theme scope so the font is really Montserrat: **`C`** counts
characters sharing line one's `top` via `Range.getBoundingClientRect()`
(what the browser put on the line); **`B`** binary-searches how many
characters of a `white-space:pre` copy fit the column width.

| viewport | `--measure` | column | `C` | `B` | chars/em |
|---|---|---|---|---|---|
| 3440 | 52em | 936px | **106** | 108 | 2.04 |
| 1920 | 52em | 832px | **106** | 108 | 2.04 |
| 1280 | 52em | 782px | **106** | 108 | 2.04 |
| 3440 | 30em | 540px | **62** | 64 | 2.07 |
| 1920 | 30em | 480px | **62** | 64 | 2.07 |
| 1280 | 30em | 451px | **62** | 64 | 2.07 |

**Bit-identical at every viewport** — the root font-size clamp moves pixels
and nothing else; a chars-per-line reading in `em` cannot move with the
window by construction. Across 322 real multi-line paragraphs site-wide
(ten routes, columns over 20em), median 1.90–1.92 characters/em, p10–p90
1.62–2.02. Scaled to 52em that is **median 99, p10–p90 84–105**, worst single
paragraph on the site 117 (at 54.7em, a lowercase-heavy `<p>` — see "Who
would break" below for where that column comes from).

The verdict hand-counted 52em and 30em directly and found the ratio holds to
within 2% between them, so the same ratio (~1.9 median chars/em) is a fair
stand-in for the other candidates this proposal asked about, not
independently hand-counted:

| candidate | column @ 3440 | derived median chars/line | inside `ok` (34–92)? | inside `ideal` (52–68)? |
|---|---|---|---|---|
| current — 52em | 936px | **~99** | **no — 7 over the ceiling** | no |
| 46em (≈ `62ch`, below) | 828px | ~87 | yes | no, high |
| 40em | 720px | ~76 | yes | no, high |
| 34em | 612px | ~65 | yes | **yes** |

**The current token fails the tool's own `ok` ceiling, not just the tighter
`ideal` band** — a stronger claim than anything on record before today; every
prior number (53, 83–103, 117) either understated the problem or, in the
mastermind's case, measured the wrong thing entirely (four `space/` presets
that declare **no** `--measure` at all — see the verdict, §2). 34em is the
only candidate that reaches `ideal`; 40 and 46em clear `ok` with room but stay
above `ideal`.

`62ch` measured within one character of `46em` across the sweep, so that
relative finding survives the correction even though the absolute numbers it
was measured against did not: a `ch` value is not behaviorally different from
its equivalent `em` here, because both scale with the root font-size the
same way. The case for `ch` is legibility of intent — `68ch` says what it
means; `52em` requires knowing this face's ~2-characters-per-em ratio, which
is Montserrat's number and would silently change on a font swap.

## What it costs

Unchanged from the first draft — geometric, never counted a character. The
prime objective is that widescreen space gets *used*; a narrower `--measure`
is a wider gutter. `width-used` (content span ÷ layout width, median over 9
pages that inherit the bare token):

| width | current | 34em | 40em | 46em |
|---|---|---|---|---|
| 1280 | 73.5% | 48.6% | 57.2% | 65.8% |
| 1920 | 49.6% | 34.0% | 38.2% | 43.9% |
| 3440 | **18.4%** | 15.6% | 15.6% | 16.6% |

`dead-space` (content span ÷ *viewport*, fires ≥1500px, so it also prices in
the sidebar):

| width | current | 34em | 40em | 46em |
|---|---|---|---|---|
| 1920 | 46.8% dead | 37.8% dead | 40.3% dead | 44.1% dead |
| 3440 | 38.2% dead | 33.4% dead | 35.0% dead | 36.6% dead |

**Read this honestly, now that the readability side is a real failure and
not an edge case.** The cost is not evenly spread. At 3440 every candidate
reads 15.6–16.6% — barely different from the current 18.4%, because 52em
(936px) is already a small fraction of 3440px; narrowing it further deepens
a gutter that is already the site's worst number, it doesn't create one. At
1280 and 1920 the token is doing real work today (73.5% / 49.6% used) and
narrowing it costs real, visible width there — 34em gives up roughly a third
of that. **The candidates barely differ from each other at 3440 (15.6 →
15.6 → 16.6) but differ a lot at 1280/1920 (48.6 → 57.2 → 65.8)** — which
means going all the way to 34em buys essentially nothing extra at the
widescreen width the prime objective cares about most, for a real extra cost
at the widths that were not broken.

## The options, weighed

**1. Leave it.** No longer defensible on the readability argument — the
median is ~99, past both the general 45–85 consensus and this site's own
92-character `ok` ceiling, and that is now a hand-counted fact, not an
instrument reading. Leaving it is only defensible on the cost argument (the
`width-used` table above), and only if 3440 is judged to matter more than
every reader on every other width having 15+ extra characters a line than
the site's own band tolerates.

**2. Lower the em.** 34em is the only candidate that reaches the `ideal`
band (~65), but costs the most at 1280/1920 for no extra benefit at 3440
over 40 or 46em (the 3440 row is nearly flat across all three). 40em clears
the `ok` ceiling comfortably (~76, 16 under 92) at a smaller cost than 34em.
46em barely clears `ok` (~87, 5 under 92) and costs the least of the three —
closest to today's spatial behavior, smallest readability gain.

**3. `ch`-based (`--measure: 68ch` or similar).** Not a different number —
`62ch` measured within a character of `46em` at every width. The case is
that it's self-documenting and font-independent: `68ch` keeps meaning
"about 68 characters" if the face ever changes; `52em` silently stops
meaning that. Costs nothing measured. If a numeric change ships, it should
ship as `ch`, not another em guess.

**4. A `clamp()`.** Not sweepable the way a single override is — this
proposal has one live override per run, not a continuous function — but the
shape is visible in the width-used table: the trade is flat at 3440 and
steep at 1280/1920, which is exactly the shape a `clamp()` could exploit,
holding a comfort-band character count at the narrow end while giving 3440
more room than a flat value would. Real design work not done here (the
slope, the breakpoints) — the option to come back to, not a number this
sweep already has.

**My pick: option 2, at 40em.** The readability failure is real and
hand-counted, not a worst-node artifact, so "leave it" needs a better reason
than "the median was fine" — that reason is gone. But 34em's extra
narrowness buys nothing at 3440 that 40em doesn't already buy, while costing
noticeably more at 1280/1920 where the token wasn't broken. 40em clears the
site's own `ok` ceiling with room (76 vs. 92) without paying for ideal-band
purity the widescreen case can't afford. Ship it as `--measure: 54ch`
(40em's rough `ch` equivalent, via the ratio `62ch ≈ 46em`; not independently
hand-counted — worth a follow-up sweep before it lands) so the value keeps
meaning what it says. **The verdict is the owner's** — this is RULE#1 surgery on
a token ~210 pages inherit bare, and "leave it" is a legitimate call if 3440
outweighs the readability finding in their judgment.

## Who would break — the inventory

Grepped `--measure` across `public/`. Two populations, and conflating them
was the mistake this document tried not to make the first time:

**Declares a value (11 CSS rules, 8 files) — these are what a token change
actually touches:**

| file | selector | value |
|---|---|---|
| `framework.css` | `.measure` (utility) | 34em |
| `core/Page/Page.css` | `.pages` (region/sheet fallback) | 60em |
| `core/Page/Page.css` | `.page.full` | none |
| `core/Page/Page.css` | **`.page.standard` — the token itself** | **52em** |
| `styles.css` | `.page.topic` | none |
| `ext/toc/toc.css` | `.pages > .page:not(.standard):has(> .toc)` | 78em |
| `ext/tabs/tabs.css` | `.tab-panel` | none |
| `ext/Doc/Doc.css` | **`.page.doc-page`** | **none** |
| `ext/Doc/Doc.css` | `.doc-section` | none |
| `ext/DesignTool/DesignTool.css` | `.page.dt-page` | none |
| `styles/layouts/layouts.css` | `.page.layout-full` | none |
| `ext/demo/app.css` | `.demo-app-pages` | none |

**Correction to the first draft: `.page.doc-page { --measure: none }` does
not exempt the 42 `Doc`-shaped `page.js` files from this problem — it makes
them the worst of it.** `--measure: none` removes the ceiling, not the
width; measured, `core/App/`, `core/Page/` and `ext/DesignTool/`'s prose
lands at **54.7em ≈ 105 characters — wider than the 52em token itself**,
because whatever the doc-page layout falls back to without a ceiling is
already generous. These are the module-index pages a reader hits first, and
they are not outside the reading-column problem; they are past its worst
number. Any fix to the token's value should not stop at `.page.standard` —
`Doc.css`'s `--measure: none` wants the same look, not a free pass.

**Inline overrides in JS (~20 call sites, mostly one family):** thirteen of
`styles/sections/*.js` (`features`, `testimonials`, `faq`, `team`, `contact`,
`stats`, `changelog`, `split`, `callout`, `signup`, `pricing`, `navbar`,
`logos`, `footer`) each set their own `--measure` (40–72em) via
`.style("--measure", …)` — marketing-band components with their own
considered widths, unaffected by the site default either way.
`styles/layouts/document/`, `styles/layouts/landing/`,
`styles/layouts/space/compose/`, `styles/layouts/space/hunt/`,
`web/layout/measure/` (×2, it's the demo *of* this exact token),
`web/layout/flow/`, `framework/page.js` (the top nav), and
`ext/DesignTool/taste/corpus/page.js` each set one inline value too.

**Net: roughly 274 `page.js` files exist on the site; ~42 opt out via `Doc`
(and measure worse, not exempt, per the correction above); ~20 more set
their own value; the remaining ~210 inherit the bare `.page.standard`
default unmodified.** That population is the honest blast radius of
touching `Page.css` line 73 — wide enough that RULE#1 surgery is the right
label, and every one of those ~210 pages is currently rendering prose past
this site's own `ok` ceiling.

## Method notes, and what changed

- **The `rate()`/`read.js` numbers in the first draft of this document are
  retracted.** `read.js:19`'s `chars > 80` filter admits `<pre>`/`<code>`/
  `span.hljs-*` as "prose," and `read.js:45`'s `median(...per_line)` is a
  median over text **blocks**, not lines — a card blurb and a full article
  each cast one vote. Ten routes measured 24.4–254.3 against a hand-counted
  ~90–105, never within 40. Full diagnosis: the verdict, §2.
- The `width-used`/`dead-space` figures above are unaffected — headless
  Chromium, dev server on `localhost:80`, `window.$BLOCKRELOAD = true` set
  via `page.addInitScript` before every navigation, `--measure` set with
  `root.style.setProperty()` on `.page.active-page[.standard]` (inline
  origin, wins regardless of layer — a faithful stand-in for editing
  `Page.css`), measured across 9 of 14 sampled pages that inherit the bare
  token.
- **Whoever re-runs the character count**: append the specimen inside
  `.theme-lew42`, not `document.body` — `--font: Montserrat` is scoped to
  that class, and a specimen outside it silently renders in `system-ui` and
  reads 13% wide. The verdict names this as the first trap.
