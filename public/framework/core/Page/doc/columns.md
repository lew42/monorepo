# Columns — a page whose subtree is a row

One call, and every page under this one is a full-height column that opens to the right of its
parent. The tree is real; `display: contents` is what flattens it.

```js
export default new Page({
    meta: import.meta,
    title: "Finder",
    width: "small",                    // this page's own column
    initialize(){ this.columns(); },   // the whole opt-in
    children: { Guides: { width: "small", children: { … } } },
});
```

**Live:** [/framework/core/Page/overview/columns/finder/](/framework/core/Page/overview/columns/finder/) — page height, real
urls, and running the **even** mode below. The same tree in a box, on the elastic mode and with
the source: [/framework/core/Page/overview/columns/](/framework/core/Page/overview/columns/).

**Four real screens** built out of nothing but these words, each answering a different
"what goes where": [Docs](/framework/core/Page/overview/columns/uses/docs/) — a deep tree
of content · [Inbox](/framework/core/Page/overview/columns/uses/inbox/) — a preview rail
opening a reader, with unread state two pages up ([roles](/framework/core/Page/doc/roles/))
· [Workbench](/framework/core/Page/overview/columns/uses/workbench/) — three and four
columns at 3440 · [Split](/framework/core/Page/overview/columns/uses/split/) — a columns
host inside one half of a height-split screen ([panels](/framework/core/Page/doc/panels/)).

## The six width words

`width:` is the page's own word; `column()` stamps it on the body. Every value is a token, so a
page can retune one number (`--page-column-max`) instead of asking for a seventh word.

| word | track | for |
|---|---|---|
| `small` | `clamp(14em, 16cqi, 24em)` — 14em until the row passes ~87em, then 16% of it | rails, lists, item pickers, an index |
| `hug` | its content, 6–24em | a rail whose own labels decide the number |
| *(none)* | **frozen at** `clamp(40em, 42cqi, 46em)`, floor 16em | the default — prose, a form, two columns of content |
| `large` | **frozen at** `clamp(28em, 50cqi, 64em)` — about half the row | a grid, a table, wide content |
| `fill` | everything left over | the one page in the row that has something to spend it on |
| `full` | the whole host | one page at a time; the ancestors collapse into the crumb strip |

`full` is the "swap into the correct area" case. Its ancestors come back the moment you navigate
anywhere else — the crumb strip above the row is what you click.

⚠ **`full` does not touch the site's sidebar, and a probe that says it does is measuring the wrong
one.** Reported 2026-08-29 as "collapsed to 0×0", re-measured and closed: the site ROOT is a topic
with a sidebar of its own, so `document.querySelector(".sidebar")` finds *that* one first and it is
0×0 on every route except `/` — the arrangement contract has hidden its page. The real sidebar
holds **229 / 243 / 274px at 1280 / 1920 / 3440**, identical on a `full` column, on the finder root
with nothing open, on `/framework/`, and on a Doc page; the `full` column owns **1051 / 1677 /
3166** of its row. Stamping `page-column-full` on a *host's* own body — the one combination no page
ships — changed neither number. Take the visible one: `[...document.querySelectorAll(sel)].find(e
=> e.getClientRects().length)`.

**`fill` is `full` that lets its neighbours stay**, and the difference is two values. Both start
from a 100% basis; `fill` *shrinks*, so every column left of it keeps its floor instead of being
hidden, and it has a 16em floor of its own. There is no `:has()` rule for `fill` and there must
not be one — collapsing the ancestors is the whole of what makes `full` a different word.

⚠ **`fill` yields to an open child** (2026-09-05): a `fill` page that is also `.active-ancestor`
— a child column open beside it — falls back to the default flex share and the `large` ceiling
(64em) instead of claiming the row alone, so the child gets a real width. Both research fronts
(`imagine/research/`, `imagine/platform/research/`) are `width: "fill"` again for it. Numbers
and the rule: `doc/decisions.md`.

⚠ **`fill` is for a page whose content is not prose.** It removes the ceiling, so at 3440 it hands
one paragraph a 2410px line — the [`layout`](/framework/styles/rules/) rule "widening a column is
never the fix for dead space" applies to it exactly. A grid, a table, a canvas, a preview wall:
those earn it. Prose does not, and has the default's 40em for that reason.

