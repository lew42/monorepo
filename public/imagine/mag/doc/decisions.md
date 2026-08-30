# Decisions — /imagine/mag/

The record for the magazine: what was chosen, what it was measured against, and what was
tried and dropped. The summary is [`readme.md`](/imagine/mag/readme.md).

## The composition, in three choices

**1. The magazine is a page tree, not a shell.** `/imagine/` is the columns host and
`column_host()` returns the *shallowest* claim, so the magazine could not open a row of its
own even if it wanted one — and it does not. Cover, contents and article are three pages in
one tree, three columns in one row, and every url cold-loads into the identical row you
would have reached by clicking.

**2. The cover is one page in three CSS states.** It never re-renders and holds no state:

| state | flex | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| alone | `full` | 1280 | 1920 | 3440 |
| contents open | `0 1 38.2%` | 489 | 733 | 1314 |
| an article open | `0 1 20%` | 256 | 384 | 688 |

Two `:has()` rules on the PAGE (not the body — an open child lives in the body's sibling
region). The second is written after the first *because* they are the same specificity:
`:has()` takes its most specific argument, and both arguments end in `.page:is(…)`.

**3. Three tone rungs, cover → contents → article, monotonic.** The vary lab's verdict said
with paper: stepping toward *cleaner* as you go deeper reads as a stack lifting toward the
reader. Measured (light / dark, computed background):

| | light | dark |
|---|---|---|
| cover behind you | ink 9% over surface — `#EEE` | `#373737` |
| contents | ink 3.5% — `#F8F8F8` | `#2D2D2D` |
| article | `--surface` — `#FFF` | `#262626` |

Mixed into `--ink`, which flips with the colour scheme, so the ladder steps the same
*direction* in both — where "cleaner" means darker in dark mode.

## What the numbers decided

**`flex-grow: 0` on the cover's share.** The screens lab's golden pair may grow, because
its two shares sum to 100% and there is no free space to divide. Here the columns beside
the cover have a flex-basis of **zero**, so a growing cover takes a third of the leftover on
top of its 38.2% and lands near 59%. The basis says the share; grow must not undo it.

**The reading state exists because 370px is not a measure.** With the golden share held at
every depth, 1280 landed on **489 / 421 / 370** — and 370px is 46 characters, well under the
forty ems the issue's third article is about. At a fifth the same row is **256 / 512 / 512**,
and 1920 is **384 / 896 / 640** with the article at its full ceiling. The cost is at 3440:
**688 / 1152 / 720**, 26% of the row left over, drawn as the empty slots core already ships
for it. That trade is the framework's own verdict — *widening a column is never the fix for
dead space* — taken in the direction it points.

**The cover block takes a share above 46em.** `width: min(100%, max(46em, 44%))`. 34% was
the first number and left the title floating in a third of 1920; 44% fills it and still lets
the `clamp` ceiling (12rem) catch the type at 3440.

**The figure plate is 6%, not 3%.** The frames and the tone swatches are made of `--surface`
cells, so the plate has to sit a step darker than the thing it holds or the diagram reads as
an empty box.

## What was rejected

**A spine.** The cover collapsing to a 2.8em vertical strip once you are reading — the
screens lab's `peek`, and very magazine. It frees the whole row at 1280 and leaves **46% of
3440 empty**, where the fifth-share leaves 26% and keeps a cover you can still read. Dropped
for the number, not the taste.

**Importing `screens/screen.js`.** It would have supplied `Screen`, `sheet()`, `frames()` and
the whole display-type scale for free, and the temptation was real. Two reasons not to: a
product importing a lab is backwards, and the sheet's own tone rule
(`:where(.page.active-ancestor > .page-column-body) .screens-area`) would have set the top
rung of this issue's ladder from another module. The *technique* is borrowed — two boxes, a
capped block that is the query container, `cqw` type — and it is about forty lines.

**A `default` column on the cover.** A cover that arrives with the contents already open is
not a cover. It would also have been illegal: a `default` column may not be a parent you
route into, and `Page.css` blanks the whole branch when it is.

## What bit

- **The UA's margins.** `p` and every heading keep them; framework.css zeroes them only for
  the children of `.flex`, `.grid` and `.wall`. Every box here arranges with `gap`, so the
  first draft had 20px of UA margin inside every one. One `:where(…) > * { margin: 0 }` at
  specificity zero, so the handful of deliberate margins still win wherever they sit.
- **The theme's type scale beats a component's.** `.theme-lew42 :is(h2, .h2)` is (0,2,0) in
  `@layer theme`; `.mag-sub` at (0,1,0) never applied and the subhead rendered at 2.25em,
  a few pixels off the title. Fixed at (0,3,0) — a two-class selector would only have tied
  and been decided by which sheet loaded last.
- **A subclass class-field runs after `super()`.** `Page`'s constructor calls `assign()`
  inside `super()`, so `no = ""` on `Article` would silently erase the number `contents`
  had just handed it. (Core's own `column_floor = 96` is the opposite case: a field on the
  *base* class runs before its own constructor body, so an argument still wins.)
- **A redrawing control detaches its handles.** The chip row rebuilds itself inside
  `notify()`, so a Playwright element handle taken before the first click is stale on the
  second. Re-query by index.
