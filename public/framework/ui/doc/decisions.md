# ui — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Nineteen UI components in four bands. **Three are exported functions; sixteen
are copy-paste templates** with a page, a copy button, and — where a rule
earned it — a small stylesheet beside them.

```js
import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");
```

## Four bands, most useful first (2026-08-17)

**Question.** the owner: *"organized, and starting with the most useful versions,
and organizing variants from there. If I click a basic card, I could see
variants of that card."* The nineteen were **one flat line** in `children:`,
previewed as one undifferentiated wall — the same information-architecture
problem `styles/layouts/` had that morning.

**Verdict: `BANDS` at the top of `page.js`, and `children:` derived from it.**
The order is editorial, not alphabetical: a reader meets `card`, `toolbar`,
`table` and `dialog` long before `kbd`.

| band | 5 · 5 · 5 · 4 | why |
|---|---|---|
| Surfaces | `card` `toolbar` `panel` `stats` `accordion` | the boxes a screen is built from — every one is `surface` plus a class string |
| Data | `table` `timeline` `progress` `pagination` `crumbs` | a set, and where you are in it |
| Forms | `field` `dialog` `tags` `menu` `tooltip` | taking a value, and the box, the picker and the hint around one |
| Marks | `badge` `alert` `avatar` `kbd` | small labelled marks — a status pill, a warning, a person, a keystroke |

**The sizes are load-bearing, and that is the one surprise.** A band is its own
grid and `auto-fit` stretches it to fill the row, so a band of three at 3440
draws three cards a thousand pixels wide — a toolbar with a 700px search field
in it. Five, five, five and four is what makes the cards even. It also killed
the cleaner-sounding five-band cut (Surfaces · Data · Forms · Navigation ·
Marks), whose two bands of three measured worse than the compromise in the
membership of `crumbs` and `tooltip`.

**The wall is `ext/catalog`'s `browse()`**, the same call `styles/layouts/`
makes — factored out of that page rather than written twice. `packed` and
`pack()` came out with it: bands are per-band grids now, so the masonry pass
had nothing left to solve, and `stats`'s `card: "two"` and `timeline`'s
`card: "tall"` went too. A wall of even tiles is what a band wants.

## A variant is a different thing, not a different value (2026-08-17)

The owner, of the layouts wall the same day: *"we don't really need a separate card
for gap vs no gap."* It applies here exactly. **Count: 31 → 32** — four
consolidated out, five genuinely-different ones added, and the five landed on
the components that carry the most weight.