⚠ **`hug` needs its ceiling, and that is not a compromise.** `flex-basis: auto` on a column is
its **max-content** width, and the max-content width of a *paragraph* is the paragraph on one
line. So hug hugs a **list** — the rows are short and the widest one is the answer — and gives
prose a 24em note. A hug column that ships with a `content()` line is measuring the line, not the
list; the Finder's `Notes` rail has none for exactly that reason. Its 6em floor is
`Page.column_floor` said in `em`: the narrowest a *drag* may leave a column and the narrowest a
*word* may ask for are one number.

## A column that is open never pays for the next one

**The rule, in one sentence.** A column that is already open never changes width when a
column opens to its right; the new column takes what is left over, and when nothing is left
the row **scrolls sideways** — the Finder way — instead of squeezing what is open.

Until 2026-09-18 a column's width was a function of *how many columns were open*. Two took
half the row each; a third arrived and all three took a third. Every open column got
narrower, its prose rewrapped into more lines, and every nav link below that prose moved down
the page. That was the whole defect, and it was one value in `core/Page/Page.css`:

```css
/* before */   flex: var(--page-column-flex, 1 1 0);
/* after  */   flex: var(--page-column-flex, 0 0 var(--page-column-recommended, clamp(40em, 42cqi, 46em)));
```

A column's width is now a function of **itself**. `--page-column-recommended` is the same
token `max-width` already read, so the width a column takes and the ceiling it may not pass
are one number — and so is the `N` the even mode computes from it.

`large` needed one more line. It never set a flex of its own; it *grew* into its 64em
ceiling, and frozen at a flat 64em it would have been 1024px at every screen width — two of
them scrolling a 1920 screen while 3440 kept 1.4k of empty row. It takes the same clamp shape
the default and `small` already use: `0 0 clamp(28em, 50cqi, 64em)`.

**Nothing else moved.** `small`, `hug`, `fill` and `full` all set `--page-column-flex`
themselves, so the new fallback never reaches them; a drag writes the same token inline; the
even mode re-declares it at (0,5,0); and the `< 32em` phone regime writes the properties
directly, later in the file. All five still win.

### What it changed, measured

Twelve columns hosts — `/imagine/` and three realms two levels deep, plus the Finder and the
four `uses/` screens — crawled at 1280 / 1920 / 3440, before and after, headless, one fresh
context per page and width. Every open column's width, the row's horizontal overflow, and the
console. Zero console errors on all five core hosts, before and after.

| host | 1280 | 1920 | 3440 |
|---|---|---|---|
| `/imagine/` — the `large` Start column | 962 → **640** | 1024 → **960** | 1152 → 1152 |
| `/imagine/platform/` — two topic columns | 535 → **640** each | 806 → **960** each | 1152 → 1152 |
| `/imagine/platform/research/` — topic, then `fill` | 421 / 648 → **640 / 430** | 448 / 1165 → **960 / 653** | 504 / 2504 → **1152 / 1856** |
| `uses/docs`, `uses/inbox`, `uses/split`, `uses/workbench` | unchanged | unchanged | unchanged |

The four `uses/` screens did not move because their columns were already inside the room:
a rail plus one reading column is 812px in a 1039px box, so there was never a squeeze to
remove. The `/imagine/` realms are where two and three real columns compete, and 535px was a
reading column **66px under its own measure**.

**Where the sideways scroll appears.** Exactly where the squeeze used to be, and nowhere
else: `/imagine/platform/` scrolls **211px at 1280** and **307px at 1920** (rail + two 640 /
960 columns against a 1280 / 1920 row) and **0 at 3440**, where three columns still fit. On
every other page in the crawl, at every width, the row's overflow is 0 on arrival. The empty
room past the last column is not grey: `.page-columns-row` paints it as the column slots it
is, so the row says *more opens here*.

**Open a child and re-measure every column that was already open: 0px of width change and
0px of nav movement**, at all three widths, on every host in the crawl. The lab's own readout
agrees — its *today* row, which is built from core's classes, read 129px of nav movement and
225px of width change at 1280 before this change and reads **0 and 0** now:
[/web/nav/doc/study/](/web/nav/doc/study/).

### The alternative, and the sentence that picks between them

The other tuning measured was **`0 0 clamp(16em, 34cqi, 46em)`** — about a third of the row.
It holds still exactly as well, *and* it keeps a 3440 screen full: three columns fit at 1280,
four at 3440. What it costs is the measure. A reading column becomes **357px at 1280**, a
note's width rather than a page's, and prose under its measure is the failure this site has
spent months removing. It also costs a number — `34cqi`, "about a third of the row" — that
the shipped tuning does not need, because the shipped one reuses the recommendation already
in the file.

> **Hosts that must fill a wide screen use even columns.**

