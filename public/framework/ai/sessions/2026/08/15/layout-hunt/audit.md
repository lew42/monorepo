# The layout audit — 2026-08-15

205 pages × 400 / 1920 / 3440, measured by `ext/LayoutTool` after the rules were
fixed and the crawl made settle-aware. Median 79. Evidence: `scan.jsonl` (615
rows), `recrawl-report.md` (how it was measured), 485 screenshots in the session
scratchpad. Every claim below was checked against a picture or against the live
DOM on `:80`; where the picture and the numbers disagree, it says so.

**Nothing here was applied. Proposals only.**

## What is actually broken, in order

1. **One declaration owns 13 of the 20 worst pages.** Every leaf under `/web/`
   mounts in a catalog region, and its only scrolling ancestor is switched off by
   `public/styles.css:119`. 900–4100px of each guide page is unreachable by any
   scrollbar. One `hidden` → `auto` takes them from 4–21 to 79–96, and moves no
   control page by a single point. **Fix this first; it is the whole top of the list.**
2. **Panels have no floor.** `ext/Panel` splits its workspace evenly with
   `min-width: 0`, so five or six panes in a 400px window are ~50px wide and text
   ladders one letter per line. Three pages bottom out on it (`ext/Panel`,
   `ext/editor`, `ai/2026-08-13/panel/`), and it is visible, not statistical.
3. **Nothing else in the top 20 is a layout failure.** Ranks 17–19 are prose
   pages the tool dislikes; their screenshots are clean and well set. Their rank
   is `rhythm` and a `cramped` false positive on `blockquote`, not a defect.
4. **The clean end of the ranking is not clean.** `/framework/ext/` scores 92/A
   with a preview card that has lost its surface; `/notes/git-branch-names/`
   scores 95/A with a table clipped 48px past a 400px screen;
   `/notes/` scores 90/A using 27% of a 3440 monitor. The tool ranks failure
   well and cannot see *wrong*.
5. **181 dead urls is really 143.** 38 of them are the census normalising a real
   `.md`/`.png` link down to its directory; those links return 200 and their
   content. The genuine ones are led by `/web/` topic stubs never built (13 urls,
   linked from 94 pages) and `/framework/audit/modules/` (109 pages).

## The 20 worst — verified

Min score across the three widths. Rank 2 (`library/bad/chosen-height/`) is
omitted: it is a deliberate don't, scoring 0 on purpose.

| # | min | page | 400/1920/3440 | what a person sees | measured cause |
|---|---|---|---|---|---|
| 1 | 0 | `ai/2026-08-13/panel/` | 0/0/0 | the live Panel demo divides an 832px workspace into six panes of 120–213px; a stat pane reads "OF THEM IN THE BROWSE R", one word per line, and breaks *mid-word* | `measure` — `div.ui-timeline-entry` is **0px wide × 2403px tall** inside a 134px pane. Verified in the DOM at 400 and 1920 |
| 3 | 0 | `ext/Panel/` | 0/61/75 | at 400 the panes are 39–56px: letters stack vertically ("H E B R O W S E R", "G O N I T") and the clock paints over the tiles beside it | same — `.panel-body` min width 39px, 11 of 18 panes under 120px |
| 4–16 | 4–19 | the 13 `/web/` leaves | 4–19 at two or three widths | you land **already scrolled past the page title**, with the bottom half to five-sixths of the guide unreachable — the wheel does nothing | `unreachable` — `div.pages` clientHeight 900, scrollHeight 2126–4999, `overflow-y: hidden`, no scroller anywhere below it |
| 17 | 20 | `ai/2026-08-14/editor-panel-review/` | 33/28/20 | **nothing.** A clean dashboard rail, a well-set reading column, a legible ledger. Its only real flaw is spending a third of a 3440 screen | `measure` + `cramped:blockquote`. The tool itself calls this page non-deterministic; rank 17 is a coin flip |
| 18 | 25 | `ai/2026-08-11/` | 25/39/37 | a readable task board. One real defect: the compose row clips at 400 — the model select ("Sonnet") and the count dots are sliced by the card's right edge | `rhythm` (5 × `div.md.flow`) + `cramped:blockquote` — neither is visible |
| 19 | 31 | `ai/2026-08-09/` | 31/62/64 | identical to 18 — the same dashboard rail, the same compose clip | same finding list as 18 |
| 20 | 37 | `ext/editor/` | 37/46/48 | **real.** At 400 the editor demo is a wall of 52–90px panes; the palette ladders "SECT / GRID / CARD / TEXT" one word per line and a code sample renders as `div.c("f lex v gap` | `measure` — 10.1 ch/line over 23 lines in `div.panel-body`. Same disease as ranks 1 and 3 |