| out | it was |
|---|---|
| `avatar/sizes` | three sizes of one circle — the `--avatar` token, now shown in `photos`'s second circle |
| `stats/summary` | `--column: 16em` — one number pretending to be a second component |
| `pagination/current` | the same row three times with a different button wearing `prim` |
| `card/wall` | `grid gap auto`, which is **layout**, and layout has one address (RULE#17): [`grid/auto/`](/framework/styles/layouts/grid/auto/) |

| in | it is |
|---|---|
| `card/media` | the figure **outside** the `pad`, so the image reaches the card's edge — one surface, two children |
| `toolbar/title` | the header bar: what you're looking at, what you can do to it. Wants `split`, where the three-group bar wants `flex-1` |
| `table/wide` | seven columns, and the `max-content` self-scroll the page documents and never showed |
| `dialog/form` | `<form method="dialog">` — no listener anywhere in it |
| `menu/sections` | group labels and a destructive item; the label is an *item*, so labels and links share one left edge |

None of the four removed urls had an inbound link anywhere in `public/`
(grepped). Each one's lesson moved into its primary's source or one prose line
— consolidating means moving it *inside*, never dropping it.

Per component, before → after: `card` 2→2 · `toolbar` 1→2 · `table` 2→3 ·
`dialog` 1→2 · `menu` 1→2 · `stats` 2→1 · `pagination` 2→1 · `avatar` 2→1.
The other eleven are unchanged.

**Left shallow, honestly.** Ten components still carry exactly the variants
the 2026-08-12 review gave them and were not re-examined: `panel` (1),
`accordion` (1), `timeline` (1), `crumbs` (1), `badge` (1), `progress` (2),
`tooltip` (2), `alert` (2), `kbd` (2), `field` (3). Two of those are the
next candidates if this is picked up again — `kbd/bare` is a with-and-without
pair, which is the shape the owner's rule kills, and `progress/accent` is one
declaration.

## The bar: logic a user shouldn't have to carry

**Encapsulating hides internals, and hiding internals makes modification
harder.** A function you can't see inside is a function you have to fight the
first time your case is half a step off the one it was written for — and for a
padded flex row, that is the *second* use.

So the bar is: is there **logic** here? A loop over rows, a listener, a name that
must be unique, a trap that costs an afternoon. If yes, export a function. If no
— if it is four elements and three utility classes — the honest deliverable is
the **markup itself**, documented on its page with a copy button, so the reader
takes it and edits it in place.

**Sixteen of the nineteen failed that bar**, in an independent per-module review:
`framework/ai/2026-08-09/proposal.md`, whose *Reviews* table is the verdict and
the reasoning for each. Two findings recur and are worth carrying: almost every
helper had **zero call sites**, and where the site genuinely needed the thing —
the versus page's panel and stat tiles, both FAQs, three crumb trails — its
author wrote the markup by hand rather than import the helper.

| | |
| --- | --- |
| **exported (3)** | `table` — two nested loops and the `width: max-content` shrink-wrap trap · `timeline` — a loop, and the rail is not obvious (**not** [`ext/Timeline`](/framework/ext/Timeline/) — a different, larger component with the same English name; see "Not `ext/Timeline`" below) · `keys` — the interleave that puts a `+` *between* real `<kbd>`s |
| **template + CSS (9)** | `crumbs` `badge` `alert` `panel` `tooltip` `avatar` `dialog` `menu` `accordion` — a rule about a **relationship or a state**, which markup cannot say about itself |
| **template only (7)** | `field` `toolbar` `progress` `card` `stats` `pagination` `tags` — no `.js` in the directory at all |

## The CSS

A css-only module is a `<name>.js` holding one `css()` call and nothing else;
`ui.js` imports the nine so the classes exist site-wide. Two rules, both silent
when broken, and `css()` handles the first for you:

- **The layer order is restated in full** — `@layer base, theme, site, util;`.
- **Every rule is inside a layer.** An unlayered rule beats *every* layer.

Look goes in `theme`. Two blocks are in `util` on purpose: `.ui-tags-input` (an
opt-out of the theme's input border, which a `theme` class would lose to on
specificity) and `.ui-dialog`'s `margin: auto` (which `.flex > * { margin: 0 }`
erases from a later layer).

**No component names a colour.** Every value is a framework token —
`--surface --ink --line --radius --wash --prim --error`. The review found two
hardcoded `white`s (tooltip's bubble, avatar's circle) and a third in badge; all
three now read `var(--ink)` / `var(--surface)`, the pair the theme guarantees
contrast between in both modes.

**Nothing is styled inline** except `--gap`, `--column` and `--avatar`, which are
knobs rather than declarations.

### Verdict: `.ui-surface` and `.ui-muted` are gone

They were `framework.css`'s `.surface` and `.muted`, character for character.
*"The class name is the registry"* is a rule about a class you **emit** — these
re-declared somebody else's, and a duplicate is not an alias, it is a second
definition that can drift. Every template here writes `surface` and `muted`, the
same classes `styles/sections/*` already wore. `.ui-pill` stays: it has no
counterpart upstream.

## Shared

`parts.js` holds `.ui-pill`, `.ui-tags-input` and two helpers: `css(rules)` (the
`<style>` tag, layer statement written for you) and `component(fn)` (the `.c()`
form every View factory has).

`parts.js` and every `<name>.js` import from `../../core/View/View.js`, never
`/app.js`: `app.js` exports `ui`, so importing back through it would be a cycle
that breaks on deep reloads only. `page.js` is loaded by the Router long after
that, so it uses `/app.js` like any page.