That is the whole of the trade. The elastic mode now optimises for one thing — an open
column keeps its reading width — and a host that would rather spend the whole row says
`this.columns({ even: true })` and gets N columns that divide the room exactly, with no
leftover and no scroll until more than N are open. Two modes, one word apart, and neither
one needs a third number.

## Even columns — one width, and N is the room's answer

Every column in the row is the **same width**, and how many of them there are is computed
from the room rather than declared by the page. One option on the opt-in:

```js
initialize(){ this.columns({ even: true }); }
```

**Live:** the [Finder](/framework/core/Page/overview/columns/finder/) runs it; the four
[uses](/framework/core/Page/overview/columns/uses/) next door and the demo box still run the
elastic mode, so the two are one click apart. Side by side against today's behaviour and
against the [proposal](/framework/ai/2026-09-17/nav-stability/) that came before it, with the
numbers measured live: [/web/nav/doc/study/](/web/nav/doc/study/).

Two lines of arithmetic, run on the row's own `ResizeObserver`:

```
N     = max(1, floor(available / recommended))    // `fit: "round"` rounds instead
width = available / N
```

`available` is the **row's** inline size, not the window's. The owner asked "screen or
container?" and the answer has to be container: the same row can be a page, a panel, a demo
box or one half of a split, and a window measurement would be wrong in three of those four.
A window is simply the largest container.

`floor` is what buys the guarantee: **a column is never narrower than the width it
recommends.** It costs the other side of that trade — see *what floor costs*, below —
and a host that would rather pay it the other way says so in one word: `fit`.

### The number that decides it — `--page-column-recommended`

One token, and it defaults to the ceiling the elastic mode already had,
`clamp(40em, 42cqi, 46em)`. It is not declared anywhere in core: `even_columns()` reads it
back off the body's computed `max-width`, so the browser resolves the `em` and the `cqi` and
there is no second copy of the number in JS. A page retunes it like any other token:

```css
/* three narrower columns at 1280 instead of one wide one */
.page--my-browser { --page-column-recommended: 32em; }
```

⚠ **Declare it above the row, never on a column body.** Core reads it, it inherits, and a
declaration on the body itself is the one thing that would out-rank an author's.

### `fit` — how the room becomes a count

```js
initialize(){ this.columns({ even: true, fit: "round" }); }
```

Two answers, and `floor` is the default:

- **`floor`** — `N = floor(room / recommended)`. A column is **never narrower** than the width
  it recommends, so prose never falls under its measure. The cost is room left over, spent as
  padding inside the columns — about 227px a column at 3440.
- **`round`** — `N = round(room / recommended)`. Fills the room tighter, and a column **can go
  under** its recommendation to do it.

`floor` is the default because a reading column under its measure is the failure this site
has been fighting. `round` is one word away for a host whose columns are a list, a grid or a
picker rather than prose — things that would rather have one more column than a wider one.

⚠ The option is stored as `column_fit`, prefixed, for the same reason `column_even` is: a
page's config is `Object.assign`ed *over* the prototype, so a bare `fit:` is a word a page may
well want for itself. Neither is ever a declared field.

### N, measured — the Finder, on the default recommendation

The `em` ramps with `--size` (15.04px at 1280, 16 at 1920, 18 at 3440), so the recommendation
ramps with it. The Finder's row is the window minus the site sidebar.

Re-measured 2026-09-18, after the freeze above widened the box the demo sits in. `round`
is the same row read with `fit: "round"`, from the same `Page.even_columns()` call.

| screen | row | recommended | **N** (`floor`) | each column | **N** (`round`) | each column |
|---|---|---|---|---|---|---|
| 400 | 400 | — | — | the `< 32em` phone regime, untouched: one column at a time | — | — |
| 1280 | 1039 | 601.6 | **1** | 1039px | **2** | 519.5px — 82px **under** the recommendation |
| 1920 | 1664 | 698.9 | **2** | 832px | **2** | 832px — the same answer |
| 3440 | 3152 | 828 | **3** | 1050.7px | **4** | 788px — 40px **under** the recommendation |

1920 is the case worth reading twice: `floor` and `round` agree there, because 1664/698.9 is
2.38 and both round it down. The two answers only ever differ when the leftover is more than
half a column — which is also the only time `round` is worth asking for.

⚠ **N = 1 at 1280 is the honest answer and it is a real cost** — a 1280 desktop gets one
column at a time, the phone's arrangement on a big screen, and the rail is reachable only
through the crumb strip. `--page-column-recommended: 32em` gives that row **N = 2** at 525px
each. Which of the two a browser wants is the page's call, which is why it is a token.