Ranks 21–25, for completeness: `ai/2026-08-13/persistence/` (43, `rhythm` at 400
only), three `library/bad/*` entries (deliberate), `core/new/1/` and
`core/new/starter/` (50, `rhythm` + `cramped:blockquote` — the prose family
again), `ai/2026-08-13/sessions/` (53, same).

**Read that table as: two real diseases (an unreachable region, a floorless
pane), one real page-level bug at 400 (`ext/editor`), and six pages the tool put
in the basement for prose.**

## Fixes, by family

### A. The `/web/` tier — one declaration, 18 pages

**Mechanism, verified in the DOM at 400/1920/3440.** A `/web/` leaf renders
inside `catalog()`'s region, `div.page-catalog-pages` — which is a region that
mounts pages but is *not* a `.pages`, so it never inherits the region scroller.
Its nearest `.pages` ancestor is the app root, which holds the catalog page as an
`active-ancestor` rather than an `active-page` — and `styles.css` switches
exactly that case off:

```css
/* public/styles.css:119 — today */
.pages:not(:has(> .page.active-page)):not(:has(> .default)),
.pages:has(> .page.topic.active-page) { overflow-y: hidden; }
```

`/framework/styles/elements/` is the working comparison: `styles` is a `.topic`,
so it carries its own inner `.pages`, and that one keeps `overflow-y: scroll`.
The `/web/` tier has no inner region to hand the job to.

**Proposal — split the rule; the first selector becomes `auto`:**

```css
/* public/styles.css, @layer site */
.pages:not(:has(> .page.active-page)):not(:has(> .default)) { overflow-y: auto; }
.pages:has(> .page.topic.active-page) { overflow-y: hidden; }
```

`auto` satisfies the comment's own reasoning — the rule exists so an outer region
does not reserve a scrollbar gutter it never uses, and `auto` reserves nothing.
A region that genuinely overflows with nothing inside it scrolling now gets a
scrollbar instead of eating its content.

**Measured effect** (injected live, re-analyzed after settle):

| page | now | with the fix |
|---|---|---|
| `/web/nav/sidebar/` | 6 / 4 / 72 | **81 / 79 / 84** |
| `/web/nav/drill/` | 19 / 19 / 19 | **94 / 94 / 94** |
| `/web/layout/screens/` | 14 / 19 / 19 | **89 / 94 / 94** |
| `/web/layout/grid/` | 16 / 79 / 21 | **91 / 91 / 96** |
| controls: `styles/elements/`, `/framework/`, `core/Page/`, `ext/catalog/`, `/web/nav/`, `/web/` | — | **identical at all three widths** |

It also lifts the five `/web/` leaves that clip without tripping `unreachable`
(`crumbs`, `footer`, `links`, `rail`, `wall`, 67–86) — 18 leaves in total.
**Confidence: high.** Rejected alternative: scrolling the catalog region itself
(`.page-catalog-pages { max-height: 100dvh; overflow-y: auto }`) — tested, and it
is worse: the cap starts below the region's top so content is still lost, it adds
`zero-size:high` at 400, and it regresses `core/Page/` 65→53 and `ext/catalog/`
54→28.

### B. Panels — a floor and somewhere to put the overflow

