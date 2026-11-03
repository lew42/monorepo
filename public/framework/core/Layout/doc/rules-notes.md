# Rules Notes

## LayoutRules — the three rules

Data on the layout page, one checker, one CSS class. No registry, no config file, no rules engine — a layout that says nothing accepts anything and goes anywhere (`accepts: "any"`, `allowed_in: "any"`), which is the owner's own instruction: *you don't want to overly restrict, or have to manage a massive whitelist.*

The deny list is three items, and the test for a fourth is one question: CAN CSS DO IT? If it can, it is a defect in `framework.css`, not a rule. The measure holds and centres, the three spacing ramps follow the box, `auto-fill` counts its own tracks — none of that needs a rule. These three are what is left.

1. **width** — a multi-column layout in a box narrower than its floor. Three tracks in 300px is three 100px tracks and no clamp saves it; the only answers are STACK TO THE FALLBACK or REFUSE, and that is a decision the layout's author makes.

2. **contrast** — a dark island inside a dark band. A colour is legal at every width; nothing in the cascade knows two tokens resolved to the same value HERE. It has to be compared.

3. **nesting** — two mechanisms cancelling each other — a `full` inside a `full`, a `sticky` inside an inner scroller. No value of any property un-collapses a doubly-collapsed row.

⚠ DEV ONLY, AND IT NEVER BLOCKS. The gate is the same `dev` constant `Page.class.js:7` uses. On the static production host the checker never runs and `.page-layout-warn` is never stamped, so a rule that is wrong costs an agent a red outline and never costs a reader a page.

## The checker: `check(layout, el)`

`el` is the box the layout was placed in. Returns `[]` or a list of `{ rule, says, url }`, where `says` is a plain sentence a newcomer can act on and `url` is the page that argues it. A violation CITES its rule page rather than restating it.

### FLOOR logic

Only the FLOOR is asked. Every entry's ceiling is 3440 and above a ceiling a layout HOLDS rather than stretching (the owner, addendum 4), so a ceiling can never make a layout unfit — it is not a silent omission. A box that has not been laid out yet measures 0, and a picker that greys the whole catalogue because it was asked too early is a lie.

## same_tone function

Rule 2, cheapest form that is true: the element's own text colour resolves to the same value as the background it is painted on. `styles/stacks/hunt.json` is the measured census of the pairs this finds; the checker compares rather than restating that file.

## nesting function — Rule 3 details

The two shapes that are real on this site today. Both are read off the DOM, never off a declaration:
- A `full` inside a `full` collapses a row that is already collapsed
- `position: sticky` sticks to its nearest SCROLLING ancestor, so a sticky rail inside a box with its own `overflow: auto` never reaches the page.

## How a violation shows

Visible, never blocking: a dashed outline and a badge with the count. Clicking the badge opens the rule page that argues it.

## THE FIXTURE RUN — what "approved" means

A layout is APPROVED when every fixture passes at every strip width. What is read back, in order:

- **overflow** — anything whose scrollWidth beats its clientWidth while its own overflow-x is `visible` — content escaping a box that never said it could scroll.
- **edge** — text or a framed box at the host's own edge. The host carries the page's gutters, so this fires only when the layout escapes them.
- **measure** — a paragraph wider than 46em. Every prose slot is capped at the measure by the fixture (fixtures.js), so this fires only when a layout overrides that — which is the bug it is looking for.
- **contrast** — the same comparison rule 2 makes, run on every text node.
- **growth** — the vertical twin of rule 1 (the owner, addendum 4). A layout that says `grows: false` must ALSO say what happens to content longer than the box — `scroll`, `clip` or `truncate` — and the longest-text fixture is the test: the box overflowed, so did the declared thing actually happen? A bounded layout that declares nothing is a DRAFT with no run needed.
- **ragged** — wrapping layouts only, at 1 · 2 · 3 · 5 · 7 items. A last row with fewer items than the row above is a FINDING, not a failure — for a `grid auto-fill` wall it is correct behaviour, and the reader is shown the count it happens at rather than a verdict.

⚠ A DIV IS NOT A VIEWPORT. The host is a fixed-width box, so a `@media` query inside a layout answers the real window and not the width being proven. None of the thirty uses one — they are clamps and intrinsic tracks — but the honest way to run this is to set the REAL viewport to each strip width, which is what the headless probe does and what the recorded `approved:` dates come from.

## open function — measured host

The page's own gutters, at the width being proven, hidden but still LAID OUT. The host is a fixed-width box with `visibility: hidden`, never `display: none` — a display-hidden box is not measured at all, which is the whole thing being bought (Frame.js). The clipper around it is what stops a 3440 host from scrolling a 1280 window.

## inspect function — THE DECLARATION check

The spill itself is caught in the loop — a fixed-height box with `overflow: visible` that overflowed is the failure. This asks the other half: a layout that says `overflow: "scroll"` must have a box that actually scrolls, and one that says `"clip"` must have a box that clips.

⚠ Not the root only. In `rows` the ROOT clips (a bounded box is bounded) and it is the BODY that scrolls — two boxes, one contract.

## ragged function — wrapping detection

Two children are on ONE line when their vertical ranges OVERLAP — never when their `top` values match. Under `align-items: center` two children of different heights on the same line have different tops, which read the homepage's one-line topbar as three lines (the layout skill, 2026-09-05).

## audit and fatal — verdict logic

Every layout at one width. The verdict is in `found`: a layout with no finding of kind `overflow`, `edge`, `measure`, `contrast` or `growth` at any width is approved; a `ragged` finding is reported and does not decide anything.