### What stands down

All six width words, rail included — that is the whole of what "even" means, and it is what
the owner asked for: *"I think it was a mistake to use different sized columns, at least
initially."* The mode re-declares the three width tokens at (0,5,0), above every word.

Three things still win, and each on purpose:

- **`full`**, because it is the one word that is not a width: it claims the host and collapses
  its ancestors into the crumb strip. Left on the even width it drew one 1055px column in a
  3166px row with two empty slots beside it.
- **A drag.** `resize_column()` writes the same three tokens *inline*, so dragging a seam opts
  that one column out of even for this visit; double-click puts the even width back.
- **The `< 32em` phone regime**, which writes the three properties directly. `even_columns()`
  sees its `max-width: none`, reads that as "the phone regime has this", and leaves the row
  alone — core's own threshold, read off core's own rule, so the two cannot drift.

### Fixed navigation — the measurement

Arrive at the Finder, then open one child at a time, and after each click re-measure **every
column that was already open**: its width, its x inside the row, and the top of its first five
nav links. Headless, one fresh context per width.

| screen | widths changed | nav links moved | x inside the row | x on screen |
|---|---|---|---|---|
| 400 | 0 | 0 | 0 | the phone regime's own page-turn |
| 1280 | **0** | **0** | **0** | one column (N = 1, so every open scrolls) |
| 1920 | **0** | **0** | **0** | 0 for the 2nd column, then one column |
| 3440 | **0** | **0** | **0** | **0** for the 2nd and 3rd, then one column |

Read the last two columns together, because that is the whole mechanism. **A column's place
in the row never changes.** Until the row is full nothing moves on screen either — at 3440 you
can open two more columns and not a pixel shifts, because the slots were already there. Past
N the row scrolls by **exactly one column**, never a fraction of one, and that move is the
slide below. The columns that leave are reachable from the crumb strip above the row.

The lab prints the same two numbers from inside the page, and an independent headless
measurement of the same click agrees with it exactly at every width: today **129px / 225px**,
the proposal **0 / 0**, even **0 / 0** with **N = 3 (351px each)**.

### The slide — three ways, measured

Frames longer than 50ms during the move, 5 runs at each of two widths, counted with a rAF
timestamp loop:

| how | long frames | worst frame | what it costs to write |
|---|---|---|---|
| instant (what the elastic mode does) | 0 | 16.8ms | nothing — and nothing moves visibly either |
| **native smooth scroll** | **0** | **16.8ms** | **one word on the scroll the row already does** |
| FLIP — `translateX` + Web Animations | 0 | 16.8ms | a scroll listener and one animation per flex item |
| View Transitions — `document.startViewTransition` | **23** | **116.7ms** | a whole-document snapshot |

Smooth scroll and FLIP tie on jank, so the cheaper one wins: **the row is already a scroller**,
and asking the browser to animate a scroll it was going to do anyway is one argument. View
Transitions lost on its own merits — all 23 long frames were at 3440, where it snapshots a
3440×1400 document twice and drops about 20 of the 56 frames in the window.

Measured on the shipped code: a click ramps through 38 scroll positions over **600ms** at 1280
and 33 over 517ms at 3440, with **0 long frames**; `prefers-reduced-motion: reduce` gives two
positions and 0ms.

⚠ **It is an argument, not `scroll-behavior: smooth` in the sheet.** A stylesheet cannot tell
an arrival from a click, and a cold load straight at a four-deep url would have slid 3153px
while you were trying to read it. `settle_columns(slide)` takes the one fact only the caller
knows: the `ResizeObserver` owns the arrival and the resize and passes nothing, the
`requestAnimationFrame` owns the click and passes `true`. Verified: a deep cold load polls
exactly **one** distinct `scrollLeft`.

⚠ **Only the even mode slides.** In the elastic mode the columns *resize* as the row scrolls,
and animating a reflow is how you get the jank this mode exists to remove. Dropping
`this.column_even &&` from `column_slide()` is all it would take to change that.

### What `floor` costs, and what `/imagine/` would read

`floor` never goes below the recommendation, so it can go well above it: at 3440 the Finder's
columns are 1055px against a 828px recommendation, and since prose is still capped at
`--measure`, about 227px of each column is padding. `round` would give four columns of 791px
and fill the row tighter, at the cost of the guarantee. **That is a knob, not a bug** — the
owner's sentence asked for "each column wants to be 1000px, so we render 3", which is `floor`.

