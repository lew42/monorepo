# 2026-08-11 — The measure doctrine, and previews as nav

> **Status: analysis only.** Nothing in this file has shipped. It is written to be
> executed cold by other agents: every verdict carries the measurement that forced
> it, and every task names its files.

Two complaints, one cause. *"`styles/elements/forms` is way too narrow on a 3440
monitor — and it's a major problem with a lot of the pages"* and *"layouts,
sections, ui, elements overlap; from `/framework/` you should see a quick tree of
most things"* are the same bug seen twice: **the site was tuned at 1600 and it
does not know that the screen got bigger.**

Everything below was measured in a real browser against the dev server on port 80
— 166 routes, at 3440×1440 and 1600×900. Raw data and the scripts are in the
session scratchpad, not the repo.

---

## 0. The two numbers everything else follows from

```css
/* framework.css:139 */
font-size: clamp(0.875rem, max(0.82rem + 0.15vw, 0.58rem + 0.35vw), 1.125rem);
```

| | 1600×900 | 3440×1440 | growth |
|---|---|---|---|
| viewport | 1600 | 3440 | **×2.15** |
| sidebar | 236 | 274 | ×1.16 |
| region (`.pages`) | 1364 | 3166 | **×2.32** |
| `1em` | 15.52px | 18.00px | **×1.16** |

**The type ramp hits its `1.125rem` ceiling at a ~2491px viewport.** Past that
point *nothing expressed in `em` grows again* — and every width on this site is
expressed in `em`. So from 2491px upward the region keeps widening and the
content is frozen. A 3440 monitor is 38% wider than the point where the site
stopped responding.

That is the whole mechanism. It is not a bug in any page.

---

# Part A — the measure doctrine

## A1. The census: 166 routes, measured

`ink` = the bounding box of a page's visible top-level blocks. `fill` = ink ÷ region.

| fill @3440 | routes | what they are |
|---|---|---|
| **14–30%** | 70 | default grid pages — prose, and prose-with-exhibits |
| **34–45%** | 24 | index pages: a `previews()` wall on the `wide` track |
| **95–100%** | 70 | classdoc roots, `full` Layout pages, section bands, flex/grid word leaves, forms sub-pages |

|  | 1600 | 3440 |
|---|---|---|
| average fill, all routes | **81%** | **63%** |
| average fill, `.page.grid` routes (135 of them) | 76% | **59%** |
| default prose page ink | 807px (59%) | 936px (**30%**) |
| `previews()` wall ink | 1024px (75%) | 1188px (**38%**) |
| widest paragraph, average | 776px | 969px |

**The distribution is bimodal and there is nothing in between.** A page is either
~30% of the screen or ~100% of it. The `wide` track — the one thing that was
supposed to sit between them — adds 217px per side at 1600 (16% of the region)
and 252px per side at 3440 (**8%**). It is a constant, `--breakout: 7em`, in a
unit that stopped growing at 2491px.

### The five worst pages at 3440

| fill | route | ink | what it is |
|---|---|---|---|
| **14%** | `/framework/ext/layout/` | 432px | the page documenting the layout widget renders 432px of content in a 3166px region |
| **19%** | `/framework/styles/layouts/centered/` | 612px | `.measure` = 34em (correct — it *is* the centered layout) |
| **19%** | `/framework/styles/layouts/stack/` | 612px | same, but stack is not about being narrow |
| **28%** | `/framework/styles/layouts/split/` | 900px | **a two-pane split layout, demonstrated 900px wide on a 3440 monitor** |
| **30%** | 45 prose+exhibit pages | 936px | every `demo()` box on the site, frozen at the reading measure |

And the landing itself: `/framework/` paints its content into a 1080px
left-aligned column. **72% of a 3440×1440 viewport is empty grey.**

### The exhibit that argues against itself

`styles/layouts/page.js:32` — *"they respond to the width of the box, which is
why the same class string is correct in a sidebar, in a card, and across a 3440px
monitor."* At 3440 that page demonstrates it inside a 546px stage. Every
`demo()` on `/framework/styles/layers/util/` (15 of them) renders `flex gap` with
four cells in a 936px box with 2200px of grey beside it.

## A2. Question: should the 52em main track scale up on very wide viewports?

