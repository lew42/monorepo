# Layouts — the encyclopedia: every way a page divides its room, named, defined and drawn; for anyone who needs to say what a layout IS

A layout's id is `N-name`. **The number is how many columns it has on the widest screen it is
meant for; the name says how the room is divided.** `2-sidebar` is a narrow column beside a wide
one, whatever CSS built it — a flex row and a grid that make the same picture are the same
layout, and the technique is a tag.

Twelve layouts today, in five branches: `1` `2` `3` `4` and `n`, where `n` means the count is
not a number at all. (`4-equal` was one of them; deleted 2026-09-08, now an alias of `n-wall` —
its own `when` sentence recommended it: [`doc/decisions.md`](/layouts/doc/decisions/).)

**What 47 real sites say about them** — [/websites/patterns/](/websites/patterns/) has the count.
The two headlines are in the entries themselves: [`1-bands`](/layouts/1-bands/) is the second
commonest whole-page layout and the only one a phone leaves alone, and
[`n-wall`](/layouts/n-wall/) is never a page at all — it is what you put inside one.

## Use

Point at a screenshot, say the id. Then click a tag and see everything else that carries it —
that is the whole feature.

- [/layouts/](/layouts/) — the tree, every layout drawn
- [/layouts/2-sidebar/](/layouts/2-sidebar/) — one layout: drawn at 400, 1920 and 3440, what it
  becomes on a phone, its tags, and the CSS one click down
- [/layouts/tag/cards/](/layouts/tag/cards/) — one tag, and every layout that wears it

Adding a layout is **one object in `layouts.json`** — no page, no CSS.
[`doc/naming.md`](/layouts/doc/naming/) has the shape and the three questions that decide whether
your new layout is really a new one.

## Watch out

- **An id names the DIVISION of the room.** Paint, proportion, technique and side are tags,
  never part of the id — which is why there is no `3-cards`: cards is paint, so it is a tag on
  several layouts instead of a name for one. `N-equal` is a family rather than a list, so
  `/layouts/5-equal/` answers even though nobody drew one. [`doc/naming.md`](/layouts/doc/naming/)
- **Never type a count into a sentence.** The pages count the entries live; three typed "five
  layouts" went wrong the day `4-equal` was deleted, and the corpus counts moved again while
  this readme was being written. Cite the date, or link the live count.
- **A wire cannot draw motion, a hidden column, or an overlap** — and should not try. Four real
  cases, with the honest shape to draw instead, in [`doc/wire.md`](/layouts/doc/wire/); the one
  field that WAS missing is `stack`, how many columns a row falls to on a phone.
- **None of these names is a CSS class**, on purpose — a name is a name for a picture and a
  picture has a dozen builds. Each entry shows the framework word that already produces it.
  [`doc/decisions.md`](/layouts/doc/decisions/)
- **`std-` is this module's CSS prefix**, registered in
  `framework/styles/css-scopes.txt`. [`doc/decisions.md`](/layouts/doc/decisions/)
- **The body of a layout page and a tag page is `wide`, and the sentences take their measure
  back inside it** (`.std-body`). Put prose in there without a `.md` or `p` wrapper and it
  runs 3,260px at 3440. [`doc/decisions.md`](/layouts/doc/decisions/)
- **A drawing's height ceiling is a fold budget in `vh`**, not a constant — as a flat `22rem`
  the three-widths row used half of a 3440 screen. [`doc/decisions.md`](/layouts/doc/decisions/)
- **A wire drawing is real flex and real grid**, shrunk with `zoom` inside a frame that carries
  the container query unit. Never put a container query on the drawing itself — it cannot
  restyle its own container. [`doc/wire.md`](/layouts/doc/wire/)
- **The drawing pins `font-size: 16px`.** The site's body size is a viewport clamp, so without
  it a `16em` rail would measure 288px inside a drawing labelled 1920.
  [`doc/wire.md`](/layouts/doc/wire/)
- **A layout's page also lists every site that uses its id as a SECTION**, under "as a section,
  on:" — not just a whole page's own layout. `/websites/tools/index.mjs` builds the list;
  [`doc/decisions.md`](/websites/doc/decisions/) in the corpus says why it is separate from a tag.

## More

- [`doc/naming.md`](/layouts/doc/naming/) — the rules of the namespace, how to add a layout, how
  to decide two layouts are the same one, the words, and the CSS classes we did not add
- [`doc/wire.md`](/layouts/doc/wire/) — the drawing spec, field by field, for writing one from a
  screenshot — also how `/websites/` draws a real site's own recreation
- [`doc/decisions.md`](/layouts/doc/decisions/) — what was settled and why, what was measured,
  what is open, and every `/imagine/layouts/` arrangement mapped onto an id
- Files: `layouts.json` (the authority — entries, words, branches) · `Layout.js` (the drawer, the
  data helpers, the four shared views — a thumbnail, one width of a drawing, a tag row, a strip
  of chips; `/websites/Site.js` reuses the width-of-a-drawing one for a real site's wire) ·
  `layouts.css` · `page.js` (the tree, and every layout page routed from the file) · `tag/page.js`
  · `doc/`
- Beside it: [`/imagine/layouts/`](/imagine/layouts/) the numbered lab this standard names ·
  [`/web/layout/`](/web/layout/) the seven principles · [the five layout
  words](/framework/styles/doc/layout-system.md) the framework builds pages from ·
  [`/websites/`](/websites/) the corpus of real sites that cites these ids