`/imagine/` deliberately has **not** switched. Measured by applying the class and the
arithmetic to the live page without editing it:

| screen | row | recommended | N | each | its rail today → even |
|---|---|---|---|---|---|
| 1280 | 1280 | 601.6 | 2 | 640px | 205 → **640px** |
| 1920 | 1920 | 736 | 2 | 960px | 307 → **960px** |
| 3440 | 3440 | 828 | 4 | 860px | 432 → **860px** |

Its rail holds **25 children**, of which 6 / 9 / 3 already sit below the fold at 1280 / 1920 /
3440 — a number the mode does not change, because widening a column adds no vertical room. The
cost is sideways: with N = 2 the rail leaves the screen the moment you are two columns deep,
taking all 25 entries with it, where today's 205px rail survives four. A place whose root IS
its rail wants `--page-column-recommended` tuned before it switches, or it wants to keep the
word. **The owner's call.**

## `index` — a column whose cards ARE the nav

A column normally lists its children as rows under its prose. An **index** column has
already drawn them, as a `previews()` wall in its own `content()` — so the rows say the
same things a second time, once as cards and once as a rail.

```js
export default new Page({
    meta: import.meta,
    width: "large",
    index: true,                            // core leaves its row list out
    children: "left right both foot …",
    content(){ md("Ten app shells."); this.previews(); },
});
```

**Three pages had suppressed it by hand** before this word existed — `/layouts/labs/shells/`
wrote the whole of `column()` out again (ten lines, identical minus the rows),
`/layouts/labs/screens/` did it in CSS, and `/imagine/vary/` shipped the double list — all
three wear the word now (the tidy pass, later the same day). Measured on shells at 1280
and 1920: **10 rows + 10 cards → 0 rows + 10 cards**, and the page.js override became
one word.

It is a **field**, not a method — `nav:` would shadow `nav()` the way `opens` shadowed
`opens()` (below), and `rail:` is already four pages' own word (`overview/site`,
`overview/docs`, and two under `old/`). Grepping the consumer pages for the name is the
step that picked it.

⚠ **`index` is for a column that shows its children ANOTHER way, not for hiding them.**
A column with no wall and no rows is a dead end — the `×` and the crumb strip are the
only way on. `layout` Q4 is the test: *does the page show each thing exactly once?*

## Resize — drag the seam

Every column has a 6px seam at its inline end. Drag it and that column keeps the width you left
it at; **double-click it** and the page's word comes back.

The drag writes the **same three tokens the width words set**, one level stronger — an inline
custom property out-ranks a class — so there is no second mechanism and nothing to keep in step:

```
--page-column-flex: 0 0 374px;  --page-column-min: 0;  --page-column-max: none;
```

Measured (headless, the live Finder at 1920, the root `small` rail):

| gesture | before | after |
|---|---|---|
| drag right 150px | 224px | **374px** — the move exactly |
| drag left 120px | 374px | **254px** |
| drag left 300px | 254px | **96px** — `Page.column_floor`, the clamp |
| double-click the seam | 96px | **224px**, and the inline style is empty again |

The row's `scrollWidth` equals its `clientWidth` at every one of those steps: **the seam costs the
row nothing.** It is `flex-basis: 6px` with `margin-inline-start: -6px`, an outer size of zero
pulled back onto the column it resizes, so the arithmetic below is still nothing but the bodies.

- **Per visit.** Nothing is stored — reload and every column is back on its word.
- **It is a sibling of the body, not a child of it.** `.page.column` is `display: contents` and
  cannot host an event; the body is a scroller, so an overlay inside it would scroll out of view.
  `column_grab()` puts the seam between the body and the child region, where the row sees it.
- **Nothing to drag under 32em.** The row is already one column at a time down there.
- **The `×` never collides**: it sits inset from the column's right edge and the seam is the outer
  6px. The seam *does* overlay the outer few px of a scrolling column's thin scrollbar — the wheel
  is the other way to move a column. (No probe on this repo can see that: headless Chromium has
  overlay scrollbars.)
- **The head's padding is `--page-column-pad-y`, not `--page-column-pad-x`** (2026-09-05): a hard
  `0.55em` never grew with the row, so the `×`'s corner inset badly outgrew the title's — the head
  now takes `pad-y` on both blocks and on the `×`'s (trailing) side, `pad-x` only on the title's
  (leading) side, a square `pad-y` inset for the close button at every width. Measured: `doc/decisions.md`.

## `default` — the column a host arrives with

A column browser showing only its own rail leaves **80–93% of the row empty** at 1280–3840
(measured below), and three of the seven recipe labs shipped that way. A host names the child
that opens on arrival with the word the arrangement contract already has:

