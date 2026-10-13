# glyphs.md

## Overview

What a panel's words look like. The bar, a seam's menu and the inspector all draw the same vocabulary, so the pictures live in one place and the three can never drift. Imports View and nothing else, so every surface may read it and none of them circle. css: .panel-swatch (controls.css).

Material Icons is a LIGATURE font: a name it does not carry renders as the whole WORD — 432px of `position_top_right`, measured — and sizes every column of the grid it lands in. Every name below was measured against the loaded font before it was written.

## PLACE

What half a code means as a CSS keyword — `code[0]` is the block axis, `code[1]` the inline one. Two readers: `place()` positions a body's CONTENT with it, and the 3×3 overlay positions each BUTTON inside its own grid cell with it, which is what makes an arrow sit at the edge it names.

## place() function

PUT A BODY'S CONTENT WHERE A CODE SAYS. Two readers — `paint.js` on every repaint, and `tools.js`'s 3x3 overlay when you press one of its nine arrows.

History: It used to live in `toolbar.js`, which is deleted (2026-09-18): the floating bar is gone and this is one of the two things in that file that was never part of the bar. It reads `PLACE`, one line above it, and nothing else — so this is where it belongs. See `doc/decisions.md`.

## SEATS

Where the PANEL sits in the slot its split hands it — a dot inside a frame, at the place it names, drawn rather than lettered (`glyph()`'s function form, the same door a tone's swatch comes through). Not COMPASS again: `self` and `align` are two 3×3s one above the other in the same rail, and nine identical arrows twice says nothing about which grid is which. A frame with the panel in it is the picture of the thing. css: .panel-seat (size.css, which owns the rule the control draws).

## SHAPE

The ROOT's word about the whole workspace: one SCREEN its panels divide, or a DOCUMENT as tall as its sections, which scrolls. A screen to fit and a page of text — deliberately not MODE's arrows, which answer a different question one row down ("does this panel fill the slot it was handed"). Both names measured against the loaded font.

## SIZES and LENGTHS

Width and height each read `size.js`'s per-axis engine: fill | hug | fixed, and a fixed extent needs a LENGTH too. A short, round list rather than a knob — a `pick()` row is the vocabulary's own idiom everywhere else here, and a knob would be a second control shape for one field (the owner, 2026-08-16). `fixed` carries no icon of its own: MODE already covers fill/hug, and a length reads as its own text through `glyph()`'s existing fallback, exactly like ext/editor's region names.

## POSITION

Whether a panel is IN the slot its split hands it or floating OVER it. `static` is honest about layout: `.panel` is `position: relative` only so its own bar and overlays have a root, and `relative` with no insets sits exactly where `static` would. `fixed` and `sticky` are measured rejections — see doc/file/size.js.md. The two pictures are the same frame twice, empty and then with a small panel floating in it.

## DISPLAY

How a leaf's body lays its own content out. Stacked bands for flow, columns for flex, a lattice for grid — and `grid_on` rather than `grid_view`, which the alignment trigger already wears.

## TONE

A tone is a colour, so its picture is the colour — the token being the one the templates already tint themselves with, so a swatch cannot show a shade nothing draws.

## glyph() function

One of a vocabulary, as a picture. A picture is an icon name, a drawing (a swatch), or a `T` entry carrying one — and a vocabulary that ships none reads as its own word, which is what ext/editor's regions do.

## WORDS table

THE table. Every word a panel wears that is ONE key with a fixed list of choices, in the order the rail draws them. ONE reader since 2026-08-19: the rail (`properties.js`). The bar carries no words at all any more — the sweep took every one of them off it, and with them the `bar:` flag this table used to carry. See doc/decisions.md.

