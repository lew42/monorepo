# Pointing the audit at the stage itself

15 of the 132 `mostly_picture` page-widths in `audit/taste.json`, re-measured
by loading each page headless, finding its own `.demo-render` (scoped to
`.page.active-page` — see the scoping trap below), and calling
`analyze()`/`rate()` on *that* element with `{ ignore: null }` instead of on
`.app`. Chrome numbers are the live re-run of the same `.app` call the current
audit makes (matches `audit/taste.json` to within rounding). Widths: 1280
(table below) and 3440 (cross-checked in prose). Zero failures, zero retries
needed across 30 page loads.

**No `ui/*` page ever hit `mostly_picture` ≥ 50%** — the readme's "every
`ui/*` component page" claim doesn't match the current `taste.json` (max
`ignored` seen there is 0.29, on `/framework/ui/`). The sample below is
`styles/elements/*` and `styles/layouts/*` only, both of which do.

| page (index → measured) | chrome findings | chrome taste | stage findings | stage taste | covered | taste Δ |
|---|---|---|---|---|---|---|
| elements/code → basics | 86 B | 59 F | 99 A | **0 F** | 0% | −59 |
| elements/lists → basics | 86 B | 66 D | 100 A | 52 F | 48% | −14 |
| elements/media → img | 87 B | 57 F | 100 A | **0 F** | 0% | −57 |
| elements/misc → details | 86 B | 67 D | 100 A | **0 F** | 0% | −67 |
| elements/table → basics | 86 B | 64 D | 97 A | 73 C | 61% | +9 |
| elements/text → scale | 86 B | 53 F | 70 C | 42 F | 19% | −11 |
| layouts/grid | 81 B | 72 C | 100 A | 67 D | 55% | −5 |
| layouts/gallery (twin) | 86 B | 39 F | 64 D | 29 F | 65% | −10 |
| layouts/dashboard (twin) | 84 B | 41 F | 63 D | 53 F | 74% | +12 |
| layouts/sidebar | 86 B | 51 F | 94 A | **80 B** | 100% | +29 |
| layouts/split (twin) | 86 B | 41 F | 58 F | 76 C | 84% | +35 |
| layouts/stack | 86 B | 49 F | 86 B | 79 C | 81% | +30 |
| layouts/hero (twin) | 86 B | 47 F | 57 F | 74 C | 84% | +27 |
| layouts/carousel (twin) | 86 B | 43 F | 54 F | 46 F | 100% | +3 |
| layouts/mail (twin) | 84 B | 42 F | 53 F | 71 C | 84% | +29 |

**Medians (1280px, n=15):** chrome findings 86, stage findings 86 — a wash.
Chrome taste 51, stage taste 53 — also a wash, but the median hides a real
split (see below). At 3440 the same shape holds: chrome taste 60 → stage
taste 56, chrome findings 84 → stage findings 75.

## Are the demos good?

**Split answer, and the split is the finding.** The single-stage
`styles/layouts/*` pages that aren't a two-up comparison — `grid` (100/A),
`sidebar` (94/A), `stack` (86/B) — are genuinely clean at their own width,
findings-wise. `sidebar` is the best evidence this method works at all: at
3440 it surfaces a **real, previously-invisible defect** — `measure: high,
"~178 characters per line (readable is 45–85)"` in its article column — a
box `probe.IGNORE` has skipped on every audit run since the tool existed. No
chrome-only pass could ever have found this.

The **worst three by the numbers** — `mail` (53), `carousel` (54), `split`
(58) — are **not** evidence of bad layouts. All three are `demo.layout({
twin: true })` pages (a 390-phone-beside-3440-monitor comparison card), and
the finding driving every one of them is `illegible` on the wide pane's text,
correctly measuring on-screen pixels inside a pane that is *itself* still
zoomed to 0.206× to fit beside the narrow one. That's a comparison thumbnail
being graded as if it were the delivered page — see below.

The `elements/*` children are trivial one- or two-line demos (`"Inline code
sits in a sentence."`) — correctly near-perfect on findings (97–100/A) and
meaningless on taste (0/F, `covered: 0%`): there's nothing in an 89-character
box for 11 ideal-range bands to grade.

## Does measuring a stage at its own width produce sane numbers?

**For a plain, single stage: yes.** `grid`, `sidebar`, `stack` — clean,
specific, and `sidebar`'s 3440 finding is a genuine catch, not noise.