## The unification (2026-08-12)

**The question.** `ui/` was the last section outside the site's one page system.
Its index was a `previews()` wall with three token overrides; its nineteen leaves
were `palette()` + `copy()` + prose + loose `demo()` boxes, while every other
detail page on the site had converged on `catalog()` rail + `demo.exhibit()`.
Different pages doing similar things means one of them is always stale — and
`ai/2026-08-11`'s census had already named `palette()` the **fourth preview
mechanism** and pre-committed its removal.

| | |
|---|---|
| leave `palette()`, add an exhibit above it | two previews of the same component on one page, and the wall would be the stale one |
| keep `copy()` beside the exhibit's source | two code blocks showing the same function — the exact drift `demo(fn)` exists to prevent |
| **exhibit as THE assembly; variants become child pages** | ✓ |

**Verdict, in three parts.**

1. **The index is `initialize(){ this.catalog(); }`** — one line, the same one
   `styles/sections`, `styles/layouts` and `styles/elements/forms` wear. The page's
   own prose becomes the rail's first card, so nothing was lost to gain the rail.
2. **Every leaf leads with `demo.exhibit({ page: this, … })`** — the component live
   on a stage you can drag, the layout bar wired to it, the template open beside it.
   `def` is the same `const` the card renders, so a card still cannot show something
   its page doesn't.
3. **Every other runnable example is a child page** — 29 of them, real urls, drawn
   under a `Variants` heading with the same cards the rail is made of.
   `/framework/ui/field/invalid/` is a url, a card and a stage.

`palette()` and `copy()` are deleted. The clipboard did not go with them: it moved
onto `demo.source()`, so *every* detail page on the site copies its own code now
(`ext/demo/doc/record.md` §19.2).

### The per-page calls

Every page took the same assembly; what differed is what became a variant.

| page | variants | note |
|---|---|---|
| `table` `timeline` `kbd` | `num` `cells` · `single` · `keys` `bare` | the three functions — `file:` points at the component's own `.js`, not `page.js`, because that file *is* the lesson |
| `field` | `invalid` `select` `form` | its in-prose "two fields is a form" demo became the third variant rather than staying a box |
| `card` `stats` `alert` `pagination` `tags` `avatar` `progress` | 2 each | the palette's second entry plus the page's own trailing `demo()` — in five of the seven those were already **the same function**, so nothing was invented |
| `crumbs` `badge` `toolbar` `panel` `menu` `accordion` | 1 each | palette entry and trailing demo were literally the same `const`; one variant, no duplicate |
| `dialog` | `open` | the primary is the real modal (open it, press Esc); the variant is what `showModal()` shows, because a closed `<dialog>` renders nothing on a card |
| `tooltip` `menu` | — | ⚠ **the templates carry a `pad` wrapper.** The bubble and the panel are out of flow and every stage, box and thumb crops; on a flush `bleed` render they would be invisible rather than merely clipped. It is in the template, not around it, because that is the honest markup |
| `stats` `timeline` | — | ~~keep their wall claims (`card: "two"`, `card: "tall"`)~~ — both dropped 2026-08-17: a band of even tiles has no hole for a span to fill |

**Card zoom dropped `zoom-75` → `zoom-50`.** A rail is 19em with `--thumb-max: none`,
so twenty three-quarter-scale renders made a rail four screens tall. `zoom-50` is
also what `demo.page()`'s card uses, so a component card and a variant card are now
the same size.

**Nothing here is "mostly prose".** The brief allowed a page to keep prose where the
render+code assembly would be forced; nineteen for nineteen had a real render, so
nineteen took the exhibit.

## Not `ext/Timeline`

[`ext/Timeline`](/framework/ext/Timeline/) is a zoomable h/v axis with lanes,
live updates and its own `--t`/`--em-per-hour` positioning model — a
different, much larger component that happens to share `timeline`'s English
name and nothing else. `ui.timeline()` is a static dated list with no scale
and no axis. Both readmes now cross-link; full weighing in the
[audit](/framework/audit/modules/ui.md), "Where this module overlaps others."

