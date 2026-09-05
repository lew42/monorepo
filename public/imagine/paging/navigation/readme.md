# Navigation — stable or dynamic

**The one question:** when you click, does the thing you were reading move?

Two numbers answer it, and every navigation mechanism on this site has been driven
headless at 1280 and 3440 to get them: **how far it slid sideways**, and **how far it
slid up or down**.

- **Stable** — what you were looking at does not move. A sidebar rail, a crumb strip, a
  tab *strip*, a box with a reserved height. All measured 0px, 0px.
- **Dynamic** — something moves. A column opening (126px sideways), a tab *panel*
  changing height (1720px), a link that opens two columns at once (194px), a page taking
  the whole screen (everything).

**Live:** [/imagine/paging/navigation/](/imagine/paging/navigation/) — two boxes that do
the same two gestures, one stable and one not, with the numbers under each.

## Use

Four demos, and one idea in all four: **give the thing that changes a size of its own,
before it changes.**

- [Fixed columns](/imagine/paging/navigation/columns/) — `.paging-nav-fixed` on a columns
  host. Every column takes the width its word floors at, so a new one is appended rather
  than paid for by its neighbours.
- [Reserved height](/imagine/paging/navigation/reserved/) — `.paging-nav-reserve`. Two lines
  of CSS: every panel stays in the box, invisible ones are still measured, so the box is
  always as tall as the tallest.
- [Reserved tabs](/imagine/paging/navigation/tabs/) — the same two lines under a tab strip.
- [Full screen](/imagine/paging/navigation/screen/) — a whole screen whose left rail never
  moves while its sub pages swap the centre. This is the answer to *"can you go from a
  full-screen page down to sub pages without a jump?"*: yes, and a left rail is how.

## Watch out

- **Fix a column at its FLOOR, never its ceiling.** Elastic columns fill the row exactly,
  so pinning them at their widest overflows the row the moment a second one opens — and
  the row then scrolls itself to show the new column, which moves what you were reading
  after all.
- **`visibility: hidden`, never `display: none`,** for a reserved panel. A
  display-hidden panel is not measured, which is the whole thing being bought.
- **A reserved box builds every panel.** Right for a handful of similar panels; wrong for
  forty, or for anything expensive.
- **The `--page-column-*` tokens inherit.** A columns row nested inside a *column* takes
  that column's three tokens — a `full` ancestor made a default demo column 1202px wide
  in a 1202px row. Reset them on the nested host. (Core proposal in the task log.)

## More

- [The measurements](/imagine/paging/navigation/doc/measurements.md) — every gesture, the
  element watched, the before and after boxes, and the runner.
- [The realm's decisions](/imagine/paging/doc/decisions.md) — the rule this realm now runs on.
- [Columns](/framework/core/Page/doc/columns.md) — the width words and the seam these build on.