**For a `twin: true` comparison card: no, not fully — a specific,
reproducible trip.** 6 of the 15 sampled pages (`gallery`, `dashboard`,
`sidebar` is not one — `split`, `hero`, `carousel`, `mail`) build a two-up
card where **both** panes carry the `.demo-render` class the task told me to
point at, and **both are still zoomed** — measured directly on `mail/`:
`escale 0.206` (the "3440 monitor" pane) and `escale 0.59` (the "390 phone"
pane). `probe.IGNORE`'s existing exemption only knows `.demo-screen`,
`.demo-sims`, `.page-preview-thumb`, `[data-layout-ignore]` — none of those
match a twin pane, so `{ ignore: null }` on "the render" doesn't land on
anything un-zoomed at all for these six pages. `illegible` then fires
correctly on the physical pixels (`false-positives.md`'s own class 7,
"scaled content — a miniature is a picture, not a design") but on a device
built to compare shapes, not to be read at that size.

**Two more specific trips, both named in `false-positives.md`:**
- `empty` (weighted 30, meant to catch a dead url) fired on
  `elements/text/scale/` — `"89 characters of text in a 609×374 region"` — a
  deliberately sparse, mostly-headings typography demo, not a dead page. This
  rule can't yet tell "nothing here" from "supposed to be mostly whitespace."
- `rate()`'s own degenerate case: a demo too small to fill even one of the
  eleven bands (`covered: 0%`) still returns `score: 0` → `grade: "F"` —
  identical to a genuinely bad layout. Three of six `elements/*` children hit
  this. `taste.js` already warns "a range with nothing to measure is dropped,
  not scored zero" for the *partial* case; the *all-dropped* case still lands
  on zero.

## What would folding this in cost?

**Zero extra navigations for `styles/layouts/*`-shaped pages** — the stage is
already on the loaded page; it's one more `probe()`+`rate()`+`analyze()` call
against a different root, on data already in the DOM (LayoutTool's own cost
figure: ~25µs/node, so a few ms per stage). **One extra page load per
catalog-index page** for `styles/elements/*` and (if the claim about it were
true) `ui/*` — the real render lives on a child route the index never
mounts, so auditing it means navigating there. In this sample that was 6 of
15 pages, each one extra `page.goto` + ~900ms settle. `styles/elements/*` has
~6 real children each; if every child (not just one representative) were
audited, that's dozens of extra frame loads per index page, in the same
ballpark as `sweep()`'s existing "116 iframe loads, ~2 minutes" figure — call
it several minutes added to the ~2-minute full sweep, not a redesign.

## Should it be folded in?

**A third column on the existing `audit/taste/` row, not a replacement and
not a separate page — and only after the twin caveat is closed, not before.**
Reasoning:

- **Not a replacement**: the chrome number is still true and still useful —
  it's what a page *looks like on arrival*, previews and all, and that's a
  real thing to know. Silently swapping it loses that.
- **Not a separate page**: the whole point of `mostly_picture` was that a
  reader scanning the ranked table couldn't tell "badly designed" from "tool
  was blind here" without opening the row. A second, disconnected page
  re-creates exactly that problem one click further away.
- **A column** — "stage" beside "chrome," on the same row — lets a reader see
  both without leaving the table, matches the two-axis-comparison pattern
  `audit/taste/` already uses for `analyze()` vs `rate()`, and costs no new
  page.
- **The twin caveat is the reason not to ship it as-is.** Folding in six
  pages' worth of `illegible` findings that are really "a comparison
  thumbnail is small" would manufacture six new F grades for a reason that
  isn't a layout defect — the opposite of what this task was for. It needs
  its own exemption (a twin pane is as deliberate a miniature as
  `.page-preview-thumb`, and deserves the same `IGNORE` treatment) before a
  `stage` column can be trusted at 100%.

**The verdict is Mike's** — this is a measurement and a proposal, per the
brief; `probe.IGNORE`, `taste/**`, `audit/**` and every `page.js` were left
untouched.

## Method note

`document.querySelectorAll(".demo-render")` alone is a trap: the Router keeps
ancestor pages mounted in the DOM (some visibly, `display: flex`, not just
`display: none`), so a naive global query pulls in `.demo-render`s from
`/framework/`'s own front-page demos, not the page under test. Scoping to
`.page.active-page .demo-render` first is required. Full sweep script:
scratchpad only, not committed (`sweep2.mjs`).