```js
children: {
    Overview: { width: "large", classes: "default", content(){ … } },   // open on arrival
    Metrics:  { width: "large", content(){ … } },
}
```

`Page.default_column()` finds it and the host *builds* it — a page is only constructed when it
activates, so a mark alone would have nothing to show — and `Page.css` stands it down the moment
a real column is routed beside it. Nothing changes in the url: arriving at the host and clicking
that child give the same screen.

⚠ **`classes` is additive on a column**, where `render()` lets it replace a page's shape. A column
has no shape to choose, so a declared class can only be an extra — which is also what lets a
columns host be marked `default` itself and live in a panel it is never routed to.

⚠ **A default column is never routed to, so it never got an `app`.** `child()` is where a page
is handed the app, and nothing calls `child()` for a page the host builds itself — so
`this.app.router` inside a default column's content threw *"Cannot read properties of undefined"*
(`/layouts/labs/screens/deck/`, 2026-08-29). `render_column()` now assigns `app` as it builds the
child, which makes it the **second** place the app is handed down. The general shape of this
bug: `add()` copies `app` at *declaration* time, when a `page.js` at module scope has none yet,
and only a later routing fills it in.

⚠ **A `default` column may not also be a PARENT you route into.** `Page.css` hides
`.page-column-pages:has(> .page:is(.active-page, .active-ancestor)) > .page.default`, and a
routed default page satisfies that test *itself* — the whole branch goes blank. Measured
2026-08-29 twice, from `imagine/gallery/lists` and from a team-board draft. Whatever must stay
visible goes **up** the tree, not across it.

## `bleed` — reaching the column's edge

A column's content sits in `.page-column-prose`, inset by the host's pad tokens —
`clamp(0.7em, 0.8cqi, 1.6em)` / `clamp(0.9em, 1.6cqi, 3em)` since 2026-09-01, so a wide row pads
generously and a narrow one keeps yesterday's constants; the crumb bar, every head and every item
row read the same `--page-column-pad-x`, one indent per row. Prose text (`p`, headings, lists,
`.md`) is also capped at `--measure` — a `full` column is not a license for a 3410px line; an
`.md` holding a table marks itself `.ac("wide")` to stand the cap down.
`table-equal` (`framework.css`) is the companion word for the table itself — `.ac("wide table-equal")` splits its columns evenly instead of by content.

⚠ **`bleed` is for PAINT** (the owner, 2026-09-01): a wash or a background image may butt the
column's edge. A framed box — a card wall, a figure, a table — or bare text never bleeds; the
padding study's own "CLOSEST REAL MISS" caption sat 0px from the viewport edge on a bled card
wall. A **picker list or a flush wash** wants the real edge, and the word
for that is the one the page shell already uses:

```js
content(){
    md("Pick one.");
    div.c("bleed flex v", () => items.forEach(item => button(item.from)));   // flush to the column
}
```

`.page > .bleed` spends the page grid's gutter tracks; `.page-column-prose > .bleed` spends the
column's inset. One word, two containers — and the inset is now the tokens
`--page-column-pad-x` / `--page-column-pad-y`, so nothing hand-types the number a second time.

⚠ **Direct child only.** A nested column's own prose is three levels down through
`.page-column-pages`, and a descendant selector would have it unpick its own inset.

⚠ **The block ends are cancelled only at the ends** (`:first-child` / `:last-child`). A bled block
between two paragraphs keeps its rhythm; the local hatch this replaced
(`examples/grids/grids.css`, `margin: -0.7em -0.9em`) cancelled both ends unconditionally and got
away with it only because it was always alone in its column.

⚠ **That block-margin half was silently dead until 2026-09-05.** `framework.css`'s
`@layer util` declares a bare `:first-child { margin-top: 0 }` / `:last-child { margin-bottom: 0 }`,
which beats a `theme`-layer rule at any specificity — so a bled block that was its column's first or
last child kept a full `--page-column-pad-y` strip above/below it no matter what this selector said.
Fixed by moving these two declarations into `@layer util` alongside it (`styles/doc/cascade.md`).

## Measured 2026-08-29 (headless, the live page, 900 tall / 1400 at 3440)

⚠ Historical: measured before 2026-09-01, when `small` and the default ceiling became
row-scaled clamps (the table above) and the pad tokens moved to the host as `cqi` clamps —
at 3440 a `small` rail is now 432px, not the 252px below, and the default ceiling 46em.
The shape of the columns (who floors, who caps, who fills) is unchanged.

