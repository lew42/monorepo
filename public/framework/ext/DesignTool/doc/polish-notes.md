# Polish tier notes

The polish rules report layout issues that are not broken (reachable, visible) but look off or lack structure — edges that nearly align, padding that doesn't scale with the box, missing visual hierarchy. Everything caps at MEDIUM severity; near-miss alignment is a designer's minute, not a blocker.

## pad-scale rule

Both bounds matter. Font-size floor asks: can the text breathe next to the edge (legibility)? Width floor asks: is the frame proportionate to what it holds (composition)? A box needs to clear both.

The width floor is 3.5% of the box capped at 3.5em. This binds on wide boxes and disappears on chips, where the font floor governs.

Cards only: 320–85% viewport. Full-width sections use the gutter rule (not this one), or every framed container would flag. This was the first version's trap: every padded container on every page, all noise.

## heading-offset rule

The original case: "2em extra padding makes a title and paragraph misalign — why doesn't this catch it?" The alignment rule only looks at near misses (3–12px), on the theory that a bigger gap is a deliberate second column. But a heading and its text under it are never two columns; any offset is a mistake.

"Its own text" is the next block sibling (by y-sort), not whatever text node comes next globally. The first version did a global y-sort and pulled the wrong element entirely: on `/framework/` (alignment actually fine), it flagged a card title 42px under an h2 (the card's own padding inside a visible frame) and an li 17px under an h2 (a list's own marker indent). Meanwhile on `/web/layout/flow/`, an h1 194px left of its heading content fired nothing, because the offset cleared a 96px escape hatch that only ever existed to survive the wrong pairing.

Sibling-only pairing plus checking descendants makes the rule genuinely safe. Evidence: `ai/sessions/2026/08/17/tier-calibration/`.

Include heading-over-heading; hierarchy is about relative position to the next block, not absolute level.

## double-pad rule

Padding inside padding is legitimate only when the inner box changes something you can see: a callout with its own background, a bordered panel. When both boxes paint the same, the second inset buys nothing.

Content width trap: The parent's CONTENT width is `cw − both pads`. The first version measured child width against `parent.cw − one inset`, testing "child ≥ parent minus outer". A filling child is `parent.cw − two insets`, so it demanded `outer ≤ 4` while the outer-padding floor demanded `outer ≥ 6` — unsatisfiable. Zero findings across 854 site runs. Fixed by checking `cw − both pads`.

Test is "does the paint change", not "is there a background": two nested boxes both painted `--surface` are as invisible as two transparent ones.

## starts() function

Finds where content begins under a heading — the leftmost of visible boxes a reader can see. Descends past boxes that paint nothing and hold no text (`.bleed` wrappers), stops at any box with text, a frame, a list, or nothing left below it.

LEFTMOST, not first in document order. This is the difference between six false positives and none. `probe.IGNORE` empties a demo stage by policy, so a 559px stage sitting exactly on the heading's lane offered nothing and the descent slid sideways to the right-aligned button controls — reporting six pages as 158–325px misaligned. Document order is not where content begins; a justified row's first child is wherever justification put it. The minimum is the only edge that means "the content starts here".

A `display: contents` sibling has no box; the rule declines rather than guess.

## invisible rule

Structure with nothing marking it (no background, frame, or color) is hard to read. Fires only when the page has real structure (many sibling groups) and almost nothing is painted. A flat page is a legitimate style.
