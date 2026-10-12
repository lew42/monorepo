# One layout system — the census, and the plan that makes ONE of them

**What this is.** The site has nineteen places that answer "how is a page arranged". Nine of them
are catalogues of the same shapes written out again; three are demo chrome; two are editors that
overlap almost completely. This is the census of all nineteen, and the plan that turns them into
**one demo system (`demo`), one `core/Layout`, one `core/Section`, and one rule checker** — porting
the shapes that already exist rather than inventing a thirty-first.

**The headline, before any detail.** Nothing here needs a new catalogue. `/imagine/layouts/system.js`
already holds eighteen layouts as *data* — columns, CSS, boxes, when to use it — in almost exactly
the shape `core/Layout` wants. `styles/layouts/` holds thirty-three more as pages.
`ext/DesignTool/library/` holds eleven measured. **The first thirty layouts are a port, not a
design job.** What is genuinely new is small: a size rule, a fixture harness, and one `Section`
class.

**And the rule list is three items, not a system.** Most of what looks like a layout rule is CSS —
the measure holds and centres, the three spacing ramps follow the box, `auto-fill` counts its own
tracks. What CSS genuinely cannot fix is a multi-column layout crammed into a 300px column, a dark
island on a dark band, and two mechanisms cancelling each other. That is the whole deny list. §4
says which of the owner's worries CSS already answers, line by line.

**The one sentence that decides everything else.** *A layout is the arrangement of boxes and owns
no content* (the owner, addendum 2). That is why the tree can render thirty layouts without writing
thirty pages of prose: it pours the same six fixtures into every layout's slots. It is also the
approval test — a layout that only looks right with particular content is a draft page, not a
layout.

---

# 1 · The census

One row per directory opened. **Nineteen rows, nineteen directories.** "Importers" is a count of
files that `import` from it, outside itself (`grep -rln 'from "…<dir>/'`).

| # | thing | where | importers | alive? | what it becomes |
|---|---|---|---|---|---|
| 1 | **ext/layout** — a toolbar over any box, a right drawer, a word registry (`layout.words`) | `framework/ext/layout/` | **12** | **alive, and load-bearing** | **stays exactly where it is.** It is the *control surface*, not a layout catalogue. `core/Layout` links to it; nothing moves. |
| 2 | **ext/Playground** — a layout editor: select a box, five insert targets, a properties column, fs-saved documents | `framework/ext/Playground/` | **0** | routed only from `ext/page.js:9` | **frozen at slice C, deleted after `core/Section`'s picker ships.** 1,895 lines whose whole job — select a box, change its arrangement, see it live — is what Section's overlay does with an approved list instead of freehand CSS. |
| 3 | **ext/Panel** — 12 drag/split/resize gestures over a panel tree, `structure(seed)`, persistence | `framework/ext/Panel/` | **7** | alive | **stays.** It is an *app* surface (a workspace you arrange at runtime), not a page surface. Out of scope; it is named here so nobody merges it by mistake. |
| 4 | **ext/Panel/Workspace** — the "workspace" the owner named: a Panel root, documents as files, N viewports on one root | `framework/ext/Panel/Workspace/` | 1 (its own parent) | alive | **stays, and loses the word.** 545 lines. Its viewport set is `ext/demo/pane.js` already. "Workspace" stops being a demo word; it is Panel's document shell and nothing else. |
| 5 | **ext/demo** — the site's one example mechanism: `demo()`, `page.demo()`, `stage`, `app`, `exhibit`, `mini`, `pane`, `sample`, `layout` | `framework/ext/demo/` | **202** | alive, dominant | **it is the one demo system.** Gains a title and a footer; loses `layout.js` to `core/Layout`. |
| 6 | **ext/catalog** — `catalog()` (rail beside a child) and `browse()` (filterable wall of bands) | `framework/ext/catalog/` | 8 | alive | **the tree's index mechanism.** `browse()` (143 lines) gains prop facets and a page cap; nothing else changes. |
| 7 | **ext/DesignTool/library** — eleven arrangements written as a page would write them, each measured in real iframes at 400/1280/1920/3440, with a "don'ts" wing | `framework/ext/DesignTool/library/` | 2 | alive | **the fixture harness, and eleven of the thirty.** `entry.js`'s iframe measurement IS deliverable 17's proof run. |
| 8 | **styles/layouts** — thirty-three whole-page layouts, one dir each, on one `browse()` wall in four bands | `framework/styles/layouts/` | 4 | alive | **the source of most of the thirty**, and the wall becomes `core/Layout`'s tree. `full.js` and `word.js` fold into core. |
| 9 | **styles/sections** — sixteen marketing bands (hero, pricing, faq, footer…) plus `tone.js`'s four tones | `framework/styles/sections/` | 3 | alive | **fixture content, not layouts.** A hero *is* content in a 1-column layout. It becomes the realistic fixture set beside the synthetic ones. |
| 10 | **styles/rules** — five layout dos-and-don'ts, one page each, with demos that measure themselves | `framework/styles/rules/` | 2 | alive | **LayoutRules' prose home.** The checker links a violation to the rule page that explains it. |
| 11 | **styles/stacks** — every fill on every floor, measured; the alpha ladder | `framework/styles/stacks/` | 1 | alive | **the contrast deny-list's data.** `hunt.json` already holds the measured zero-delta pairs — the "black on black" rule does not need inventing. |
| 12 | **styles/elements** — code, forms, lists, media, table, text | `framework/styles/elements/` | 1 | alive | **the elements the owner named.** No new word, no new module (addendum 2). |
| 13 | **styles/doc/layout-system.md** — the five words `page rail wall stage solo` | `framework/styles/doc/` | — (docs) | alive | **the vocabulary every ported layout compiles to.** Unchanged; `core/Layout` cites it. |
| 14 | **core/Page** — `Page.class.js` (772), `Page.css` (945), `Frame.js` (214, landed today), the six width words, `store()`, `Page.from(json)` | `framework/core/Page/` | everything | alive | **the seam.** `Layout extends Page`, `Section extends Page`, both riding `Page.Frame`. |
| 15 | **/imagine/layouts** — eighteen numbered layouts as DATA (`system.js`: `id n title intro when rules boxes word config split`) drawn by a 3-column card | `public/imagine/layouts/` | 3 | alive | **the catalogue core/Layout ports.** `system.js` ENTRIES → `core/Layout/layouts.js` nearly verbatim. `LayoutsCard.js` (373) → the Layout page's default render. |
| 16 | **/imagine/sections** — `SectionsBand`: head · side · main · aside · notes · foot, 2–4 columns, framed | `public/imagine/sections/` | 2 | alive | **the prototype of `core/Section`.** 524 lines; the class name dodging (`SectionsBand`, not `Section`) is a warning core must heed. |
| 17 | **/imagine/paging** — `blocks.js` `ARRANGEMENT` (7 shapes) + `LAYOUTS` (4 numbered targets) + `SURFACES`/`TYPE`; `make/` writes `page.json` | `public/imagine/paging/` | 9 | alive | **graduating already** (graduate-plan slices 1–3). `make/` is the template writer deliverable 2 rides on. |
| 18 | **/imagine/design/layout/approved** — the closed set of FIVE, each with floors and ceilings and a screenshot | `public/imagine/design/layout/approved/` | 0 (a page) | alive | **the approval bar, verbatim.** Two of its three promises (floors-and-ceilings, clamped spacing) are CSS's job; the third — no page improvises a sixth shape — is the deny list's reason to exist. |
| 19 | **/imagine/design/vocabulary** — 29 tags on 4 axes (navigation 11, shell 7, content-kind 8, scroll 3) | `public/imagine/design/vocabulary/` | 0 (a page) | alive | **the filter facets.** `tags:` on a layout page is a subset of `axes` in `tags.js`. |

