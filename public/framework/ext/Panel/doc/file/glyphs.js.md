## glyphs.js

What a panel's words look like as pictures: the 3×3 compass, the hug/fill
arrows, the split-direction pair, the display-mode set, and a tone swatch —
one vocabulary read by the bar, the inspector, `seam.js`'s menu and (since
2026-08-16) `tools.js`'s overlay and `text.js`'s rail, so the four control
surfaces can never draw a different picture for the same word.

## It also holds `WORDS` — the table, not just the pictures (2026-08-18)

A picture was never the whole of a word. `WORDS` is every panel word that is
ONE key with a fixed list of choices — its `names`, its `pics`, its picker
width, whether the bar carries it, which display modes it is live under, and
the custom property it lands as. `toolbar.js` and `properties.js` are both
*readers* of it, so the ten words are written once instead of twice and a new
one is an entry rather than an edit in each. `live_words(item)` filters it to
what the panel's display mode makes real; `word_vars(item)` turns it into the
CSS `paint.js`'s `show()` writes. What is deliberately outside it, and why:
[`../words.md`](../words.md).

## It imports `View` and nothing else

That is the whole reason every control surface may read it — `toolbar.js`,
`properties.js`, `seam.js`, `tools.js` and `text.js` all import from here, and
none of them import each other, so nothing can circle through this file.

## The codes are their own two axes

```js glyphs.js
export const ALIGN = ["t", "c", "b"].flatMap(y => ["l", "c", "r"].map(x => y + x));
export const PLACE = { t: "start", c: "center", b: "end", l: "start", r: "end" };
```

`ALIGN` generates the nine two-letter codes (`tl` … `br`) rather than listing
them, and `PLACE` reads `code[0]` as the block axis and `code[1]` as the
inline one. Two readers share `PLACE`: `toolbar.js`'s `place()` positions a
body's **content** with it, and `tools.js`'s `align_grid()` positions each
**button** inside its own grid cell with it — the second reading is what makes
an arrow sit exactly at the edge it names, with no position computed by hand.

## `SEATS` — the second 3×3, drawn rather than lettered

```js glyphs.js
const seat = code => () => span.c("panel-seat")
	.style({ "--panel-seat-y": PLACE[code[0]], "--panel-seat-x": PLACE[code[1]] });

export const SEATS = Object.fromEntries(ALIGN.map(code => [code, seat(code)]));
```

`align` moves a leaf's content inside its body; `self` moves the panel inside
the slot its split hands it. Both are the same nine codes, and the properties
rail draws them one above the other — so a second set of `COMPASS`'s nine
arrows would say nothing about which grid was which. A frame with the panel in
it is the picture of the thing, and it needs no font: `seat()` returns a
**drawing**, the same door a tone's swatch comes through, so the ligature trap
below cannot reach it. `PLACE` places the dot inside its frame exactly as it
places a button inside its cell. Styled in `size.css`, which owns the rule the
control draws.

## `glyph(entry, name)` is the one function

```js glyphs.js
export const glyph = (entry, name) => {
	const pic = typeof entry === "object" ? entry?.icon : entry;
	return typeof pic === "function" ? pic
		: () => { if (pic) icon(pic); else span(name); };
};
```

`entry` is either a bare icon name (`COMPASS.tl`) or a `T` entry
(`{ icon, tone?, draw }`); either way `glyph()` returns something a call site
can invoke to draw the picture, or fall back to the bare `name` as text — which
is what makes `ext/editor`'s regions, which ship no icons at all, read as
words instead of blank buttons.

## `POSITION` — the same frame twice

```js glyphs.js
export const POSITION = { static: "crop_free", absolute: "picture_in_picture" };
```

Two words, and the pictures are deliberately one frame with and without a small
panel floating in it — the same reading `SEATS` makes one section up, where the
picture of a placement is a dot in a frame. `static` is honest about layout:
`.panel` is `position: relative` only so its own bar and overlays have a root,
and `relative` with no insets sits exactly where `static` would. Both names
measured at 24px before they were written. `fixed` and `sticky` carry no
picture because neither is offered — both are measured rejections, recorded in
`size.js`'s file record.

## ⚠ Material Icons is a ligature font

A name it does not carry renders as the **whole word** — `position_top_right`
measured 432px, once, live on this site, and widened every popover column it
landed in. Every name below this comment was measured against the loaded font
before it was written; the same check belongs on any name added later. See the
readme's "What will bite you" for the measured incident.

## Improvements

1. **`DISPLAY`'s icon choice (`view_agenda`/`view_column`/`grid_on`) has no
   connection to `MODE`'s naming convention** (`close_fullscreen`/
   `open_in_full`, a verb pair) — a third reader guessing the pattern from one
   export could reasonably expect a matching shape from the other. Harmless
   today, since nothing generates icon names from a formula. *(simple,
   speculative)*
2. **`swatch()` and `SWATCHES` exist only for `TONES`**, a four-entry map — a
   small closure factory for what could be one inline `.map()` at each call
   site. Kept as a factory because `toolbar.js`, `properties.js` and `seam.js`
   all need the same four functions and a factory is one definition instead of
   three. *(simple, not worth it — the file is 55 lines)*