| viewport | row | `small` | `hug` | default | `large` | `fill` | `full` |
|---|---|---|---|---|---|---|---|
| 400 | 400 | 400 | 400 | 400 | 400 | 400 | 400 |
| 1280 | 1051 | 211 | 100 | 241 | 421 | 420 | 1051 |
| 1920 | 1677 | 224 | 107 | 410 | 1005 | 1005 | 1677 |
| 3440 | 3166 | 252 | 120 | 720 | 1152 | **2410** | 3166 |

Read the last two columns together — that is the whole of `fill`. At 1920 `large` and `fill` are
the same 1005px, because `large` has not reached its 64em ceiling yet and there is nothing else
asking. At 3440 `large` stops at its ceiling (1152) and leaves 1258px of empty slots; `fill` takes
**2410 = row − the three rails**, and the row is exactly the sum of its columns. `hug`'s numbers
are the Finder's two-row `Notes` rail measuring itself — they are that page's, not the word's.

Under 32em of ROW the arrangement pages one column at a time and the snap does the rest — 400 is
that regime, which is why every word measures the same there.

**Arriving and navigating agree.** A cold load straight at a five-deep url and the same page
reached by clicking down from the root produce the identical row at every width — five columns,
same widths, same `scrollLeft`. That is the one thing the first sketch got wrong (below).

## The mechanism

Every page keeps its `$pages` region **inside its own view**, so the DOM is an ordinary nested
tree and [the arrangement contract](/framework/core/Page/doc/css/) is untouched: a column closes
because it lost its mark, not because anything moved it. Then `display: contents` on every
descendant page and every region deletes those boxes from *layout*, so the only flex items the
row ever sees are the column bodies. Peers on screen, a tree in the DOM.

The shape is asked for at **render** time (`column_host()` walks `chain()`), never walked over the
tree — so a child that only loads when you navigate to it is a column too.

⚠ **`column_host()` returns the SHALLOWEST columnar ancestor** — `chain().find(…)`, not
`findLast()` the way [`nearest()`](/framework/core/Page/doc/roles/) works. So a columns host
*inside* another one is not a host: its `columns()` call is inert and its subtree simply joins
the outer row. `/imagine/gallery/` calls `columns()` and is a plain column of `/imagine/`'s row.
**That is the current contract, not an oversight** — one row, one crumb strip, one scroller —
and a page that needs a row of its own escapes the tree instead (`layouts/labs/shells/Shell.js`
overrides `container()` and `render()`; `demo.app()` is the only way to put a real row inside
one). Nested rows are open, and flipping to `findLast()` is not the whole of it: the crumb
strip, the `×` and `reveal_column()` all assume one host per screen.

Colours: transparent bodies over one `--wash` floor, every seam a 1px `--line` hairline. Never
`--well` — it is a translucent shadow, not a palette colour, and stacking it is what banded
`/framework/ux/*`.

## What has bitten

- **`:has()` does not care whether a page is painted.** A closed page is still in the DOM, so the
  rule that collapses the ancestors under a `full` column went on matching after you navigated
  away and hid them for the rest of the session. The mark is part of the test:
  `:is(.active-page, .active-ancestor, .default)`.
- **Going up the chain activates nothing.** `Router.activate()` only touches what changed, so a
  crumb strip refreshed only from `activate()` kept the departed leaf forever. `deactivate()`
  refreshes it too, from the shallowest page to leave.
- **Two sheets cannot own one class name.** `old/overview/columns/` shipped its own
  `.page.columns` and `View.stylesheet` is global, so both landed on both demos. The snapshot is
  deleted; the live one is the only copy.
- **`scroll-snap-type: x mandatory` undoes the reveal** — a mandatory row re-snaps on every
  relayout and the deepest column arrives clipped. `proximity`. And a container query never
  matches its own container, so the narrow rule can only restyle the body.
- **`requestAnimationFrame` never fires the first reveal.** A page is built *detached*; every rect
  is 0. A `ResizeObserver` on the row is the trigger that works, and it is also right on resize.
  The rAF is still needed for later navigations — marks land *after* `activate()`.
- **`--page-pad` inherits** from the region, so the host says `padding: 0` or it sits inside its
  own box. And the body reads `--page-column-max`, **not** `--measure`: a demo region sets
  `--measure: none`, which would silently uncap every column.
- **Columns and tabs — do not.** A full-height row under a `.block` tab bar cuts through the open
  tab's bottom edge and loses the flush tab-to-content effect. Columns are their own screen.