## What the census actually found

**Three findings worth the whole read.**

1. **`ext/layout` is not dead.** The brief said one importer; there are **twelve files and seventeen
   import sites**, including `styles/layouts/word.js:2`, `styles/sections/tone.js:2`,
   `ext/editor/page.js:6`, all three `web/layout/*` pages, and — the one that matters —
   `ext/demo/shell.js:7`, which is why every demo on the site can wear a control bar. Deleting or
   renaming it breaks the demo system. **It is also not a rival to `core/Layout`:** it steers a live
   box's words; `core/Layout` catalogues arrangements. Two different jobs that share four letters.

2. **There is no missing catalogue — there are three, and they disagree by accident.**
   `/imagine/layouts/system.js` (18 as data), `styles/layouts/` (33 as pages),
   `ext/DesignTool/library/patterns.js` (11 as measured cases). Every one of them re-lists the five
   surface words by hand. The graduate plan is already deleting two of those copies (slice 3); this
   plan deletes the third.

3. **The demo consolidation is 90% done and nobody said so.** `ext/demo` already has the viewport
   with a resize handle (`stage.js:29`), the path bar (`shell.js:137`), the toolbar
   (`stage.js:105`, plus the layout bar at `shell.js:80`), and the source column (`shell.js:148`).
   Of the owner's five demo parts, exactly **two do not exist: a title and a footer.**

---

# 2 · One demo system, named `demo`

## The module

**`ext/demo` is it.** 202 files use it; the runner-up has zero. Nothing is renamed, nothing is
ported in. The work is two additions and three deletions.

## Its parts, and where each one already lives

| the owner's part | where it is today | state |
|---|---|---|
| **viewport with a resize handle** | `ext/demo/stage.js:29` `stage()` — `.demo-stage › .demo-screen › .demo-render`, handle at `:216` `resizer()`, live readout at `:247` `ruler()` | exists |
| **path bar** | `ext/demo/shell.js:137` `crumbs()` — `.demo-shell-path`, refilled on every in-box navigation | exists |
| **toolbar** | `ext/demo/stage.js:105` `tools()` — width presets, zoom, magnifier, ruler; plus `shell.js:80` `.demo-shell-steer`, `ext/layout`'s bar over whatever is shown | exists (two strips, both wanted: one sizes the box, one edits what is in it) |
| **title** | **nowhere** | **new** |
| **footer** | **nowhere** | **new** |
| **optional multi-column section wrappers** | `imagine/sections/sections.js` prototypes it; `demo` has none | **new, and OFF by default** |

## The two additions, in file:line

**`ext/demo/shell.js:69` `render()`** gains two lines, in the shape the four existing rules already
take:

```js
render(){
    if (this.title) div.c("demo-shell-title", () => h3(this.title));   // NEW — above the path
    …existing body…
    if (this.foot) div.c("demo-shell-foot", this.foot);                 // NEW — under the code column
}
```

and `shell.js:176`'s prototype defaults gain `title: "", foot: ""` — **both empty**, so not one of
the 202 existing callers moves a pixel. That is the whole feature: a demo that wants a title says
one, and the shell puts it in the one place a title goes.

