# Why prose spacing balloons at 3440 — and the one number that fixes it

**The answer in three lines.** On a 3440 screen the gap between two paragraphs was **54px**;
on a 1280 screen the same gap is **30px**. That is **1.80x**, and the verdict was 1.5x.
One number caused it — the **ceiling of the `--flow` clamp** in `public/framework/framework.css`
— and lowering that ceiling from `3em` to `2.5em` brings every measured page to **1.50x or less**
while changing **nothing at all** at 1280.

That change is **applied**. The measurements are below.

---

## The rule, in one paragraph

`--flow` is the rhythm token: the space between a paragraph and the next paragraph, and (times
1.5) between a paragraph and the next small heading. It is written as
`clamp(2em, 1.4cqi + 0.8em, 3em)` — a floor, a fluid middle, a ceiling — and **every part of it is
in `em`, which means it is a multiple of the font-size of the element it lands on**. Two things
then grow at once on a wide screen. First, the body font-size itself is a viewport ramp: 15.04px
at 1280, 18px at 3440, **1.20x**. Second, the clamp moves from one end of its own range to the
other: at 1280 the fluid middle is small, so the **floor** (`2em`) wins; at 3440 the middle is
enormous — `cqi` is 1% of the nearest container, and nothing on these pages declares
`container-type`, so it falls back to 1% of the **viewport**, making `1.4cqi` alone 48px before a
single `em` is added — so the **ceiling** (`3em`) wins. Floor to ceiling is **1.5x**, and it
multiplies the font ramp: 1.5 x 1.20 = **1.80x**. That is the whole mechanism. The heading rules
are innocent: the `x1.5` for an h3 is applied identically at both widths, so it cancels out of the
ratio (it only magnifies what `--flow` already said: 67.68px at 1280, 104.64px at 3440). And a
large heading never had the problem at all — an h2 is 2.25em, so its own `2em` floor is 81px at
3440, above the fluid middle, and it sits on the **floor at both widths**: it grows 1.20x, the
font ramp and nothing more.

**So: the ceiling is what a wide screen actually sees, and the ceiling was the thing to change.**

## The fix, as applied

`public/framework/framework.css`, one number, in the size standard's `:where(*)` block:

```diff
-        --flow: calc(clamp(2em, 1.4cqi + 0.8em, 3em)   * var(--size));
+        --flow: calc(clamp(2em, 1.4cqi + 0.8em, 2.5em) * var(--size));
```

(Two comments in the same file that quote the old ceiling and the old "54px at 3440" were
corrected with it, and the reasoning was left at the declaration.)

`2.5em` is not a taste pick: the largest ceiling that satisfies the verdict is 45.12 / 18 =
**2.507em**, so 2.5em is that number rounded to something a person can say. It gives 45px at 3440
against 30.08px at 1280 = **1.496x**.

### The proof that 1280 did not move

Every visible element on five pages, at 1280 and 1920 — its rect plus `margin-top`,
`margin-bottom`, `row-gap`, `column-gap`, `padding-top`, `padding-bottom` — captured before and
after:

| width | page | elements | changed | largest change |
| --- | --- | --- | --- | --- |
| 1280 | all five pages | 2210 | **0** | none - byte-identical |
| 1920 | paging docs, blog post | 460 | **0** | none |
| 1920 | paging home | 1057 | 703 | a 38.4px gap became 36px (-2.4) |
| 1920 | core/Page docs | 479 | 101 | a 38.08px gap became 35px (-3.1) |
| 1920 | cms | 214 | 53 | a 38.4px gap became 36px (-2.4) |