| option | weighing |
|---|---|
| a step at 2500px → 60em | 52em at the 18px ceiling is **936px ≈ 104 characters**, already at the top of the readable range. 60em would be 1080px ≈ 120 characters. This makes the one thing that is currently *right* worse. |
| `clamp()` on `--measure` | same objection, continuously |
| **leave `--measure` alone; make `--breakout` responsive** | ✓ |

**Verdict: the main track does not scale. Ever.** Nobody has ever complained that
a paragraph was too narrow. The complaints are *"the exhibit is too narrow"* and
*"the page is empty"*, and those are two different fixes. Record this as a *keep*
verdict — it will be re-litigated.

## A3. Question: what should `--breakout` be?

Tested live, by setting the property on a real grid page and measuring a probe:

| formula | wide @1600 | wide @3440 |
|---|---|---|
| `7em` (today) | 1024px (75% of region) | 1188px (**38%**) |
| `max(7em, (100% - 96em) / 4)` | **1024px (75% — unchanged)** | **1655px (52%)** |
| `max(7em, (100vw - 1600px) / 5)` | 1024px (75% — unchanged) | 1672px (53%) |

**Verdict: `--breakout: max(7em, (100% - 96em) / 4)`** in `.page.grid`
(`Page.css:72`). The percentage resolves against the grid container, so it is
region-relative rather than window-relative and stays correct inside a tab panel
or a catalog region. Below a ~1700px viewport it is *byte-identical* to today —
the `max()` floor means no laptop sees any change at all. Verified in the browser;
percentage track sizing inside `minmax()` does work here, but re-verify after the
edit, because this is exactly the class of thing that silently drops a template.

## A4. The doctrine: four page kinds, one rule

> **The measure is for reading. Anything you *look at* rather than *read* leaves
> the measure.**

That single sentence derives every case. The kinds are how you apply it:

| kind | the test | page shape | where the blocks go |
|---|---|---|---|
| **prose** | body is text, top to bottom; code blocks are quoted, not exhibited | default `grid` (declare nothing) | everything on `main` |
| **prose + exhibits** | ≥1 block that is a *layout, a wall, a live component, a stage, or a table over 3 columns* | default `grid` | prose on `main`, **every exhibit on `wide`** |
| **index / gallery** | body is `previews()` or a wall of children | default `grid` | title + caption on `main`, **the wall on `bleed`** |
| **screen** | no prose at all — a Layout, a section band, a catalog, a live tree | `full` (+ `fill` when it owns the height) | no tracks; it is the region |

**The exhibit-heavy question, answered:** a page whose content is *mostly*
`.wide`/`.bleed` blocks still keeps the default grid. Its title, its captions and
its "next:" line are prose and still want the measure; the exhibits opt out
per-block. Only a page with **no prose at all** is a screen. Concretely: 45 pages
look like they want to be `full` and none of them do — they want their demo boxes
to stop being 936px.

**The corollary that saves the work:** a page should almost never type a width.
The *block* knows what it is. `previews()` knows it is a wall; `demo()` knows it
is an exhibit; `catalog()` knows it is a screen. So the doctrine is enforced in
**three methods, not eighty-seven pages.**

## A5. The three edits that fix ~60 pages

### (1) `previews()` takes the bleed track — `Page.class.js:185`

```js
div.c("page-previews wide", …)   →   div.c("page-previews bleed", …)
```

Measured, by toggling the class on the live wall:

| index | 3440: wide → bleed | 1600: wide → bleed |
|---|---|---|
| `/framework/ui/` (19 cards) | 1188px, 3 col, **13/19 above fold** → 3166px, 9 col, **19/19** | 1024px, 3 col, 8/19 → 1364px, 4 col, **11/19** |
| `/framework/styles/sections/` (15) | 4 col → **11 col** | 4 col → 5 col |
| `/framework/styles/elements/` (7) | 4 col → 11 col | 4 col → 5 col |
| `/framework/core/`, `/framework/ext/` | 4 col → 11 col | 4 col → 5 col |

Card width barely moves (381→332 at 3440; 329→326 at 1600) because `auto-fill`
holds the track near `--column`. **The entire nineteen-component gallery becomes
one screen.** No regression at 1600 — every wall gains a column.

