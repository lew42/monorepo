# doodles

Twenty-three marks from the owner's photographed notebook, redrawn by hand as
SVG. Each is a **stroke** — `stroke: currentColor`, `fill: none`, no colour and
no line weight of its own — so a doodle is whatever colour and size the text
around it is, in dark mode and light. Under 1 KB each.

See them: **[/notes/doodles/](/notes/doodles/)** — the wall, each drawing beside
the photograph it came from, then the four uses.

## Use

```js
import { doodles, texture } from "/notes/doodles/doodles.js";

doodles.star();               // 1em, on the text baseline, beside a word
doodles.compass("6em");       // any CSS length sets the HEIGHT
texture("star");              // the same drawing, tiled behind a band
```

- **Any page that draws one needs `doodles.css` too** — the drawings carry no
  colour or stroke width, and that sheet is where they get them.
- `doodle-draw` on a surrounding box makes the doodles inside it draw themselves
  on, in about a second, when the pointer enters.
- `doodle-band` is the box a `texture()` paints behind; `doodle-corner` places a
  big faint one in a card corner.
- `names` is the list, `notes` is what each one is in a phrase — the wall and
  the catalogue table are both built from those, so nothing drifts.

## Watch out

- **A star arm drawn with a cubic curve collapses.** The compass's first draft
  used `C` curves whose control points sat near the line between their ends and
  it rendered as a vertical scratch. Concave arms want `Q`.
- **Two identical `@keyframes` with different names** is what makes the drawn-on
  animation replay on hover — a transition cannot restart an animation that has
  already finished. Merging them makes hover do nothing.
- **Give a tile's photograph and drawing the same box, width and height.** The
  crops run from square to 3:1; a height-only rule made the wall ragged.
- **The inbox photographs are stored portrait with an EXIF flag** the browser's
  `<img>` ignores. Coordinates read off a photograph land somewhere else
  entirely unless the crop is rotated upright first.

## More

- **[Catalogue](/notes/doodles/catalogue/)** — every mark, which spread it came
  from, how often it turns up, and the two that recur but could not be used.
  There is no `doc/` here: the catalogue is a child PAGE rather than a note,
  because its table is built from `doodles.js` and so cannot drift from it.
- Files that matter: `doodles.js` (the twenty-three drawings and the two
  factories), `doodles.css` (colour, weight, the animation), `ref/` (each doodle
  cut out of its photograph at native pixels, to compare against).