## Who uses it

`ui.js`'s three functions and `parts.js`'s `css()`/`component()` helpers are
the only parts of this module anything outside it imports — none of the
sixteen templates has a caller, which is the finding the review already made
and this list confirms again.

| caller | uses | page |
|---|---|---|
| `styles/sections/changelog.js` | `timeline()`, imported directly from `ui/timeline/timeline.js` (not via `ui.js`) | [/framework/styles/sections/](/framework/styles/sections/) |
| `styles/sections/team.js`, `styles/sections/testimonials.js` | the single-circle `avatar()` export | [/framework/styles/sections/](/framework/styles/sections/) |
| `styles/elements/forms/page.js` | `css()` from `parts.js`, for its own unrelated stylesheet | [/framework/styles/elements/forms/](/framework/styles/elements/forms/) |
| `ext/AITask/AITask.js` | `ui.table()` | wherever a task's `AITask` renders |
| `ext/DesignTool/tests/page.js`, `ext/DesignTool/audit/page.js` | `ui.table()` | [/framework/ext/DesignTool/](/framework/ext/DesignTool/) |
| `dev/DevBar/page.js` | `ui.keys("Ctrl", "\\")` | the dev rail (localhost only) |
| several `framework/ai/*/page.js` task logs | `ui.table()`, `ui.timeline()` | the AI task dashboards |

## Three things that will bite

- **`ui/` is imported by `app.js`**, so every surviving stylesheet loads on every
  page of the site. A dozen small style elements, measured as noise; the
  alternative was a second import in every page that wants a badge.
- **A tooltip or a menu panel is out of flow**, so an ancestor with
  `overflow: hidden` clips it — a `.demo` box and a stage's screen both are.
- **A css-only component's own `page.js` never imports its sibling `<name>.js`.**
  `alert/page.js` has no `import "./alert.js"` anywhere in it — the styling
  reaches the page only because `ui.js` imported it for the side effect, and
  `ui.js` is loaded by every page via `app.js`. Add a twentieth css-only
  component and forget the line in `ui.js`, and its page renders with no error
  and no style, exactly like the rest of this file's silent-failure traps.

## `page.js` is a `Doc` now; the nineteen leaves stay `Page`

The module index (2026-08-15) documents `ui.table`, `ui.timeline`, `ui.keys`
via `subject: ui`, and gains a Files tab covering all 35 files in the module
from one tree. The nineteen component pages are deliberately **not**
converted — they are the site's one demo system (`demo.exhibit()`, variants as
children, a live `preview()`), and wrapping each in `Doc` would show every
variant twice: once as `demo.exhibit()`'s own "Variants" wall, once again as a
`Doc`-derived top tab. Full case in the
[audit](/framework/audit/modules/ui.md), "Where this module overlaps others."

⚠ **That binding reversed, and this file's `content()` did not follow** (fixed
2026-08-16). `Doc.overview_section()` used to call `content()` bound to the
*section*, so the fix here was `this.parent.previews()`. `ext/Doc` then bound
it back to the module's own `Doc` — which is correct, and which silently made
`this.parent` the **framework landing**: this page's wall was drawing Start
here · AI · FAQ · Core · Styles, on the UI page, with nothing in the console.
It is `this.wall()` now. **The lesson is the shape of the bug, not the line:** a
`this.parent` that resolves to *something* can never fail loudly.

## The nineteen are a grid, not nineteen tabs (2026-08-16, the owner)

`Doc.bar()` puts every declared child between the Overview and the reference
sections, which is right at three or four and a wall of chrome at nineteen. This
module overrides `bar()` to `Doc.SECTIONS` — **Overview · API · Docs · Files and
nothing else** — and the components are the Overview's preview grid, which is
where a reader compares them anyway. A reading of *this* module's shape, not a
change to the contract: `core/Page` (5), `ext/DesignTool` (5) and `ext/catalog`
(4) still tab their children, and `ext/Doc`'s own page is unmoved.

