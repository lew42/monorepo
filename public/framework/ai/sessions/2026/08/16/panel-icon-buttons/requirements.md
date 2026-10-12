# panel-icon-buttons

## The ask, verbatim (Mike, 2026-08-16)

> convert ext/Panel buttons to transparent icon-only buttons, the icon button's
> square-ish bg only appears on hover. we'll probably need configuration for each
> panel, but for now, let's work on a good default, where we can dig into a menu
> (see ui/menu), and switch on any other modular panel overlays:
>
> alignment: (top, middle, bottom, right, center, left, top right, etc) for both
> contents and relative to parent. think about the nesting dynamic here - how would
> conflicting values interact? what kind of meaningful overlays could visually
> indicate current layout state, current css classes, etc?
>
> position (fixed, relative, css property optoins, but also... alignment?)
>
> display (flex, grid, etc)
>
> size: height and width: hug, fixed, fill, %, etc
>
> check into the Panel's splitting logic. we sometimes want to split a panel in 2,
> and sometimes we want to add a sibling panel (inside vs outside). maybe there's a
> hover-activated toolbar that appears just like the drag handle does: it's a row of
> icon buttons (for the top/bottom of a panel) and a column of icon buttons on the
> left/right edges. the strip should appear much before the users mouse gets there.
> the strip should position itself roughly in line with the users cursor, however,
> the strip should stop tracking once the strip is hovered, so that the mouse can
> actually move relative to the strip, and select a button. We'll want an arrow
> pointing inward for "hug" and outward for "fill"
>
> maybe you can find good icons, but sometimes just an arrow pointing in the right
> direction, or a dot for the center, is all that's necessary. after you click to set
> one of these options, the button should activate, to indicate to the user the new
> value.

## Scope

**Phase 1 (this task, unambiguous).** Every button in `ext/Panel` becomes a
transparent icon-only button on a shared, font-verified glyph vocabulary:
square hover background, an activated state that reads as filled rather than
bordered. Three surfaces converge on one vocabulary — `toolbar.js` (the bar),
`seam.js` (the grip menu, today the words "hug"/"fill"), `properties.js` (the
inspector, today words for tone/align/mode).

**Phase 2 (proposed, awaiting Mike's calls).** The dig-in menu, the per-axis
sizing model (`w`/`h` each hug|fill|fixed|%), `position`/`display` as panel
words, self-alignment relative to parent, the state overlays, the inside-vs-
outside split verbs, and the cursor-tracking edge strips. Three decisions fork
materially — recorded in `doc/proposal.md` and put to Mike rather than guessed.

## Glyph vocabulary — verified against the loaded font

Material Icons is a ligature font and an unknown name renders as the literal
word at ~430px, sizing every column of the grid it sits in (readme's standing
trap; `deployed_code` cost a real bug). Every name below was measured live in a
connected tab at 24px before use — 24px is a glyph, >30px is the word:

| word | glyph | note |
|---|---|---|
| `hug` | `close_fullscreen` | arrows pointing inward |
| `fill` | `open_in_full` | arrows pointing outward |
| align `tl`…`br` | `north_west north north_east west circle east south_west south south_east` | an arrow in the direction, a dot for the centre |
| `dir` row/col | `vertical_split` / `horizontal_split` | already the bar's |

`position_top_right` measured **432px** — rejected, and the one confirmation
that the check is not theatre.