1280 is **byte-identical**: at that width the ceiling never binds, because the fluid middle is
below the floor everywhere. **1920 does move slightly, and it is worth knowing about**: text
smaller than the body (the cms page's `0.9em` prose, and small print elsewhere) has a lower
ceiling in px, so at 1920 its middle now hits it — a 38.4px paragraph gap becomes 36px, -6%.
Body-size prose at 1920 is untouched. If that 6% is unwanted, say so and the ceiling becomes a
width-aware value instead of a flat one — but that would be two numbers, not one.

A control the change cannot reach: a chip's or button's own padding is written in its own `em`
and never reads `--flow`, so no control changed size at any width.

## Still open — measured, NOT touched

Three things grow faster than 1.5x and none of them is the same knob. Each is a separate
decision, so nothing here was applied.

1. **`--gap` grows 3.07x** — 15.04px at 1280, 46.2px at 3440 (same page, same probe). Its middle
   is `1.5cqi - 0.3em`, which is viewport-driven in the same way, and its ceiling is `2.6em`.
   Bringing it to 1.5x means `clamp(1em, 1.5cqi - 0.3em, 1.25em)`, which **also cuts 1920 by 17%**
   (24px to 20px) and touches every flex row, grid and card on the site. A proposal, needing a
   look at 1920 before anyone types it.
2. **`--pad` grows about 3.6x on a full-width box** — 15.03px at 1280 to 54.22px at 3440 on the
   paging home page. It is a *percentage* of its own box rather than of the viewport, so the
   ratio is per-box and one number cannot describe it; measuring it properly is its own task.
3. **The wasted space the owner saw is mostly not spacing at all.** On `/imagine/paging/doc/` at
   3440 the page box is 3027px wide and the prose column is 720px — `--measure: 40em`
   (`core/Page/Page.css:62`). That leaves **1153px of empty page on each side**, which is 3x more
   empty room than every gap on the page combined. Nothing is wrong with capping a reading
   column; the question the owner's sentence really asks is *what the other 2300px is for* — a
   wider measure at 3440, a second column, a TOC rail, or a deliberate margin. That is a design
   decision, not a clamp, and it belongs to whoever owns the page.

4. ~~Four places outside this task's fence quote the old `3em`.~~ **Done** — the fence was
   widened and all four are fixed (below). Nothing under `framework/styles/` ever stated the
   number, so its docs were already correct.

## The four stale copies — fixed, 2026-09-13 (fence widened)

| file:line | what it was | what it is |
| --- | --- | --- |
| `public/imagine/design/size/size.css:26` | a **live copy** of all three tokens, still on `3em`, at `(0,1,0)` — so the study page rendered 54px at 3440 while the rest of the site rendered 45px | the copy is **deleted**, not corrected. The lab sets only `--size` and reads `--pad`/`--gap`/`--flow` from framework.css, which declares them on `:where(*)` and re-substitutes at every element — so the `cqi` terms still measure the box and the level chips still scale it. A demo that restates a number is a demo that can lie about it |
| `public/imagine/design/size/landing.md:15` | printed the landed block with `3em` | prints `2.5em`, plus a paragraph on why the ceiling moved and where the live number lives |
| `public/imagine/design/size/page.js:41` | the same block, printed on the page | prints `2.5em`, plus one muted line under the code block |
| `public/imagine/design/spacing/decision.md:15,21` | a superseded record whose table row and sentence both asserted the 3em cap as present tense | the 2026-09-05 formula is **kept** as the record and marked "as decided that day"; the row's 3440 cell and the sentence under it now carry the current 2.5em / 45px and a link here |

Measured after the deletion, at 3440: the lab's `--flow` by box width (400 / 900 / 2000 / 3000px)
is 32.4 / 32.4 / 40.5 / 40.5px — its floor, then the new ceiling — and by level chip
(small / regular / large) 30.375 / 40.5 / 60.75px, exactly 0.75 / 1 / 1.5. The study still
demonstrates what it says it demonstrates, now against the real standard.

---

## Pictures

`/imagine/paging/` at 3440, before and after: `paging-3440-before-after.png`
(and the docs page, where the paragraph gap is visible: `paging-doc-3440-before-after.png`).

---

## The measurements

Headless Chromium, a private dev server on 8095, 2026-09-13. Every number is
`getComputedStyle` on the live page. **before** = the `--flow` ceiling as it shipped
(`3em`); **after** = the ceiling this task changed to (`2.5em`). Both readings come from
the same page load, the "before" one with the old ceiling forced back by an unlayered rule,
so nothing but that one number differs between the two columns.

`/imagine/paging/make/` is **not** in the table: a sibling agent is rebuilding it, and two
identical runs of it ten seconds apart returned 498 elements and then 27. `/imagine/paging/`
and `/imagine/paging/doc/` stand in for it, as the brief asked. (The one make/ reading taken
while it was briefly stable matched the docs page exactly: h3 margin-top 104.64px at 3440,
67.68px at 1280.)

### The headline: the 3440 / 1280 ratio, per page

The verdict to beat: **3440 spacing may not exceed about 1.5x the 1280 spacing on the same page.**

| page | paragraph gap (`--flow`) | h3 margin-top | h2 margin-top | body font |
| --- | --- | --- | --- | --- |
| paging home | 1.80x -> **1.50x** | 1.55x -> **1.50x** | 1.20x (unchanged) | 1.20x (unchanged) |
| paging docs | 1.80x -> **1.50x** | 1.55x -> **1.50x** | 1.20x (unchanged) | 1.20x (unchanged) |
| core/Page docs | 1.80x -> **1.50x** | 1.55x -> **1.50x** | 1.20x (unchanged) | 1.20x (unchanged) |
| cms | 1.69x -> **1.41x** | 1.66x -> **1.50x** | 1.27x (unchanged) | 1.20x (unchanged) |
| blog post | 1.80x -> **1.50x** | 1.41x (unchanged) | 1.20x (unchanged) | 1.20x (unchanged) |

Every prose page lands on **1.50x or below** after the change. The h2 row never moved because
an h2 was never the problem (see **The rule**, at the top).

### The full numbers

`--flow` and the measured paragraph gap are the two numbers that had to agree: they do, to 0.01px,
on every page at every width.

| page | width | body font | `--flow` | paragraph gap | h2 margin-top | h3 margin-top | prose column |
| --- | --- | --- | --- | --- | --- | --- | --- |
| paging home | 1280 | 15.04 | 30.08 | -- | 67.68 | 67.68 | 541.44 |
| paging home | 1920 | 16 | 39.68 | -- | 72 | 72 | 576 |
| paging home | 3440 | 18 | 54 -> **45** | -- | 81 | 104.64 -> **101.25** | 648 |
| paging docs | 1280 | 15.04 | 30.08 | 30.08 | 67.68 | 67.68 | 601.59 |
| paging docs | 1920 | 16 | 39.68 | 39.67 | 72 | 72 | 640 |
| paging docs | 3440 | 18 | 54 -> **45** | 54 -> **45** | 81 | 104.64 -> **101.25** | 720 |
| core/Page docs | 1280 | 15.04 | 30.08 | 30.08 | 67.68 | 67.68 | 601.59 |
| core/Page docs | 1920 | 16 | 39.68 | 39.67 | 72 | 72 | 640 |
| core/Page docs | 3440 | 18 | 54 -> **45** | 54 -> **45** | 81 | 104.64 -> **101.25** | 720 |
| cms | 1280 | 15.04 | 28.75 | 28.73 | 60.91 | 60.91 | 492.8 |
| cms | 1920 | 16 | 38.4 -> **36** | 38.39 -> **36** | 64.8 | 66.24 | 576 |
| cms | 3440 | 18 | 48.6 -> **40.5** | 48.59 -> **40.5** | 77.32 | 101.4 -> **91.13** | 648 |
| blog post | 1280 | 15.04 | 30.08 | 30.08 | 67.68 | 67.68 | 601.59 |
| blog post | 1920 | 16 | 34.4 | 34.39 | 72 | 72 | 640 |
| blog post | 3440 | 18 | 54 -> **45** | 54 -> **45** | 81 | 95.11 | 720 |

All values in px. "paragraph gap" is the measured distance between two adjacent `<p>` siblings;
the paging home page has no two adjacent paragraphs, hence the dashes. h2/h3 margin-top is read
from a real heading appended into that page's own prose flow, so the real cascade applies.