⚠ **Shortening the strip is two changes, not one.** `tabs()` registers a child's
mount region from the same list it draws the strip from, so the nineteen also
lost their `regions` entry — and `Page.container()` then walks up to
`/framework/`'s `$pages`, rendering a component **over the framework sidebar**
instead of inside this doc. `render()` here re-registers them against the
Overview's panel. Verified: `/framework/ui/table/` still mounts inside
`.page-ui`'s own `.tab-panel`.

### That grid was packed (2026-08-16, superseded 2026-08-17)

⚠ **Both `packed` and the `card:` claims below are gone.** The wall is
`browse()`'s per-band grids now — see *Four bands* at the top — and a band of
five even tiles has no holes for a measuring pass to close. Kept because the
reasoning about `.masonry` versus `.packed` is still correct for any wall that
does have ragged children.



The cards are live renders of nineteen unrelated components — a badge row
against a data table against a timeline — so a uniform grid made every row as
tall as its tallest card and left holes under the short ones. The wall is
`pack(this.wall().ac("packed"))` now:
[`packed`](/framework/styles/layouts/masonry/packed/), **not**
[`masonry`](/framework/styles/layouts/masonry/), and the deciding fact is not
reading order — `stats` claims `card: "two"` (`grid-column: span 2`), and
`.masonry` is CSS multicolumn, where that declaration is inert and the wide card
would silently narrow. `.packed` stays a real grid, so the span, the `dense`
backfill and a `group:` heading's `grid-column: 1 / -1` all keep working, and the
DOM order the prose leans on ("Start at Data table") survives.

Two knock-on facts, neither of them a bug:

- **`dense` backfills, so the sequence jumps.** Page.css has always set
  `grid-auto-flow: dense` on a wall; against real spans it is also what buys the
  tight pack — sparse placement cannot move a card above the previous one's row,
  which levels the columns back into pseudo-rows. The order stays broadly
  left-to-right and a card lands wherever it first fits.
- **The gap grew, 0.8em → 1em.** `.packed` declares `gap: 0 var(--gap, 1em)` and
  the wall does **not** set `--gap` — deliberately. That custom property inherits,
  and every card here contains a live component render that reads it, so pinning
  the wall's gutter would quietly retune nineteen components' internal spacing.
  A wall 3px airier than the site's others is the cheaper of the two.

The long record — the ladder per component, the nine findings the set produced,
and the review outcome — is in `record.md` beside this file.

## Uniform thumb height, and four cards that got a real context (2026-08-17, wall-polish)

Even bands (above) traded the tight pack for **ragged rows**: `align-items: start`
plus `max-height` let each thumb sit at its own natural height, so a short card
(Toolbar, Panel) left 100–200px of white beside a tall one (Card, Timeline) in the
same row. **Verdict: `.page-preview-thumb` is a fixed `height` now, not a ceiling**
— site-wide, in `core/Page/Page.css`, because a thumb is a picture and every other
preview wall on the site gets the same even rows for free. Checked: `/framework/`,
`/framework/core/`, `/framework/ext/` have no live thumbs at all (plain label
cards), so nothing there moved.

**Cost, honestly:** most of these nineteen are small controls, not screens, so a
fixed 12em box now shows real dead space under a short render — Toolbar, Panel,
Stat tiles and eight others sit at 30–70% of the box. Not fixed here (out of this
task's scope); `--thumb-max` could come down for this wall specifically if that
still reads wrong.

**Four read as broken, not just short**, because their body was either the doc's
own prose (`tooltip`) or a closed trigger with nothing to show (`menu`) —
`weak-cards`' exact diagnosis, repeated. Each `preview()` now draws a small,
realistic scene instead of the stage's own template: `tooltip` a settings row
("Auto-save… 30 seconds"), `menu` an open panel beside a file it acts on
(`README.md`), `crumbs` the trail above the heading it would sit on, `pagination`
the row under a three-item list. None scaled up — the components stayed their
real size; only the surrounding context grew.
