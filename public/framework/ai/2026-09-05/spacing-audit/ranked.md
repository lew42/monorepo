# The ranked list — four auditors, 92 pages, 5 widths, 9,177 raw findings

Merged from `../spacing-audit-a|b|c|d/findings.json`. Machine-readable: `ranked.json`
(60 clusters + every page's growth). Every number below is measured, headless, at
`deviceScaleFactor: 1`, on the live site.

## The one number

**Spacing grows 1.20× while the screen grows 2.69×.** 76 of the 84 measurable pages
grow under 1.3×; **7 shrink**. All four auditors, on four disjoint page sets, landed on
the same 1.20× median independently. This is the owner's "ALL TOO CRAMPED", and it is
not a page bug — it is the token scale.

The seven that shrink from 1280 → 3440:

| page | median @1280 | median @3440 | growth |
|---|---|---|---|
| `/imagine/platform/existing/` | 27.1px | 10.0px | **0.37×** |
| `/blog/systems/layout-generators/` | 19.5px | 11.0px | 0.57× |
| `/imagine/vary/scroll/` | 8.1px | 4.9px | 0.60× |
| `/imagine/team/ada/`, `/imagine/team/iver/` | 8.1px | 7.3px | 0.90× |
| `/framework/ui/` | 6.0px | 5.4px | 0.90× |
| `/` (the home page) | 7.3px | 6.9px | 0.95× |

The best page on the site is `/imagine/platform/` at 2.16×; next is `/imagine/codrops/line-hover/`
at 1.76×. Nothing else clears 1.7×.

## The discrepancies, ranked

**D1 · no-growth · 66 pages · severity 5 · all groups.** The table above. One cause:
`--pad-default: clamp(1em, 1.3%, 2em)` and `--gap-default: clamp(1em, 0.4em + 0.5vw, 1.6em)`
in `framework.css` `:root`. At 3440 the gap's preferred branch (`0.4em + 0.5vw` = 23.6px)
is already under its own 1.6em cap, so **raising only the ceiling changes nothing** — the
night's ceilings page proved this live. The whole clamp has to move.

**D2 · the `<summary>` strip · 8+ pages · severity 5.** A `<details>` toggle is a block, so
it is as wide as its column with **zero side padding**. This is the owner's "981px wide …
about 100px of icon/text … a massive strip of empty":

| page | width | ink | ratio | side padding |
|---|---|---|---|---|
| `/imagine/paging/` @3440 | **962px** | 137px | 7.0× | **0** |
| `/imagine/research/` @3440 | 2,910px | 380px | 7.7× | **0** |
| `/imagine/research/` @3440 (`summary.muted`) | 2,404px | 470px | 5.1× | **0** |
| `/framework/`, `/core/`, `/ext/`, `/styles/`, `/ui/`, `/ux/` @2560 | 720px | 69px | 10.4× | **0** |

`framework.css:384` is the only rule that touches `summary` — `cursor: pointer`. Nothing
else. Every `<details>` on the site is an unstyled full-width block.

**D3 · the previews wall stretches every card · 19 pages · 432 instances · all four groups ·
severity 5.** `a.page-preview-link` (`core/Page/Page.css:735`) sits in a
`repeat(auto-fill, minmax(14em, 1fr))` grid, so every card is as wide as the widest and
carries **0 side padding**. Degenerate worst case `/imagine/design/journey/` @3440:
3,342px wide over 6px of ink.

**D4 · realm chips that are strips · severity 5.** Each is a realm-level constant:

| control | file | worst | ratio |
|---|---|---|---|
| `a.decks-chip` | `imagine/decks/decks.css` | `/imagine/decks/half/` @3440 | 8.7–10.1× |
| `a.codrops-link--swap` | `imagine/codrops/*.css` | `/imagine/codrops/line-hover/` @3440 721px / 59px | 12.2× |
| `a.codrops-demo-title` | same | `/imagine/codrops/` @3440 1,021px / 144px | 7.1× |
| `button.yt-start` | `imagine/youtube/youtube.css` | `/imagine/youtube/course/` @2560 1,067px / 52px | 20.5× |
| `a.research-card-name` | `imagine/research/*.css` | `/imagine/research/` @3440 2,879px / 120px | 24× |
| `a.sidebar-link` | `public/styles.css:64` | the whole public site, 228–273px box for 20–24px of text | ~10× |
| `a.page-link` | `core/Page/Page.css` | `/imagine/paging/examples/` @3440 1,054px / 316px | 3.3× |

**D5 · padding inversion — a box padded more than the page it sits in · 6 pages · severity 4.**
`div.decks-region` 45px inside a 20.5px page gutter · `a.screens-area` 51px inside 20.5px ·
`a.mag-cover-area` 64px inside 20.5px · `div.paging-stage` / `div.paging-canvas` 36px where
the page gutter is 0.

**D6 · the column head touches its body · 28 pages · severity 3.** `div.page-column-head`
and `div.page-column-body` render with a 0px gap on 28 of the 92 pages. Decision 3 of the
day ("column heads breathe") already put the head's vertical padding on
`--page-column-pad-y`; the seam between head and body is still nothing.

**D7 · a title flush with its column edge · 19 hits, all on `/imagine/paging/toolbars/*`.**
`h1.page-title`, `h2` and `p.md.paging-lede` all render with their left edge exactly at the
column's left edge — no inset at all.

## The uncertainties — this is what the judge is for

**U1 · The three levels do not exist.** The owner saw `compact` / `regular` / `display` on
`/imagine/paging/templates/theming/` and called the difference "hardly noticeable". They are
right, and it is worse than they think: those three words move **type only**, at
`--templates-step: 0.88 / 1 / 1.06` (`templates.css:25–27`) — a **6%** step between regular
and display. **There is no spacing level system anywhere on the site.**

**U2 · `padding-thin` is 4,419 of the 9,177 findings and most of it is correct typography.**
The rule as written fires on every inline prose link (`a` with 0 padding — 881 instances on 36
pages) and on `div.page-preview` (a card whose padding is on its inner frame). An inline text
link *should* have no padding. **The control rule has no exception for inline text**, and until
it does this whole count is noise. Rule missing.

**U3 · `touching` is 2,715 findings and most of it is `li`, `tr` and `thead`.** List items and
table rows legitimately abut. Rule missing: what may touch?

**U4 · The four auditors did not measure the same root.** C found that this SPA keeps other
realms mounted-but-hidden at 0×0, *first in DOM order*, so `document.querySelector(".page")`
grabs the wrong one; C switched to `.active-page` (the Router's own leaf marker) and verified it.
A, B and D did not. The 1.20× median agrees across all four anyway, so the headline is safe —
but a single per-page outlier from A, B or D may include hidden boxes.

**U5 · Two auditors' `ratio` findings are inflated.** B found mid-run that a `<p>` with inline
`<a>`/`<span>` children was read as a stack of boxes, manufacturing huge fake gaps from ordinary
text wrapping; B excluded `display: inline` children and its ratio count fell 231 → 21. A (47) and
D (117) never applied that fix — and their worst ratio findings are on `code`, `strong` and
`li`, all inline. **Trust B's 21; treat A's and D's as suspect.**

**U6 · The ink formula under-reports card-shaped controls and over-reports thumb-only ones.**
A `Range` over an element whose children are all blocks returns the full block width, so
`a.blog-hero` reads width == ink (never flagged); a card that is only a thumbnail reads 6px of ink
(flagged at 525×). The `strip` count is right about the *pattern* and wrong about several
*instances*.

**U7 · 55–65% of a 3440 screen is blank on every reading page,** and it is not in any of the six
kinds. D measured a 2,023px (59%) empty strip beside a blog post's paragraph, and `/notes/` and
its three children hold plain text to a ~720px column. Is a fixed measure at 3440 correct
(readability) or is it the owner's "60% dead space"? **Rule missing** — this is the `measure`
token question from 2026-08-17, still open.

**U8 · One "before" set may already contain a fix.** A concurrent agent rebuilt
`/imagine/paging/paging.js` mid-run, 404ing the five `toolbars/` URLs; A recaptured, but the
recovered `toolbars/page.js` carries a comment claiming it fixes the owner's strip complaint.
A's zero strip findings there may be an *after*, not a *before*.

**U9 · Severity is not calibrated between auditors** — each scored 1–5 on its own heuristic.
Rank by reach (pages × severity) rather than by severity alone; `ranked.json` already does.