**`ext/demo/shell.css`** gains two rules in `@layer theme`. Nothing in `@layer util`.

## Columns inside a demo — an option, never the default

The owner: *"we don't necessarily want to bake these in."* So:

```js
rail.demo({ columns: 2 })      // the render band splits into two section wrappers
rail.demo()                    // one column, exactly as today
```

`columns:` defaults to `undefined`, and when it is absent `render()` does not build a wrapper at
all. When it is 2, 3 or 4 the shell wraps the run column in a `core/Section` row — **the same
Section class the rest of this plan builds**, so there is one multi-column mechanism on the site and
the demo shell is just its first consumer. This is what makes the demo columns an experiment: they
are one config key over a class that exists for another reason.

## Which modules die

| module | lines | why | when |
|---|---|---|---|
| `ext/demo/layout.js` | 110 | `demo.layout()` is "a whole page as a demo page with parts chips" — that is exactly what a `core/Layout` page is, with a proven-width range and rules on top. Its 33 callers become `Layout` pages. | slice C, after slice A proves the replacement |
| `styles/layouts/full.js` | 32 | a second full-screen viewport mechanism (maximize as a url) beside `demo.stage()`'s own presets and handle. One `route("full")` on the shell replaces it. | slice C |
| `ext/Playground/` | 1,895 | a freehand layout editor with **zero importers**. `core/Section`'s picker does the same gesture (select a box → change its arrangement → see it live) against an *approved list*, which is the thing the owner actually asked for. | slice C **freeze**, delete only after Section ships |
| `imagine/layouts/LayoutsCard.js` | 373 | the 3-column card (intro · live stage · readouts) is what a `core/Layout` page renders. Ported up, deleted here. | slice C |
| `imagine/layouts/number.js` | 173 | the 1/2/3/4 index pages — `browse()` bands do this. | slice C |

**Consumers, unchanged:** all 202 `ext/demo` callers. **Consumers that change one line:** the 33
`demo.layout()` callers under `styles/layouts/*/page.js`, which become `new Layout({…})`.

---

# 3 · `core/Layout`

## What it is, in one sentence

**A layout page is a Page that declares an arrangement of named slots, the width range it is proven
at, and the rules about where it may go — and owns no content.**

## Where it lives

`public/framework/core/Layout/` — `Layout.js`, `layouts.js` (the ported catalogue), `page.js` (the
tree), `readme.md`, `doc/`. One name added to `core/page.js:9` `children:`.

⚠ **`Layout extends Page`, and `Page` is not a `View`** (`Page.class.js:20` is a plain class), so
`View.classify()` never sees it and no CSS class is minted from the name. **Every VIEW part it
builds must be named `PageLayout*`** — `page-` is core/Page's reserved prefix
(`styles/css-scopes.txt:62`) and `layout-` belongs to `ext/layout` (`:80`). `PageLayoutStrip` →
`.page-layout-strip`. This is `PageFrame`'s precedent exactly (`core/Page/Frame.js:16`).

## What a layout page declares — every prop a filter can read

```js
export default new Layout({
    meta: import.meta,
    title: "Rail + content",

    // ── the facets a filter reads ──────────────────────────────────────
    columns: 2,                        // 1 · 2 · 3 · 4 (4 means "four or more")
    room: "page",                      // which of the five words it compiles to
    tags: ["rail-and-content", "docs-three-region"],   // from design/vocabulary/tags.js

    // ── the size contract — LayoutRule #1 ──────────────────────────────
    widths: [640, 3440],               // the range it is PROVEN at, in px
    fallback: "1.stack",               // what it becomes below the floor

    // ── the arrangement itself ─────────────────────────────────────────
    slots: { rail: "list", main: "prose" },            // name → fixture kind
    arrange(){ return div.c("page", () => { this.slot("rail"); this.slot("main"); }); },

    // ── the rules (all three default to "any") ─────────────────────────
    accepts:    "any",
    allowed_in: "any",
    denies:     ["dark-in-dark"],

    // ── approval — deliverable 17 ──────────────────────────────────────
    approved: "2026-09-06",            // the date the fixtures last passed at every strip width
});
```

**Every one of those is a plain page prop.** No schema, no registry, no validation layer — a filter
reads `page.columns`, `page.tags`, `page.widths[0]`. That is the owner's own instruction
("each layout can prescribe properties (just page props), and the filters can filter them").

### `widths:` is the natural range, and it is what the viewport opens at

The brief's own example: *a 1-column default-scale layout says 200–800, and the doc page opens its
viewport there, never at 3440.* So `DemoShell` reads it:

```js
// core/Layout/Layout.js — content(), one line
content(){ return this.demo({ title: this.title, width: this.widths[0], widths: STRIP }); }
```

The stage opens at the floor, because the floor is where a layout is hardest and where a reader
learns the most. The handle and the strip are how you leave it.

The px numbers are not arbitrary: they map onto core's six width words already
(`Page.css:322–327`) — `small` is 14–24em (≈224–384px), the default column is 40em (≈640px),
`large` is 28–64em (≈448–1024px). **A layout whose `widths` floor is below its slot's word floor is
itself a violation**, and the checker says so.

## The tree — how you browse it

**1-column first, and rows only.** `core/Layout/page.js` calls `browse()` with bands in the owner's
order:

```js
const BANDS = {
    "One column":   "stack measure rows sections reading-column …",   // rows only — the simplest, most useful first
    "Two columns":  "equal golden main-aside fixed-fluid fr …",
    "Three":        "thirds rail-main-aside card rows-in-columns scroll …",
    "Four or more": "quarters quad wall shell …",
};
```

**Opening one shows variations and alternatives beneath it.** A Layout page's `content()` is: the
render at its natural width, the strip, then two walls — `variations` (the same arrangement with a
different distribution: `2.equal` → `2.golden`, `2.fixed-fluid`) and `alternatives` (a different
arrangement that answers the same question: `2.main-aside` → `3.rail-main-aside`). Both are plain
arrays of layout names, declared on the page, drawn with the same `preview_card` the wall uses.
`/imagine/layouts/system.js:419` `NUMBERS` and `:445` `step()` already model the sibling walk.

**Filters default to all.** `browse()`'s rail (`ext/catalog/browse.js:43`) already filters by band
and by text with `state = { group: "", text: "" }` — both empty meaning *all*. It gains three facet
rows reading the props above (columns · tags · approved/draft) as three more keys on that same
`state` object and three more `if` lines in `wall()`. About 25 lines.

**Paged, so 10,000 never render at once.** `wall()` counts as it draws (`browse.js:56` already has
`let shown = 0`). Add a cap of **60 cards** and a "show 60 more" button. Sixty is two full rows at
3440 with `--column: 22em`; a card is a `mini()` picture, not a live instance
(`ext/demo/mini.js`), so sixty pictures cost roughly one live render.

## Where the first thirty layouts come from — a port, not an invention

| n | source | how many | what the port is |
|---|---|---|---|
| 1 | `/imagine/layouts/system.js:129` `ENTRIES` | **18** | rename `n`→`columns`, `intro`+`when` stay, `rules`+`boxes` become `arrange()`, `word`→`room`, `split` is dropped (it is derivable: `columns > 1 \|\| rows > 1`). Add `widths`, `slots`, `fallback`. |
| 2 | `ext/DesignTool/library/patterns.js` | **11** | already `group`/`title`/`short`/`decl`/`build` — `build()` is `arrange()` with fixtures pulled out. These eleven arrive with **measurements at four widths already taken**. |
| 3 | `/imagine/design/layout/approved/page.js:15` | **5** | the closed set. Every one is already covered by 1 or 2 — they arrive as `approved:` dates and the floors/ceilings prose, not as new rows. |
| 4 | `styles/layouts/` (33 dirs) | **the rest** | the ones 1–3 do not cover: `docs apidoc toc-studio bold-editorial pricing carousel mail chat masonry spec screens`. Each is already a `demo.layout()` config with a `layout()` returning a class string — a mechanical rename to `arrange()`. |

**18 + 11 = 29 before touching `styles/layouts/`.** Thirty is one dir away. Nothing is invented, and
every ported entry keeps its original prose, so the tree ships explained.

## Content scale follows the box — deliverable 15, written down

> **Small columns never get large content. A massive container is careful with tiny content.**

It goes in two places, in these words:

1. `core/Layout/readme.md`, as the first Watch-out.
2. `.claude/skills/layout/SKILL.md`, as a sixth question: *"how wide is the box, and is the content
   scaled for it?"*

⚠ **It is deliberately NOT a checker rule.** Content scale is CSS's job — the three ramps and the
column-relative units already do it, and the size-standard minion is collapsing them into one
`--size` knob. §4 argues this at length. A checker that fires on content scale is reporting a defect
in `framework.css`, and the honest fix is there.

---

# 4 · `LayoutRules`

**Data on the page, one checker, one CSS class.** No registry, no config file, no rules engine.

## First: most of what looks like a rule is CSS, and CSS should do it

The owner, mid-plan: *"if content scales properly from mobile to massive, maybe the layout rules
aren't the problem — maybe it's just the CSS."* **Largely right, and the plan is smaller for it.**
Here is the split, said plainly.

**What CSS already answers — no rule, no checker, nothing to declare.**

| the worry | what already handles it | where |
|---|---|---|
| "a 400 layout should look fine at 1000" | the measure: `min(var(--measure), 100% - gutters)` **holds and centres** rather than stretching. A one-column layout at 1000 keeps its 40em track. | `styles/doc/layout-system.md` §1 |
| padding and gap on a big screen vs a small one | the three ramps — `--pad-ramp` `--gap-ramp` `--flow-ramp`, clamped, following the box. 427 hand-typed constants were replaced by them this morning. | `framework.css`, `ai/2026-09-06/spacing-constants/` |
| "small columns shouldn't get large content" | column-relative units: `small` is `clamp(14em, 16cqi, 24em)`, the columns pads scale with the row. The box tells the content how big it is. | `Page.css:322`, `styles/layouts/cols/cols.css` |
| a wall of tiles on a 3440 | `auto-fill` against a real `--column`: as many tracks as fit, never a stretched pair. | `styles/doc/layout-system.md` §3 |
| type on a 3440 | one body clamp against the **viewport**, not the box — deliberately: text does not grow because its column did. | `framework.css:278` |

**So content scale is not a rule.** It is deliverable 15's *written-down guidance* (§3) plus the
size-standard minion's one `--size` knob. If that lands, the checker never needs to mention it. A
checker that fires on something CSS should have handled is a bug report about the CSS.

**What CSS genuinely cannot solve** is the whole remaining list, and it is three items long.

## The defaults