- **A hover fill is chosen against the box it lands on, not from the palette's middle.** The nav
  rows carried `background: var(--tint)` and read as having *no hover at all* — in lew42 `--tint`
  (`#f8f8f8`) is LIGHTER than the `--wash` (`#f2f2f2`) a column body sits on, so the row lit up by
  six points in the wrong direction. A translucent `color-mix(in srgb, var(--ink) 6%, transparent)`
  cannot have that bug: it darkens whatever it is over, so one declaration covers the ambient body
  and the `--tint` / `--surface` recipe columns alike.
- **A `.pages` region squashed a columns host it was showing as `default`.** The region's
  presentation rule — a 40em cap, a 3em inset and `display: block` for a page with no layout of its
  own — computes to (0,4,0) and beat `.page.columns` (0,2,0) outright, so a host inside a panel lost
  its whole row. The rule is now split: the sheet half says `:not(.columns)`, and a host asks the
  region for a flex share and nothing else.
- **The three width tokens inherit, and a nested `.page.columns` row used to take its ancestor's.**
  `--page-column-flex` / `-min` / `-max` are declared on a column BODY, and custom properties
  inherit — so a `demo.app()` row built inside a `full` column took `1 0 100%` / `none` for every
  wordless column of its own, rendering one 1202px wide in a 1202px row. Fixed 2026-09-05: `.page.columns`
  resets all three to `initial`, so a nested host starts from its own defaults regardless of what
  wraps it (`ai/2026-09-05/core-fixes/`).

## The empty room — absorb was tried, and the answer is empty SLOTS

**The finding (UX recon, 2026-08-27):** a host that has opened one column leaves 80% of the row
grey at 1280 and **93% at 3840**, and a flat grey field reads as a page that failed to render.
Every columns host on the site arrived that way.

**"Let the last open column absorb the rest" was implemented and measured. It is a no.** The rule
was one selector — the leaf test below, negated, raising the leaf's `flex-grow` and ceiling — and
it does close the numbers (80–93% dead → 8–68%). It closes them by breaking the thing the width
words exist for:

| | before | absorbing |
|---|---|---|
| the Finder's `small` rail at 3440 | 252px | **1152px** — three nav rows with the chevron 900px from its label |
| the deepest prose column at 3440 | 720px | **1152px** — one sentence past the 40em measure |
| dead space at 3840 | 93% | **68%** — and the void is still the headline |

So it trades a measure it was told to keep for a void it does not close. `layout`'s own rule
already said it — *widening a column is never the fix for dead space* — and
`examples/grids/measure-3440` had measured the same trade on itself.

**Shipped instead: the leftover is drawn as the column slots it is.** One `repeating-linear-gradient`
of the row's own `--line` every `small` track, and an opaque `--wash` floor under the real bodies so
the hairlines cannot paint through them. Nothing moves, nothing is measured, no DOM: the screen says
*more opens here* instead of *nothing rendered*. A scrolled row has no leftover and never shows one.

The two real answers to a wide screen are unchanged and both are declarations: a wider **word**
(`large`, `full`) for a page that earns it, and a **`default` column** so the host arrives with
something open.

⚠ The body's fill is `:where(.page-column-body)`, at specificity **zero**, so every appearance
recipe out-ranks it with one class. Written at its own `(0,1,0)` it would have tied `looks.css`'s
`.page--tint > .page-column-body` on load order; written at the `(0,3,0)` it was first drafted
with, it silently erased all four backgrounds the `looks/backgrounds` lab exists to show.

## Open — the owner decides

- **Should a dragged width survive?** Resize is per visit today, which is the honest default —
  nothing is written, so nothing can be stale or wrong on the next machine. Making it stick needs
  three answers first: **what owns the width** (the page? the url you were on when you dragged it?
  the *slot* — "column 2 of this row", so it holds while you browse), **where** (`localStorage` per
  url is a line; the path-based store the imagine program is scoping is the other), and **how you
  get out of it** — a saved width that outlives the layout is a bug you cannot see, so a reset has
  to be reachable from the page, not just from the seam.
- **The `×`** on every non-host column closes it and everything right of it (href = the parent's
  url). Keep, or a plain head?
- **Should `default` cascade?** A `default` child that is itself a host opens *its* default too, so
  a tree could arrive several columns deep. Nothing does it yet, and nothing stops it.

Related: [`css.md`](/framework/core/Page/doc/css/) — the visibility contract this leaves alone;
[`layout.md`](/framework/core/Page/doc/layout/) — nested vs `full`.