Two things to check when doing it: `Page.css:107` carries a comment claiming
`bleed` "would spend the page's own inset and put the left column against the
sidebar" — that comment is now the verdict being overturned, and the measurement
above says the wall lands inside the page's own padding, not against the sidebar.
Confirm at 400px too. And `styles/layouts/`'s wall is nested inside a
`demo.stage` (546px), so it will not change — that page needs T7, not this.

### (2) `--breakout` responsive — `Page.css:72`

Per A3. Fixes every `.ac("wide")` already in the tree (12 pages) at no call-site cost.

### (3) `catalog()` applies its own bleed — `ext/catalog/catalog.js`

`styles/elements/forms/page.js:155` is the only call site that knows to write
`.ac("bleed")`, and the comment beside it (*"the rail + detail take the whole
window, not the measure"*) is a doctrine statement living at one call site. Move
it into the method; drop the `.ac("bleed")` from forms. A catalog is a screen —
it is never anything else.

### And one that is bigger: `demo()` on the wide track — `ext/demo`

An exhibit is the kind's whole definition. `demo()` / `demo.stage()` should carry
`wide` by default, with an opt-out for the tutorial pages where the box genuinely
is a quoted aside. This is 30+ pages of visual change in one edit, so it is a
proposal, not a gimme — see T4.

## A6. Violations, named

**Class 1 — indexes whose wall is capped (fixed by edit 1, no per-page work):**
`/framework/`, `core/`, `styles/`, `styles/elements/`, `styles/layers/`,
`styles/layers/theme/`, `styles/layouts/flex/`, `styles/layouts/grid/`,
`styles/sections/`, `ui/`, `ext/`, `util/`, `dev/`, `ai/`,
`start/example/about/`. **15 pages, zero page edits.**

**Class 2 — prose+exhibit pages frozen at 936px (fixed by edit 2 + T4):**
`styles/layers/util/` (15 demos), `styles/layers/base/` (9 side-by-side
compares — the densest comparison layout on the site, at 936px),
`styles/layers/theme/`, `theme/guide/`, `theme/lew42/`, `styles/elements/{text,
lists, code, table, media, misc}`, `ext/{demo, highlight, markdown, tabs, toc}`,
`core/Page/{flow, nav, children}`, `core/{View, Sidebar}` intros, `util/{is,
markup, source}`, `faq/`, `versus/`, and all 19 `ui/*` leaves (each opens with a
`palette()` multi-column grid at 936px). **~45 pages, zero page edits.**

**Class 3 — pages that must be edited by hand:**

| page | today | should be |
|---|---|---|
| `styles/layouts/split/` | `classes: "flex v gap"` → 900px | `classes: "full flex v gap"` — a split layout must be shown at split width |
| `styles/layouts/stack/` | `classes: "flex v"` → 612px | keep `.measure` inside, but the page goes `full`; the stack is not the narrowness |
| `styles/layouts/centered/` | `classes: "flex v"` → 612px | **correct as-is** — the page *is* the centered layout. Record it as a deliberate exception, or the next audit will "fix" it |
| `styles/layouts/{cards,dashboard}/` | `pad …` → 1404px via a `.measure` 78em wrapper | fine, but the 78em wrapper is a fourth width vocabulary; fold into `--measure` |
| `ext/layout/` | 432px ink, 14% | the widget page must demonstrate the widget at width — see T7 |
| `/framework/` | 1080px, left-aligned, 72% empty | see Part B |
| `styles/layouts/`, `layouts/flex/`, `layouts/grid/` | `classes: "grid"` | **no-ops** — the grid is the default since 2026-08-10. Delete all three. (Eleven such redundancies were deleted then; these three were missed.) |

**Two families cannot honour a page-level doctrine at all**, because they build
their own root element: the 7 classdoc pages (`ext/classdoc/classdoc.js:167`) and
the 8 `Layout` pages (`styles/layouts/Layout.js:11`). Both currently land at
95–100% fill, so they are not in violation — but any doctrine written as "pages
declare X" is unenforceable for 15 of 87 pages. That is a second reason to put
the rule in the *blocks*.

**Two anomalies to verify, not yet asserted:**
`/framework/core/View/doc/` and `/framework/dev/Socket/` both reported *no active
page* at both widths (their sub-routes render fine). And discovery turned up a
live route `/framework/styles/sections/readme.md/` rendering a 900px default —
almost certainly a relative markdown link that the router accepted.

---

# Part B — information architecture: previews as nav

## B1. Nav-shape census

| shape | count | where |
|---|---|---|
| **card wall** — `previews()` | 16 pages | `/framework/`, core, styles, styles/{layers, layers/theme, elements, layouts, layouts/flex, layouts/grid, sections}, ui, ext, util, dev, ai, start/example/about |
| **left rail** — `catalog()` | 6 pages | the Overview tab of View/Page/Router/App/Sidebar (`classdoc.js:148`) and `styles/elements/forms/` (`forms/page.js:155`) |
| **`toc()` + prose** | 18 pages | faq, versus, start, and most leaves |
| **its own third wall** — `palette()` | 19 pages | every `ui/*` leaf (`ui/parts.js:19`) |
| **nothing** | the rest | leaves |

**Four independent mechanisms render "a labelled small render":** `previews()`,
`demo.page()` (forms only), `word()` (flex/grid only), `palette()` (all 19 ui
pages). Only the first two produce urls. The 08-09 rule said one preview; there
are four again, because three of them predate it and were never converted.

## B2. The overlap map

| # | collision | evidence |
|---|---|---|
| 1 | **Thirteen pages answer "how do I lay out a page"** | `styles/layouts/fit`, `styles/layouts/`, the 8 layout leaves, `layouts/flex`+`grid`, `styles/layers/util`, `styles/sections`, `styles/`, `core/page.js` §"There is no layout tier", `core/Page/flow`, `core/Page/doc/layout`, `core/Page/overview/shapes`, `ext/layout`. Six of them teach the identical five words. |
| 2 | `styles/layouts/split` ⟷ `styles/sections/split` | **same name, same class string (`flex gap auto`), two urls** |
| 3 | `styles/layouts/cards` ⟷ `ui/card` ⟷ `Page.previews()` | same picture, three implementations. `cards/page.js:6` and `ui/card/page.js:6` are the *same five classes in a different order*. Neither links to the other |
| 4 | `styles/layouts/dashboard` ⟷ `core/Page/overview/dashboard` | two `/dashboard/` urls in one docs site, unrelated content |
| 5 | the stat tile exists **four** times | `layouts/dashboard` `tile()`, `ui/stats` `stats()`, `sections/parts.js:59` `stat()`, `versus/page.js:14` `stat()`. `ui/stats/page.js:45` names three of them and concludes the function shouldn't exist |
| 6 | `styles/elements/table` ⟷ `ui/table` | `.ui-table{width:100%}` exists only to undo `framework.css`'s `table{width:max-content}`. Neither page links to the other |
| 7 | `styles/elements/forms` ⟷ `ui/{field,tags,toolbar,progress}` | forms has 10 sub-pages including `meter` (which covers `<progress>`); `ui/progress` documents `<progress>` again |
| 8 | the four-layer table is printed twice, near-verbatim | `styles/page.js:35` and `styles/layers/page.js:22` |
| 9 | `styles/layouts/sidebar` ⟷ `holy-grail` | **one `basis` apart**, and `flex/page.js:39` says so in prose |
| 10 | `styles/layouts/` ⟷ `ui/` | **zero links in either direction**, despite #3 |

**Where the boundary actually is** (and it is defensible — say it once, in one
place, and cross-link):

- `styles/layers/` — **the cascade.** Four layers. Not visual.
- `styles/elements/` — **what the base theme does to bare HTML.** No classes.
- `styles/layouts/` — **the arrangement vocabulary.** Class strings, no content.
- `styles/sections/` — **those layouts with real content in them.** The band is the unit.
- `ui/` — **components.** A thing with a name, a state, or a relationship.
- `core/Page/overview/demos/` — **the page tree**, arranged. Not about CSS at all.

The collisions are all boundary leaks in one direction: `layouts` grew content
(`cards`, `dashboard`, `stack`'s form) and `sections` grew arrangements (`split`).

## B3. Preview design, answered with measurements

**Do cards need external titles, or a label inside the preview?**
**External, always — this is structural, not aesthetic.** The thumb is
`pointer-events: none` and the label *is* the anchor (`Page.css`; the
`::after` spreads it over the card), because a live render inside an `<a>` would
be an anchor in an anchor and the browser un-nests it silently. `Router.mark_links()`
only marks anchors, so a label inside the thumb loses `.active` too. And at
`zoom-25` a 14px in-thumb label paints at 3.5px. There is no version of the
in-preview label that works.

**How small can a preview be and still read?** Measured by re-flowing
`/framework/ui/`'s nineteen live cards at three track widths, at 3440:

| `--column` | card | columns | above fold | verdict |
|---|---|---|---|---|
| 18em | 332px | 9 | 19/19 | **comfortable** — the current ui setting |
| 14em | 267px | 11 | 19/19 | **the floor.** Every label reads, every render is still recognisable |
| 11em | 205px | 14 | 19/19 | **fails.** Timeline renders one letter per line; Data table clips its columns; Dialog clips its buttons |

**Verdict: `--column: 14em` is the floor for a live-render thumb, 18em the
default for one; the 14em framework default stands for icon-and-label cards.**
Below 14em the wall gets denser and stops being a preview.

**How many fit above the fold?** With the bleed wall (edit 1):

| | 1600×900 | 3440×1440 |
|---|---|---|
| `/framework/ui/` 19 live cards @18em | 11 (was 8) | **19 (was 13)** |
| `/framework/styles/sections/` 15 @14em | 12 (was 10) | 15 |
| a 14em wall generally | 5 columns | **11 columns** |

So at 3440 an index of up to ~30 cards is one screen. **That is the number that
decides the depth rule below.**

**Which previews first?** The `children:` string is already nav order, so the
rule costs nothing to enforce: **simplest first, and the order you would teach
them in.** `ui/`'s current order (`table field crumbs pagination card stats badge
alert toolbar tags panel tooltip avatar dialog progress menu accordion timeline
kbd`) is neither alphabetical nor pedagogical — it is the order of the review
table in the 08-09 proposal. Regroup it.

## B4. Question: how deep, and when does a category earn a level?

| option | weighing |
|---|---|
| depth by taste | what produced 4 mechanisms and 13 layout pages |
| "the rail shows depth-1 with expansion" | expansion is a second nav state to design, and the sidebar already expands. Two expanding trees on one screen |
| **a member count threshold, plus a hard click budget** | ✓ mechanical, checkable, and the fold measurement gives the number |

**Verdict, three rules:**

1. **A wall or rail shows depth 1.** Never grandchildren as cards. (`walls()`, below, is the one exception and only an index uses it.)
2. **A directory level is earned at ≥4 members.** Below that, the members are
   *inline object children* of the parent — the mechanism already exists and
   48 pages already use it. Current violations: `styles/layouts/grid/` (3
   children — three words costing a click level), `styles/layers/theme/` (2),
   `dev/` (1 — a section wall of one card, and `catalog.css:21` already
   encodes the same principle: *"a rail of one is not a rail"*), `start/example/`
   (1), `util/` (3, borderline — keep, it is a real namespace).
3. **Three clicks from `/framework/` to any leaf.** Today the deepest live path
   is four: `/framework/ → styles/ → layouts/ → flex/ → wrap/`. `flex` and `grid`
   are not sections, they are *the vocabulary*; their 12 word-leaves belong on one
   page, which removes the level and the collision with rule 2 at once.

Since ~30 cards fit above the fold at 3440, **a wall is not the thing that forces
a level — the level should be forced by meaning, never by count.** The threshold
above only stops levels that carry no meaning.

## B5. The `/framework/` landing: a quick tree of most things

Today: 10 icon-and-label cards, no thumbs, in a 1080px left-aligned column;
72% of a 3440 viewport empty. It shows nothing and links to ten places.

| option | weighing |
|---|---|
| a **category card** whose thumb is a mini-wall of its children | the recursive-gallery idea from 08-09 T3, never built. One overridable method. But at `zoom-25` a section's child names paint at ~4px — you learn *how much* is in there, not *what*. And the thumb can hold no working links |
| a text tree of every page | readable and clickable, but it is a new card shape, and links inside a thumb are dead (`pointer-events: none`) |
| **a stack of ladders — a heading per section, that section's own `previews()` beneath it, bleed** | ✓ |

**Verdict: the landing is a stack of ladders.** Every entry is a real card and a
real link, ~100 of them, at 3440 in 11 columns — literally "a quick tree of most
things", built from block 1 and block 2 and nothing else.

**It is not new work: the site already invented it.** `styles/layouts/page.js:6`
has a local `ladder()` doing exactly this for `flex` and `grid`. Three consumers
now want it (the landing, the layouts index, and any index whose children have
children), which clears the house's two-consumer bar.

**The name needs saying out loud before anything is written.** Proposed:
**`walls()`** — `previews()` is *my children as cards*; `walls()` is *each child's
children as cards, under its name*. Short, obviously related, and it sits beside
the four arrangements the 08-09 session already built (wall / catalog / dashboard
/ strip). **`tree()` is taken** (`core/Page/overview/demos/tree.js`).
`outline()` reads as text. **This needs Mike's blessing before T5 starts** — per
the house rule on naming, and because it adds a method to `Page`.

## B6. Per-section verdicts

| section | children | has visual material? | nav today | verdict |
|---|---|---|---|---|
| `/framework/` | 10 | no (icon cards) | wall, 1080px | **`walls()` ladder stack, bleed.** The landing is the tree |
| `core/` | 5 | low | `toc()` + wall | wall → bleed. Keep `toc()` |
| `core/Page/` | 3 + 14 demos | **highest** | `catalog()` rail (62 cards, 42 above fold at 3440) | **already the model.** This is what previews-as-nav looks like when it works |
| `styles/` | 4 | medium | `toc()` + wall | wall → bleed; **delete the duplicated four-layer table** (keep it in `layers/`) |
| `styles/layers/` | 4 (+2) | **none** | wall | the one section with no visual material — **keep the wall, do not convert.** Inline `theme/`'s 2 children (rule 2) |
| `styles/elements/` | 7 (+10 forms) | yes | wall | wall → bleed. `forms/` is already a rail and is the second model |
| `styles/layouts/` | 11 (3 doc + 8 layouts) | **highest** | two ladders in a 546px stage + a wall | **convert to `catalog()`** — a rail of 8 live layout thumbs beside the layout at full size is the single best previews-as-nav case on the site. Un-nest the ladders from the stage. Fold `flex`+`grid`'s 12 words onto one page (rule 3) |
| `styles/sections/` | 15 bands | **highest** | wall | **convert to `catalog()`.** 15 bands, each a screen — a rail is what you want while comparing them |
| `ui/` | 19 | **highest** | wall @18em | wall → bleed (19/19 above fold). Then **fold `palette()` into `previews()`**: a component's variants become inline object children, so ui becomes recursive and the fourth preview mechanism dies |
| `ext/` | 9 | low | wall | wall → bleed. `ext/layout/` is the worst page on the site (14%) — T7 |
| `util/` | 3 | none | wall | keep as-is |
| `dev/` | **1** | none | wall of one card | **absorb `Socket` into `dev/`** (rule 2) |
| `start/`, `faq/`, `versus/` | 0 | some | `toc()` + prose | prose pages, correctly. `versus/` hand-rolls a stat grid — see overlap #5 |
| `ai/` | 4 | none | wall | keep |

---

# Tasks

Ordered by value ÷ effort. Each is independently landable; T1–T3 are one-line
edits that between them fix ~60 pages, and nothing else depends on them. Every
task ends with its readme/doc updated in the same commit, and is verified in a
real browser at **3440 / 1600 / 400** before it is called done.

### T1 — walls take the bleed track — **S**
`public/framework/core/Page/Page.class.js:185` (`"page-previews wide"` →
`"page-previews bleed"`), and the stale comment at `public/framework/core/Page/Page.css:107`
which currently argues *against* this — rewrite it as the verdict, with the
measurement. *Done when:* `/framework/ui/` shows 19/19 cards above the fold at
3440 (9 columns) and 11/19 at 1600 (4 columns), no horizontal overflow at 400,
and the wall sits inside the page's own inset rather than against the sidebar.
**Fixes 15 index pages with no page edits.**

### T2 — `--breakout` becomes responsive — **S**
`public/framework/core/Page/Page.css:72`: `--breakout: max(7em, (100% - 96em) / 4)`.
*Done when:* a `.wide` block measures **1024px at 1600 (unchanged)** and
**~1655px at 3440 (was 1188)**, and `.page.grid`'s template has not silently
dropped — check that `main` is still 936px at 3440 and that the gutters never go
below 2em. Update `core/Page/doc/layout.md`'s grid-default entry with the new
formula and the reason (the type ramp caps at 2491px).

### T3 — `catalog()` owns its own bleed — **S**
`public/framework/ext/catalog/catalog.js` (add the class in the method);
`public/framework/styles/elements/forms/page.js:155` (drop `.ac("bleed")` and its
comment — the comment's content moves to the method). *Done when:* forms renders
identically and no call site knows about bleed.

### T4 — a demo box is an exhibit — **M**
`public/framework/ext/demo/` — `demo()` and `demo.stage()` carry `wide` by
default; an opt-out for the tutorial pages where the box is a quoted aside. This
changes ~30 pages visually in one edit, so land it alone and screenshot before/after
on `styles/layers/util/` (15 demos), `styles/layers/base/` (9 side-by-side compares)
and `styles/elements/text/` (8). *Done when:* a `demo()` measures 1655px at 3440
and 1024px at 1600, and `styles/layers/base/`'s comparison pairs read at full
width. **Blocked on T2** (without it, `wide` is only 1188px and the change is not
worth making).

### T5 — the landing becomes a tree — **M**, blocked on the name
Add `walls()` to `public/framework/core/Page/Page.class.js` (+ its doc under
`core/Page/doc/method/`), rewrite `public/framework/page.js`'s `content()` to
use it, and replace the local `ladder()` in
`public/framework/styles/layouts/page.js:6` with the method. **Do not start until
Mike has blessed the name `walls()`** (Part B5). *Done when:* `/framework/` shows
every section's children as cards in one screen at 3440, every card is a real
link, and `styles/layouts/`'s ladders are the same method.

### T6 — the layout pages agree on a width — **S**
`public/framework/styles/layouts/split/page.js` → `classes: "full flex v gap"`;
`stack/page.js` → `full`, keeping `.measure` on the inner column;
`centered/page.js` — **unchanged**, with a one-line note in
`styles/layouts/readme.md` recording it as a deliberate exception. Delete the
three no-op `classes: "grid"` declarations in `styles/layouts/page.js:19`,
`layouts/flex/page.js`, `layouts/grid/page.js`. *Done when:* the eight Layout
pages have two width behaviours (screen, and the one deliberate measure) instead
of four.

### T7 — `ext/layout` demonstrates itself — **M**
`public/framework/ext/layout/page.js` is the worst-filling page on the site
(432px ink of a 3166px region, 14%) and its subject is a widget for controlling
layout. Rebuild it render-first: the widget on a bleed stage above the fold,
prose below. Un-nest `styles/layouts/page.js`'s two ladders from their 546px
`demo.stage` at the same time — that stage is why T1 does not reach them.
*Done when:* both pages clear 60% fill at 3440.

### T8 — `styles/layouts` and `styles/sections` become catalogs — **M**
`public/framework/styles/layouts/page.js` and
`public/framework/styles/sections/page.js` → `this.catalog()`. **The blocker to
solve first:** `catalog()` replaces the page body, so the index's own prose has
nowhere to go. Classdoc already solved this (`classdoc.js` relocates the author's
`content()` into an inline `intro` child). **Lift that into `catalog()`: the
parent's own `content()` becomes the first card in the rail.** That one change
makes previews-as-nav a one-line conversion for every index on the site, which is
the whole of Mike's §4. *Done when:* both indexes are a rail + a live detail, the
prose survives as the first rail entry, and `ext/catalog/readme.md` records the
verdict.

### T9 — flatten the levels that carry no meaning — **M**
Per rule 2 and rule 3: fold `styles/layouts/grid/`'s 3 words and
`styles/layouts/flex/`'s 9 onto one vocabulary page; inline
`styles/layers/theme/`'s 2 children; absorb `dev/Socket/` into `dev/`. Every move
is a real url change — leave the old paths resolving or fix every inbound link
(`faq/` alone has 14 outbound links). *Done when:* no live path from
`/framework/` to a leaf exceeds three clicks.

### T10 — one preview mechanism, again — **M**
Fold `palette()` (`public/framework/ui/parts.js:19`, used by all 19 ui leaves)
into `previews()` by making a component's variants **inline object children**.
Same for `word()` (`styles/layouts/flex/word.js`) if T9 has not already removed
it. *Done when:* `previews()` and `demo.page()` are the only two things on the
site that render a labelled small render, and `/framework/ui/table/`'s three
variants are three urls.

### T11 — settle the overlaps — **M**
One decision each, recorded in the owning readme, then executed: #2
`layouts/split` vs `sections/split` (proposal: sections' band is renamed, since
layouts owns the vocabulary); #3/#10 `layouts/cards` ⟷ `ui/card` ⟷ `previews()`
(proposal: `layouts/cards` becomes the canonical page and `ui/card` links to it —
and the two sections get cross-links, which they have *none* of today); #4
`layouts/dashboard` renamed to avoid the second `/dashboard/`; #5 the stat tile's
four copies collapse to one; #8 delete the duplicated four-layer table from
`styles/page.js:35`. *Done when:* each collision has a written verdict and one
implementation.

### T12 — verify — **S**
Crawl `/framework/` at 3440 / 1600 / 400: no console errors, no failed requests,
**no horizontal overflow** (the current crawl reports zero — keep it that way),
and re-run the fill measurement. Target: average fill at 3440 above **80%**, from
today's 63%. Chase the two anomalies in A6 (`core/View/doc/`, `dev/Socket/`
reporting no active page; the stray `/framework/styles/sections/readme.md/`
route). Wire this file into `public/framework/ai/2026-08-11/page.js` with
`md.file(import.meta, "proposal.md")` — **it is not linked from anywhere yet.**

---

## T12 — verification, after T1 / T2 / T4 / T5 landed

168 routes, crawled at **3440×1440, 1600×900 and 400×800** against the dev server.
504 route-loads.

| | before | after |
|---|---|---|
| average fill @3440 | 63% | **76%** |
| average fill @3440, `.page.grid` (137 routes) | 59% | **74%** |
| average fill @1600 | 81% | **89%** |
| average fill @400 | — | 93% |
| horizontal overflow, any width | 0 | **0** |
| routes failing to render | 2 (below) | **0** |
| routes with a console or request error | — | **1** (below) |
| routes that got *worse* | — | **0** |

**The 80% target was not reached, and the last four points are structural.**
Nineteen routes carry no `.wide` or `.bleed` block at all — they are pure prose,
and A2's keep verdict says the main track never scales, so 936px of a 3166px
region is **the design, not a violation**. They average 32%; **the other 149
routes average 82%.** Even a perfect 100% on all 149 caps the all-routes average
at 92%. The honest number to track is the 82%, and the remaining lift belongs to
T3, T7 and T8 — `ext/layout/` is still 30% at 3440, exactly as T7 says.

### The two anomalies, chased

**`core/View/doc/` and `dev/Socket/` reporting no active page — not a bug.** Both
render correctly at every width; the report was a **measurement artifact**. The
crawler waited 500ms after `.page.active-page` appeared, and these two classdoc
trees occasionally exceeded the 6s selector timeout on a cold navigation. At a
1800ms settle both resolve, and the new crawl reports zero no-active-page routes
at all three widths. Nothing to fix.

**The stray `/framework/styles/sections/readme.md/` — a real broken link, and a
class of them.** It is not a route: it renders the app's 404 page. The source is
`styles/readme.md:67-70`, which links its sibling records as ordinary relative
markdown — a link whose target is `sections/readme.md`. `md()` resolves that
against the *document* url, producing an absolute `/framework/styles/…/readme.md`
anchor, and the Router intercepts the click and 404s. **Fifteen such links exist,
across three files** (`styles/readme.md`, `styles/layouts/readme.md`,
`ext/markdown/readme.md`). Left unfixed deliberately: two of the three files are
owned by other work in flight, and the right fix is one decision about what a
`.md` link *means* in rendered prose — let the Router pass it through to the
static file, or rewrite these to page urls — not fifteen edits.

---

## Open questions for Mike

1. **`walls()`** — the name, per B5. T5 is blocked on it.
2. **T4 is the big visual change.** Every `demo()` box on the site gets wider.
   Land it, or keep demos at the reading measure and only free the *walls* and
   *catalogs*?
3. **T8's premise** — the parent's `content()` becoming the first rail card is a
   real change to what `catalog()` means. It is also the only thing that makes
   "previews as nav everywhere" a one-liner. Agreed?
4. **`styles/layouts/centered`** renders 612px on purpose. Confirm it stays, so
   the next audit does not "fix" it.