**Mechanism.** `ext/Panel/panel.css:17` sizes every level with
`flex: 1 1 0; min-width: 0`, so N panes divide the width by N with no minimum.
Measured: `ai/2026-08-13/panel/` panes are 50–56px at 400 and 120–213px at 1920
(the workspace sits in the page's 832px main track); `ext/Panel/` is 39–56px at
400. The timeline inside one of them is the visible casualty because
`.ui-timeline-when` is `flex: 0 0 6.5em` and `.ui-timeline-entry` is
`flex: 1 1 0; min-width: 0` — the label column takes 91px it does not have and the
entry collapses to zero.

**Proposal:**

```css
/* public/framework/ext/Panel/panel.css, @layer theme */
.panel-items { flex-wrap: wrap; }
.panel { min-width: min(14em, 100%); }
```

**Measured effect:** `ext/Panel/` 0→52 at 400 and 58→59 at 1920; `ext/editor/`
37→**63** at 400; `ai/2026-08-13/panel/` 0→20 at 1920; smallest pane rises from
39px to 131–342px everywhere; `Panel/full/` and `ui/panel/` unchanged.
**Confidence: medium** — it removes every sub-120px pane and none of the controls
move, but it does not rescue the pages (a 226px pane still ladders its contents),
and wrapping a Blender-style split is a design decision Mike should make. The
alternative tested — `min-width` plus `overflow-x: auto` on `.panel-items` —
widens the panes but scores *worse* (`ext/Panel/` 1920: 58→46), because a
sideways-scrolling row trips `gutter` and `escape` instead.

Secondary, and independent of the above: `.ui-timeline-when` should stop being a
fixed `6.5em` in a container narrower than about 20em — a container query on
`.ui-timeline-row` that stacks `when` above `entry` would make the component
survive any pane. `public/framework/ui/timeline/timeline.js:8`. Not measured.

### C. `ext/editor` at 400

Same cause as B (its shell *is* a panel workspace), plus its own code samples
overflow. Fix B first and re-measure; the residual at 400 is that five panes is
not a phone layout under any width policy — the honest fix is that the editor
demo shows one pane below ~52em. `public/framework/ext/editor/editor.css`.
**Confidence: low** until B lands.

### D. The ai-dashboard family — do (almost) nothing

Ranks 18/19 and the `core/new/*` pair are `rhythm` and `cramped:blockquote`, and
both are the tool being wrong (see *Tool follow-ups* 1 and 2). The one real
defect in the pictures is at 400: the compose row (`div.ai-compose`) clips its
model select and the effort counts at the card's right edge. That is a wrap, not
a rhythm — `flex-wrap: wrap` on the compose row in
`public/framework/ext/AITask/ai.css`. **Confidence: medium**, unmeasured; it is a
one-line change to a component only the dashboards use.

### E. The A-grade defects (small, real, cheap)

- `/notes/git-branch-names/` at 400: `public/styles.css:164` —
  `.md td:first-child { white-space: nowrap; }` gives the first column 321px of a
  400px screen; the second column is 98px and its right edge lands at **448px**,
  48px off-screen, with `scrolls_sideways: false`. Add
  `@media (max-width: 40em) { .md td:first-child { white-space: normal; } }`.
  **Confidence: high** (measured in the DOM; unmeasured for score, which will
  barely move — the tool never saw it).
- `/framework/ext/`: the **Editor** preview card renders no surface — four stray
  "Text" labels on the page background with the title below the grid row, where
  every sibling is a 258×142 white tile. Cause is a live thumb: `Page.css:159`
  drops a thumbed card's surface by design ("the render is already the card"),
  and `ext/editor/page.js:327`'s `zoom-25 editor-thumb` renders an empty document,
  so there is no card left. Either give the editor thumb a seeded document or let
  it fall back to a plain card. **Confidence: high on the diagnosis, open on the
  fix** — this is `ext/editor`'s call.

## Where the picture and the numbers disagree

Three of these are findings about the evidence, not about the site.

1. **The screenshots cannot show the site's worst bug.** They are *full-page*
   captures, which expand the viewport — so an `overflow: hidden` region stops
   clipping and every `/web/` page photographs perfectly. The failure only appears
   in a 900px-tall viewport shot. Any future crawl should capture the viewport,
   not the page, when the finding is about reachability.
2. **The screenshots are capped at 3000px.** The ai dashboards run 10,000–60,000px
   tall, so ranks 17–19 are documented by a picture of their top 5% — which happens
   to be the same shared rail on all three. The measured findings for those pages
   sit below the capture entirely.
3. **Rank 1's headline is real but invisible.** The 0px × 2403px timeline entry is
   inside a pane that scrolls internally, so no screenshot at any width shows it;
   what a person actually sees is the *same* disease one level up — a stat label
   breaking mid-word in a 134px pane. The number is right; its description is not
   what to look for.
4. **Ranks 17, 18, 19 look fine.** Verified at 400 and 3440. See the fix family D.

## Clean by the numbers, wrong to the eye

Only **7 pages score ≥88 at all three widths**. Five checked with my own
viewport screenshots at 400/1920/3440:

| page | grade | what the tool cannot see |
|---|---|---|
| `/framework/ext/` | 92/A ×3 | the Editor card has lost its surface (above). `probe.js:20` puts `.page-preview-thumb` in `IGNORE`, so **nothing inside any live thumb is ever measured** — a policy, but it means a broken card is structurally invisible |
| `/notes/git-branch-names/` | 95/A at 400 | a table clipped 48px off-screen, its right column laddering 2–3 characters a line. `measure`'s ladder branch exempts cells (agent E's fix #3) — the guard that removed 173 false positives removed this true one with them |
| `/notes/` | 90/A at 3440 | three cards and one sentence in the top-left corner of a 3440×900 screen; `width_used: 27.21`. `dead-space` fires at `med` and costs ~4 points by design. Against the prime objective ("widescreen space gets *used*") this is a failing page with an A |
| `/web/layout/` | 99/A at 400 | the card strip is sliced mid-card at the right edge with no scroll affordance. Correct by the scroller exemption; still the first thing you see |
| `/web/nav/` | 99/92/89 | nothing — genuinely good at all three widths |

Two candidates for the blind-spot list, on top of the two already known
(scroller-in-a-wrapping-row, pixel padding at 3440):

- **Structure with no painted surface.** The `invisible` rule exists and has never
  fired; the readme says the site never produces such a page. `/framework/ext/`
  does, and `IGNORE` is why the rule cannot reach it.
- **Under-use of a widescreen.** 27% of 3440 scores an A. If the prime objective
  is what the tool serves, `dead-space` is under-weighted at the widest width —
  worth a threshold that scales with viewport rather than a flat medium cap.

## Dead links — 143 real, not 181

Navigation, not layout. Ordered by how many pages carry the link.

| urls | linked from | family | who emits it |
|---|---|---|---|
| 52 | 355 | `core/new/1/site/*` demo-app hrefs | **by design** — a demo app's internal routes; not a defect |
| 13 | 94 | `/web/` topic stubs (`/web/html/`, `/web/css/`, `/web/js/`, `/web/a11y/` …) | prose in `core/Page/*` and `ext/catalog`; the topics were never built. Write them or unlink them |
| 2 | 109 | `/framework/audit/modules/` (+ one child) | a renamed-away page still linked from 22 corpus pages |
| 41 | 27 | `<page>/docs/<name>/` — `/framework/ext/Ask/api/docs/shot/`, `…/docs/docs/shot/`, `…/docs/shot/docs/shot/` | a **relative** href in doc prose, re-resolved against whatever route you are on. Root-absolute hrefs fix the family |
| 20 | 10 | `undefined` in the href — `/framework/ext/tabs/undefinedwhy/` | `ext/tabs/tabs.js:46`: `.href(… this.url + name + "/")` where `this.url` is undefined for a Page inside a demo tree that the real Router never adopted. Guard it |
| 17 | 84 | singles | `ext/AISession/` (renamed to `ext/AITask`, 67 pages), `core/Pager/`, `styles/layouts/cards/`, `ext/LayoutTool/addressing/`, four `ext/Draggable/doc/*` |

**Correction to `recrawl-report.md`.** Its top family — "36 urls emitted by ext/Doc
nav across 18 modules" — is neither. The census normalised every url to a
directory (there is not one `.md`, `.png` or `.json` url in `dead-final.json`),
so `<module>/doc/` is the stripped form of a link nobody writes. What the site
actually links is `<a href="/framework/ext/LayoutTool/doc/cost.md">`, from
markdown prose (`md.resolve` leaves `.md` hrefs alone) — and that returns **200
`text/markdown`**. 38 of the 181 are this: real files, reachable, just presented
as raw text outside the app. That is a presentation decision worth making on
purpose (render `.md` routes through `md.file`, or link the doc page instead),
not 38 broken links.

## Tool follow-ups

`recrawl-report.md` lists five suspects; they stand. Three more from this pass:

6. **`cramped` on `blockquote` is a false positive, and it is expensive.** 32 of
   the site's 47 `cramped` findings are a blockquote (directly or rolled up
   through `div.md.flow`), all `high`, on 7 pages — three of them in the top 20.
   Measured on `ai/2026-08-11/`: the blockquote is `padding: 0 0 0 1em` with a 3px
   `border-inline-start`; text sits 18px from the left and 0px from the other
   three edges, because **a rule on one side is not a frame**. The guard is to
   measure only edges the box actually paints (a border or a background on that
   side).