Structure:
- `names` — the choices, in the order they are drawn.
- `pics` — a picture per choice; a set shipping none reads as its own words (`glyph()`).
- `cols` — how wide that picker's grid is.
- `toggle` — two names, one of which means OFF: ONE button that lights, never a row of two. `names[1]` is the ON state, and `pic` is the button's own picture.
- `drop` — a dropdown (`ext/Dropdown`) instead of a row: a trigger saying the value's NAME as well as its picture. For the words a row of pictures cannot carry.
- `knob` — a free-value slider beside the preset row (`pad`, `gap`).
- `modes` — the display modes the word is live under; absent means always.
- `root` — the ROOT panel only; hidden on everything with a parent.
- `var` + `css` — how it LANDS: the custom property `paint.js`'s `show()` writes on the body, and the value map `display.css` reads (absent = the word IS the CSS value).

Not in this table, each for a reason one row cannot express: `template` (a per-document vocabulary, plus `random`, which is a verb), `w`/`h` (one pick writes TWO keys), `self` (a 3×3 whose buttons go live per axis). See doc/words.md.

## WORDS entries

### mode
First, because it is the only word about the WHOLE workspace rather than one panel — and the only `root` one. `document` is also the only word that changes what a SPLIT does: panel.css lets the root's column grow instead of dividing a screen, and `Panel.divide()` gives each new row a height, so a split below APPENDS a section. See doc/words.md.

### tone
FOUR across, not 2×2 (the owner, 2026-08-19: "should be 1x4 to utilize space better"). A swatch is 1.7em; four of them and their gaps fit a 19rem rail with room to spare, and a row of six or fewer pictures is one LINE — a stack wastes the rail's height for nothing. The one set that keeps a narrow `cols` is `align`, whose 3×3 IS the picture.

### display
The one word with `drop`, and the reason the flag exists: `display` decides which OTHER words are live, so the rail is unreadable when the word governing it is three unlabelled pictures you have to hover to tell apart (the owner, 2026-08-19). A trigger that says `flex` names the state the rest of the rail is in.

### pad
The BODY's own padding (2026-08-19) — always live, no `modes`: unlike `gap`, which only means something once children are laid out, `pad` insets a body's content whatever `display` it draws in. Rail-only, no `bar`, the way `position` already is — a new ligature name is a measured cost this word does not need to pay. `knob` is the free-value companion `properties.js` draws beside the preset row for exactly this word and `gap` (see doc/words.md).

No `Panel.defaults` entry: `PanelDrag`'s centre-drop nest already writes `--panel-pad: 1em` on the fresh container's `.panel-items` (see doc/decisions.md), and this word's value is read, not written, until a panel picks one — a stamped default would shadow that inherited inset on every un-chosen body.

### wrap
ONE button, not a `nowrap | wrap` pair (the owner, 2026-08-19: "a single Wrap with active state would suffice"). The two names stay — they are the CSS values `paint.js` writes — and `names[1]` is what the lit button means.

### cols
The property is `--panel-tracks`, NOT `--panel-cols` — that name is already the picker grid's own column count (18 readers), and a body writing it would hand its value down to any control surface drawn inside that body.

## ITEM_WORDS

An ITEM's own words — a leaf's body arranges itself with `WORDS` above; a flex/grid CHILD of that body gets its own say with these, one custom property per word, landed straight on the child (never the body — `persist.js`'s `items_apply()` is the writer, `properties.js`'s `item_words()` the rail). `self` is `place-self`, not `align-self`/`justify-self` split in two: flex ignores the inline half of a shorthand it cannot use, so one row covers both readings for the one extra property it costs. See doc/words.md.

## live_words()

The words that apply to this panel RIGHT NOW — a flex word under flex, a grid word under grid, a `root` word on the root alone, the rest always. Both hosts draw exactly what this hands back, in this order.

A root word is withheld from every panel with a parent and from nothing else: `mode: document` describes the box the whole tree lands in, and a section wearing it (a split hands its data down) must not act on it.

## word_vars()

The same words, as CSS. `paint.js`'s `show()` is the single writer of these, exactly as it is of the display class — so display.css reads a body's whole arrangement from one place, and nothing else in the module writes a layout property on a body by hand.