`accepts: "any"` and `allowed_in: "any"` — declared on `Layout.prototype`, so a layout that says
nothing accepts anything and goes anywhere. The owner: *"you don't want to overly restrict, or have
to manage a massive whitelist."*

## The deny list — three rules, the shortest list that is true

**Rule 1 — the width range (deliverable 14).**

```
box is narrower than layout.widths[0]
  → "3.rail-main-aside is proven from 900px. This box is 312px.
     Below its floor it stacks to 1.stack — and 1.stack is what you are looking at."
```

**Why CSS cannot solve it.** A multi-column layout cannot be *scaled* into a 300px column — three
tracks in 300px is three 100px tracks, and no clamp makes that readable. The only correct answers
are **stack to the named fallback** or **refuse**, and choosing between them is a decision the
layout's author makes, not a declaration. This is the owner's own example — a 3440 section placed
inside a column — and it is measurable with one `clientWidth` read, so it is the one rule that can
never be wrong.

**Rule 2 — contrast.** `surface` equals the parent's `background`: a dark island inside a dark band,
a `tint` panel on a `tint` page, same-tone text on same-tone fill.

**Why CSS cannot solve it.** A colour is legal at every width; nothing about the cascade knows that
two tokens happened to resolve to the same value here. It has to be *compared*, and the comparison
is already done — `styles/stacks/hunt.json` is the measured zero-delta census that found 101
invisible pairs across 76 pages. The deny word is `dark-in-dark` and the checker reads that file's
pairs rather than restating them.

**Rule 3 — nesting that breaks a mechanism.** Two shapes, both real on this site today:

- **a `full` inside a `full`** — `width: "full"` collapses its ancestors into the crumb strip
  (`Page.css:326`); doing it twice collapses a row that is already collapsed, and the inner page has
  no host left to be full *of*.
- **a `sticky` inside an inner scroller** — `position: sticky` sticks to its nearest scrolling
  ancestor, so a sticky rail inside a box that has its own `overflow: auto` sticks to that box and
  never to the page. `imagine/sections/sections.js:38` documents the workaround it had to build
  (*"sticky lives on a CHILD, not on the column"*); `.rail` itself is sticky **and** a scrollport
  (`layout-system.md` §2), so nesting one inside another is the exact collision.

**Why CSS cannot solve it.** Both are mechanisms cancelling each other, not sizes. There is no
value of any property that makes a doubly-collapsed row uncollapse, and `position: sticky` has no
"stick to the outer scroller" keyword. The only fix is not to nest them, which is what a rule is
for.

**That is the list.** Three. If a fourth is ever proposed, the test is the one above: *can CSS
do it?* If yes, it is a defect in `framework.css`, not a rule.

## The checker — one function, dev only

```js
// core/Layout/rules.js — the whole API
export function check(layout, box, host){ … }   // → [] or [{ rule, says, url }]
```

`says` is a plain sentence a newcomer can act on; `url` is the `styles/rules/` page that argues it
(`styles/rules/proportion.md`, `nesting.md`, `robust.md` already exist and already carry the
measurements). **A violation cites the rule page rather than restating it** — the docs-point-they-
don't-explain law.

## How a violation shows — visible, never blocking

**One CSS class: `.page-layout-warn`**, in `Page.css`'s `@layer theme` (never `@layer util` —
`@layer util` beats `theme` at any specificity and the graduate plan forbids touching it). It is a
2px dashed outline in `--warn` plus an `::after` badge with the count. Clicking the badge opens the
rule page.

**Dev only, and it must not lie about production.** The gate is `Page.class.js:7`'s existing `dev`
constant (`localhost` / `127.0.0.1` / `*.localhost`). On a static production host the checker never
runs and the class is never stamped — so nothing a visitor sees depends on it, and a rule that is
wrong costs an agent a red outline, never a reader a broken page.