7. **`width_used` and `scrolls_sideways` contradict each other.** 165 of 205 pages
   report `width_used > 100%` at 400px, and `scrolls_sideways` is `false` on every
   single one. One of the two is wrong — and on `/notes/git-branch-names/` the
   content genuinely lands 48px off-screen, so it is probably `scrolls_sideways`
   that never fires. It also changed at 0 of 90 sweep edges. Two metrics, no
   signal.
8. **The cell exemptions over-corrected.** `measure`'s ladder branch and
   `cramped`'s table guard are both right on the mass case and both now miss the
   one real table failure on the site (E, above). A narrower guard: exempt a cell
   only while its table fits its container.

Also worth wiring, from this pass rather than the last: the crawler should shoot
the **viewport**, not the full page, whenever the leading finding is `unreachable`
or `clipped` — otherwise the evidence contradicts the finding (see disagreements 1
and 2).

## Method

Ranking from `scan.jsonl` (min score across 400/1920/3440, 205 pages). Every page
in the table was opened as a picture with vision; every proposed declaration in
families A and B was **injected into the live page on `:80` and re-measured** with
the same `analyze()` the crawl used, controls included — the numbers in those
tables are measurements, not estimates. Families C, D and the timeline note are
diagnoses without a measured fix and say so. DOM verification (ancestor chains,
computed overflow, pane widths, cell geometry) was done with Playwright against
the dev server; nothing in `public/` was edited except this file and one linking
line in `ext/LayoutTool/audit/page.js`.
