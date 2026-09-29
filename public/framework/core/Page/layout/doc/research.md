# Research worth keeping — eleven layout rules, and the measurement behind each

Each rule below was decided once, with real numbers, in a task you can open. Read the rule;
open the task only if you are about to break it. Every other row the inventories found is in
[prior-work.md](/framework/core/Page/layout/doc/prior-work.md).

## Spacing

**Spacing is a clamp, never a constant.** `--pad`, `--gap` and `--flow` come from clamps in
`framework.css`, times one `--size` knob, so they grow with the screen. Columns scale their own
padding by `cqi` (the column's width). Under `--gap` there are four rungs (`--gap-70`,
`--gap-50`, `--gap-35`, `--gap-25`), and a multiplier like `calc(var(--gap) * 0.4)` is no longer
allowed. [spacing-clamp](/framework/ai/2026-09-01/spacing-clamp/) · painted live at
[/framework/styles/system/](/framework/styles/system/)

**A spacing ramp is space between and around things, never the size of a control.** A nav row
reached 67.6px tall because its own padding rode `--gap`, which is pinned at 2.6em above about
1400px. 26 of 380 size declarations misused the ramp. A control's padding, height and icon gap
stay in its own `em`. [nav-fat](/framework/ai/2026-09-06/nav-fat/)

## Padding and bleed

**The page gutter is padding, so no grid template can delete it.** It used to be two empty grid
columns; any host that redefined `grid-template-columns` silently deleted both, and text sat at
0px from the edge. 133 pages measured at four widths; violations went from 6 to 1. Check with
`node Server/padding-check.mjs <url>`. [padding-law](/framework/ai/2026-09-22/padding-law/)

**A region takes `.pad`, a framed box takes `.card`, a control keeps its own `em`.** A box with
a background of its own needs padding; `.card` carries it, scaled to the card itself. `.pad` on
a card sat pinned at its 1em floor inside anything narrower than about 1292px.
[card-word](/framework/ai/2026-09-19/card-word/)

**Bleed is for paint.** A background image or wash may touch its container's edge. A card, a
figure, a table or bare text never does: "CLOSEST REAL MISS" sat 0px from the viewport on a bled
card wall, on the padding study itself. [spacing-clamp](/framework/ai/2026-09-01/spacing-clamp/)

## Columns and navigation

**An open column freezes its width when a sibling opens.** The worst case was 242px of sideways
jump. An open column now holds a `34cqi` basis: 435px at 1280, 828px at 3440, and 0px of shift on
a click. [core-columns](/framework/ai/2026-09-24/core-columns/) · earlier:
[nav-stability](/framework/ai/2026-09-17/nav-stability/)

**Navigation never moves.** Either it is persistent (a rail that holds still to the pixel) or
the whole screen switches. Four mechanisms were measured at 0px of drift at 1280 and 3440.
[Navigation](/framework/core/Page/navigation/) · the measurements:
[/imagine/paging/navigation/](/imagine/paging/navigation/)

**One panel open at a time.** Several panels open at once was rejected with measurements,
because the Router follows one chain of pages. `.bleed` inside a column is the flush mechanism.
[column-pages-2](/framework/ai/2026-08-27/column-pages-2/)

## Names and the approved set

**Layouts have names, not numbers.** An id names the division of the room (`N-name`); one word can
describe many layouts; variations are tags, and clicking a tag is the feature. Flex versus grid is
a tag, not a different layout. [naming](/layouts/doc/naming.md)

**The approved set is closed.** Five layouts, each named, with the contract that locks them. A new
page picks one by name; a sixth is a proposal for the owner, never a commit.
[approved](/layouts/doc/studies/approved/)

**The five questions are judgements, never rules** (the owner, 2026-09-28: rules get followed too
literally). Each has its usual answers, drawn live. [/layouts/decide/](/layouts/decide/)