**Layouts do not stack** (the mastermind's call): one layout per Section; composition is nesting
Sections. So the checker only ever compares **one layout against one host**, which is why it is a
function and not an engine.

## The responsiveness strip — deliverable 16

Beside the drag viewport, seven panes at **400 · 700 · 1000 · 1400 · 2000 · 2800 · 3440**:

```js
export const STRIP = [400, 700, 1000, 1400, 2000, 2800, 3440];
```

Drawn with `ext/demo/pane.js` — which already is *"one device frame: a whole screen at a fixed
layout width, painted down to fit the room it is given, with nothing cropped"*. Seven panes on one
row at 3440; two rows of four below that. Each pane is labelled with its width and with **inside or
outside the layout's proven range** — a pane below `widths[0]` is drawn showing the *fallback*, and
says so, because the fallback is the thing being judged there (the mastermind's call).

⚠ **A pane is `zoom`, not a viewport.** A `@media` query inside a layout answers the real window,
not the pane (`ext/demo/stage.js:19`, `ext/demo/doc/record.md` §6). That is honest for this site,
whose layouts are container queries and clamps — and it is why **approval is measured in iframes,
not in the strip**.

## Stress fixtures, and what "approved" means — deliverable 17

**Six fixtures, three axes at both ends.** They are the separation between layout and content
(addendum 2): pour them into the slots and a layout that needs particular content to look right
fails visibly.

| axis | fixture A | fixture B |
|---|---|---|
| text | `"OK"` — two characters in every slot | 900 words in every slot, no paragraph breaks |
| image | no image at all | one 4000×3000 image per image slot |
| tone | light | dark (`color-scheme: dark`, the one line that flips every token) |

Plus the two worst corners: *longest + huge + dark* and *shortest + none + light*. **Eight runs.**

The run is `ext/DesignTool/library/entry.js`'s existing harness — real iframes at real widths
(`frame()`, `:52`), not zoom — because approval is a measurement. **Eight fixtures × seven widths =
56 iframes per layout**, which is why it is a button on the page and not something that happens on
load. Its verdict is written back as `approved: "<date>"` in the layout's own props.

**A layout with no `approved:` date is a DRAFT and is drawn as one** — a badge on its card, a band
of its own at the bottom of the wall, and excluded from `core/Section`'s picker. That is the whole
enforcement: the picker only ever offers approved layouts, so a Section cannot pick a draft even by
accident.

**Above its ceiling a layout holds and centres; below its floor it stacks to its named fallback**
(the mastermind's calls). Neither is new CSS — `min(var(--measure), …)` already holds
(`styles/doc/layout-system.md` §1) and the columns row already pages one column at a time under
32em (`Page.css`, the container query at the bottom). The plan's job is to *declare* it per layout,
not to build it.

---

# 5 · `core/Section`

## What it is

**`Section extends Page`**, so it gets naming, `store()`, `regions`, `Page.Frame` and `Page.from()`
free — the owner's whole reason for wanting it to be a page (*"like a sub page, could extend Page,
so it gets all the features, like individual storage"*).

`store()` is `Page.class.js:704`, and the id is the page's own url — which means a Section inside a
page has a stable, human-readable storage key with nothing to wire and nothing to collide.

## What it does, smallest version first

1. **It starts as a default div**, `min-height: 2.5em`, no class, no layout, nothing.
2. **When editing is enabled it grows a minimal hover overlay** — one control.
3. **That one control picks an approved layout.** No padding schemes: *"maybe having padding schemes
   isn't the way. maybe we just have pre-approved layout schemes. yes, this is It."*
4. **Editing is enabled by code**, never by a visitor: `section.editing = true`, set by demo pages
   and doc pages. Default off.
5. **A section holds its own content**; the layout it picked holds nothing (addendum 2).

## The class-name trap, which has bitten twice here already

⚠ `Section` as a **Page** subclass is safe (Page is not a View). But **every View part it builds
must be `PageSection*`**. Two prior modules dodged exactly this: `imagine/sections/sections.js:33`
says *"that is also why nothing here is called `Section`"* — `/blog/Section.js` exports one,
`ext/editor/blocks.js:20` exports another, and `.section` is a live rule at
`core/new/1/site/styles.css:188` (uppercase, letter-spaced, 1.05rem). `PageSectionOverlay` →
`.page-section-overlay`; nothing collides.

## What it shares with `Page.Frame`, and what it must not duplicate

`Page.Frame` (`core/Page/Frame.js`, landed today) draws **the chrome around one content box** — the
bar, the rail, the panel, the aside — for **a whole page**. `Section` draws **one band inside a
page** and has no chrome at all.

| | `Page.Frame` | `Section` |
|---|---|---|
| scope | the whole page | one band in it |
| chrome | bar · rail · panel · aside · tabs | none |
| what it decides | where the page's *other parts* sit | how *this band's* boxes are arranged |
| storage | the page's | its own (`store()`, keyed on its own url) |
| stacks? | one per page | many per page, and they nest |

**What Section must not duplicate:** the regions Map, the six word→class stamps, and the height
reservation. A Section that wants a rail beside it **is a page with `arrangement: "rail-left"`** —
that word exists, and a second copy of it inside Section is the exact defect the paging realm
re-found in eight audits.

**The one thing Section adds that Frame does not have: `layout`.** Frame arranges the page's parts;
Section arranges its own children by picking one entry from `core/Layout`'s approved set. That is
the whole new surface, and it is one prop.

## The overlay — the smallest thing that works

```js
// core/Section/Section.js — the overlay, in full
overlay(){
    if (!this.editing) return;

    div.c("page-section-overlay", () => {
        btn(this.layout?.title ?? "layout", () => this.pick());
    });
}
```

One button, showing the current layout's name (or the word "layout" when there is none). Clicking
it opens the approved list — the same `mini()` pictures the tree's cards use, so a reader recognises
the shape before reading the name. The overlay is `position: absolute`, `opacity: 0` at rest,
`opacity: 1` on hover — and it moves **zero pixels**, which is `ext/Playground`'s own hard-won rule
(*"all node chrome is `position: absolute` and moves only `opacity`… measured across a ten-point
hover sweep"*).

**Demos do not persist** (the owner, 2026-09-04): a Section on a demo page writes nothing to
`store()` on a pick. It saves only inside an editor, and only where it is visually obvious that it
does. `editing` turns the overlay on; a separate `saves: true` turns writing on, and only Make sets
it.

---

# 6 · Templates

**A template is a layout with its slots filled and saved** — a `page.json`, which
`imagine/paging/make/made.js` already writes to disk through `ext/Saver`'s `FileSaver` (dev socket
`rpc:write`) or to `localStorage` on a static host. `Page.from(json)` (`Page.class.js:248`) already
reads one back. **Neither half needs building.** Deliverable 2 is only the *link* between a template
and the pages made from it.

**The mastermind's call: update on re-render, never live.** No event bus, no state machine — the
owner's own worry (*"not sure if events are the best for this coordination? we get into state
machine territory?"*) is answered by not having any coordination at all.

## The seam — sixteen lines, on `Page.prototype`

```js
/* ── TEMPLATES ────────────────────────────────────────────────────────────────
   A template is a page whose slots are filled. `make()` stamps one out and keeps
   the link; `update()` re-renders every page stamped from it. Nothing subscribes,
   nothing fires, nothing has modes — the link is a Set and the verb is one call. */

// Stamp a page from this template. `over` is what this instance changes.
make(over){
    const made = new this.constructor({ ...this.config, ...over, template: this });
    (this.instances ??= new Set()).add(made);
    return made;
}

// The owner's `.views[]` — every live view this template is currently painting.
get views(){ return [...this.instances ?? []].map(page => page.view).filter(Boolean); }

// Re-render every instance, and every instance that is itself a template.
// ⚠ `empty(() => content())`, never a new view: a Page memoizes `this.view`, and
//   replacing it strands whatever the Router mounted.
update(){
    for (const page of this.instances ?? []){
        page.view?.empty(() => page.content());
        page.instances && page.update();
    }
    return this;
}
```

**That is the whole feature.** Read against the owner's five asks:

| the ask | how |
|---|---|
| importable | it is a `page.json` at a url; `Page.from(url)` imports it |
| minimal config | `template.make({ title: "Team" })` — one object of what differs |
| re-renderable | `page.view.empty(() => page.content())`, which is what `Section.redraw()` already does |
| tracks `.views[]` | the getter above, derived from `instances` so the two cannot disagree |
| a template may use another | a template's own `layout:` may be another template; `update()` recurses one level per link |
| stays linked by default | `make()` sets `template` and registers — there is no unlinked path |

⚠ **`template` is a fresh field on `Page` — check it against the census before writing it.** The
graduate plan lost a day to `type` being a page method already (`generator/page.js:261`). `grep -rn
"\.template\b" public/ --include=*.js` returns `ext/Panel/templates.js`'s own `data.template`
(a Panel field, not a Page field) and nothing on `Page` — but slice D re-runs that grep as its first
step.

---

# 7 · Build slices

Four slices. Each leaves the site green; each is executable cold from this text.

## Slice A — `core/Layout` + the tree

**Files (all new but one):** `core/Layout/Layout.js`, `core/Layout/layouts.js`,
`core/Layout/rules.js`, `core/Layout/strip.js`, `core/Layout/page.js`, `core/Layout/readme.md`,
`core/Layout/doc/*.md`; **one line** at `core/page.js:9` (`children:` gains `Layout`);
`ext/catalog/browse.js:43–56` gains three facet keys and a 60-card cap.

**Steps.**
1. `layouts.js` — port `imagine/layouts/system.js:129` `ENTRIES` (18) and
   `ext/DesignTool/library/patterns.js` (11), then eleven more from `styles/layouts/`. Rename `n` →
   `columns`; add `widths`, `slots`, `fallback` per entry. **Do not rewrite the prose.**
2. `Layout.js` — `class Layout extends Page`; `content()` calls `this.demo({ width: this.widths[0],
   widths: STRIP })`; `slot(name)` draws the named box and pours the current fixture into it.
3. `strip.js` — seven `pane()`s at `STRIP`, each labelled, each below-floor pane drawing the
   fallback.
4. `rules.js` — `check(layout, box, host)`, three rules, `dev` gated, `.page-layout-warn`.
5. `page.js` — `browse(BANDS)` with One column first.
6. `core/page.js:9` — add `Layout`.

**Proof.** `/framework/core/Layout/` renders four bands, One column first, thirty cards. Every leaf
opens its viewport at its own `widths[0]` — **not at 3440**, verified on `1.stack` (opens near 400)
and `4.shell` (opens near 1400). The strip shows seven panes. The fixture button runs and writes a
date. Console clean at 400/1440/3440. **No page outside `core/Layout/` changes**, so every other
screenshot on the site is byte-identical.

## Slice B — `core/Section` + the picker

**Files:** `core/Section/Section.js`, `page.js`, `readme.md`, `doc/`; one line at `core/page.js:9`;
one new block in `core/Page/Page.css` `@layer theme` (`.page-section`, `.page-section-overlay`),
about 15 rules.

**Depends on A** — the picker's list is A's approved set. **Cannot run in parallel with A.**

**Proof.** A demo page with three Sections: the first bare (a default div, 2.5em floor, no overlay),
the second with `editing: true` (overlay on hover, moves zero pixels — measured on a ten-point
sweep), the third with a layout already picked. Picking a layout redraws that Section and nothing
else. A refresh resets all three. `@layer util` untouched; `Page.css:280–390` untouched.

## Slice C — the demo consolidation and the deletions

**Files:** `ext/demo/shell.js:69,176` (+title, +foot), `ext/demo/shell.css` (2 rules);
delete `ext/demo/layout.js`, `styles/layouts/full.js`, `imagine/layouts/LayoutsCard.js`,
`imagine/layouts/number.js`; freeze `ext/Playground/`.

**Runs in parallel with slice A** — different files, no shared symbol. ⚠ The *deletions* do not: the
33 `demo.layout()` callers move to `Layout` only once A has landed, so **slice C splits in two**:
C1 (the two additions, parallel with A) and C2 (the deletions, after A).

**Proof.** A demo with a title and a footer renders both; **all 202 existing callers render
identically** — a crawl of `/framework/`, `/web/`, `/imagine/` with zero console errors and zero
layout deltas at 1440. `ext/Playground/` still opens from `/framework/ext/` and still loads its
saved documents (frozen, not broken).

## Slice D — templates linked

**Files:** `core/Page/Page.class.js` (+16 lines, nothing removed); `imagine/paging/make/made.js`
(write `layout:` into the `page.json`); one doc page under `core/Page/doc/`.

**Depends on A and B.** **Cannot run in parallel with either.**

**Proof.** A template page, two instances made from it, `template.update()` re-renders both and
nothing else; `template.views` has length 2; a template whose `layout:` is another template
re-renders through one link. Refresh: the instances come back from their `page.json`.

## The order, and what runs together

```
   A (core/Layout)  ──┐
                      ├──► B (core/Section) ──► D (templates)
   C1 (demo +2)     ──┘         │
                                └──► C2 (the deletions)
```

**A ∥ C1.** Then **B**. Then **C2 ∥ D**.

---

# 8 · What I would delete

Deleting beats adding. Nothing goes until the thing that replaces it is proven at the strip's seven
widths.

| what | lines | why it becomes redundant | slice |
|---|---|---|---|
| `ext/Playground/` (8 files) | **1,895** | a freehand layout editor with **zero importers**. Its gesture — select a box, change its arrangement, watch it redraw — is `core/Section`'s overlay, against an approved list instead of raw CSS, which is what the owner asked for. Its properties column duplicates `ext/layout/words.js` and `ext/Panel/properties.js` a third time. | C2, after B |
| `imagine/layouts/LayoutsCard.js` | **373** | the 3-column card (intro · live stage · readouts) IS what a `core/Layout` page renders. One copy, one level up. | C2 |
| `imagine/layouts/number.js` | **173** | the 1/2/3/4 index pages — `browse()` bands do exactly this, and the tree needs the bands anyway. | C2 |
| `ext/demo/layout.js` | **110** | `demo.layout()` is "a page as a demo with parts chips"; a `Layout` page is that plus a proven range and rules. Its 33 callers become `new Layout({…})`. | C2 |
| `styles/layouts/full.js` | **32** | a second full-screen viewport mechanism beside the stage's presets and handle. One `route("full")` on `DemoShell`. | C1 |
| `imagine/layouts/system.js:38–53` `SURFACES` / `SURFACE_MEANS` | **20** | the third hand-written copy of the five surface words. (The graduate plan already deletes it in its slice 3 — named here so the two plans do not both try.) | graduate 3 |
| `imagine/sections/sections.js` | **524** | `SectionsBand` is the prototype `core/Section` graduates from. **Not deleted in this plan** — it stays until Section proves head/side/main/aside/notes/foot, then goes. | after B, its own task |

**About 2,600 lines deleted against about 700 added**, and 1,895 of the deletion is one unimported
tool. Five of the seven rows are a *second copy of something* — the same defect the census found
three times over.

## What I would deliberately NOT delete

- **`ext/layout`** (12 importers, `ext/demo/shell.js:7` among them). It is the control surface, not
  a catalogue. The brief's "one importer, otherwise dead" is wrong by an order of magnitude.
- **`ext/Panel`** and **`ext/Panel/Workspace`** — an app surface for arranging panels at runtime, a
  different job from arranging a page. Only the *word* "workspace" leaves the demo vocabulary.
- **`styles/layouts/`'s 33 dirs.** They are the ported catalogue's source; they become `Layout`
  pages in place, keeping their urls, so no link on the site breaks.
- **`styles/sections/`'s 16 bands.** They are fixture content — the realistic set beside the
  synthetic extremes.
- **`ext/DesignTool/library/`.** It is the fixture harness and eleven of the thirty.

---

# 9 · Risks, named

**`layout-` and `.layout` are taken.** `styles/css-scopes.txt:80` reserves `layout-` for
`ext/layout`, and `ext/layout/layout.css:5` has a live `.layout { position: relative }`. Every class
this plan mints is `page-layout-*` or `page-section-*` under core/Page's own prefix (`:62`).

**`.section` is a live rule** at `core/new/1/site/styles.css:188` (uppercase, letter-spaced). No
View part may be named `Section`; `PageSection*` throughout. Two modules already dodged this
(`imagine/sections/sections.js:33`).

**`Page.css` is layered and large** (945 lines). Every new rule goes in `@layer theme`.
**No slice may touch `@layer util`** (it beats `theme` at any specificity) or `Page.css:280–390`
(the columns width words and the `fill`-yields rule, a 2026-09-05 decision).

**Hidden tabs do not lay out.** The strip's seven panes and the fixture harness both measure. A
panel hidden with `display: none` is not measured at all; the reservation rule is
`visibility: hidden`. Copy it verbatim from `Frame.js`; do not simplify it.

**A div is not a viewport.** The strip is `zoom` and answers container queries, not `@media`. That is
why approval is measured in iframes (`ext/DesignTool/library/entry.js:52` `frame()`) and never in
the strip. Say so on the page, or the strip will be read as proof it is not.

**`auto-fill`, never `auto-fit`** on any wall. Measured 2026-08-17: `auto-fit` made two cards
1,623px each at 3440.

**Another minion owns `Page.class.js` and `Page.css` today** (the graduation). Slice B's Page.css
block and slice D's 16 lines both land *after* graduate slice 1 is byte-identical-proven. Neither
touches a line the graduate plan touches.

**One backtick inside `` css(`…`) `` kills every page**, and only `p()`/`h1`–`h6` read backticks.
Nothing in this plan writes a `css()` template.

**A bash heredoc eats one backslash layer.** Build every JSONL line and edit script with the Write
tool.
