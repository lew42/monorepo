# Panel2 — the standard UI area: header, main, optional footer, optional drawer sides

A new, small module (2026-10-02) — the owner's own words for what it should be are at
[the task's requirements.md](/framework/ai/2026-10-02/panel2-sessions/part1-panel2/requirements.md).
Nothing here is copied from the older [`ext/Panel`](/framework/ext/Panel/) — that one is chrome
for *wireframing* a page (split it up, drag things around, try a layout). This one is chrome you
actually **ship**: a real header/main/footer box you put content in. The only thing borrowed from
anywhere is the resize drag, [`ext/grip`](/framework/ext/grip/).

## Architecture

```
Panel2                              a header, a main region, an optional footer and sides
  header          Panel2.Header       the toolbar — title left, .append() lands in its controls
  main            Panel2.Main         the content
  footer          Panel2.Footer | —   only when { footer: true }
  start, end      Panel2.Side | —     only when { start } / { end } was given

  side(edge, opts)                  one Side + the header button that opens it as a drawer
  static split(a, b, { axis })      two Panel2s with a grip between them

  .panel2-grid (panel2.css)         the CSS class that arranges several Panel2s on one page

  Panel2.Header / .Main / .Footer / .Side     the parts, as statics — subclass to swap one
```

## Use

```js
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { button } from "/app.js";

const files = new Panel2({ title: "Files", start: true });
files.header.append(button("Refresh"));   // the header IS a toolbar — mount straight into it
files.main.append(() => { /* your content */ });
files.start.append(() => { /* the sidebar's content */ });
```

- `title` — the text on the left of the header.
- `start` / `end` — `true` for a sidebar at the framework default width (16rem), or
  `{ width: "20rem" }` for your own. Omit either side entirely for a plain panel (header + main,
  no sides — the first thing the [demo page](/framework/ext/panel2/) shows).
- `footer` — `true` for a plain footer strip; append into `panel.footer` same as the header.

**Below 34em** — the same width `ext/grip`'s own CSS already treats as "a rail stops being a
rail" — a side stops sitting beside main and slides over it instead, like a drawer. Panel2 adds
the button that opens it to the header for you; there's nothing extra to wire up.

## Splitting two side by side

```js
Panel2.split(new Panel2({ title: "A" }), new Panel2({ title: "B" }));          // side by side
Panel2.split(new Panel2({ title: "A" }), new Panel2({ title: "B" }), { axis: "y" }); // stacked
```

A grip sits inside the first panel and drags its own size; the second always takes whatever is
left — the same relationship a sidebar has with the page beside it. This is one grip between two
panels (`requirements.md` step 4's "simple two-way split"); nest the call for a third pane:
`Panel2.split(Panel2.split(a, b), c)`.

## Arranging several on a page

Put `class="grid auto gap panel2-grid"` on the box that holds them:

```js
div.c("grid auto gap panel2-grid", () => {
    new Panel2({ title: "A" });
    new Panel2({ title: "B" });
    new Panel2({ title: "C" });
});
```

**In five-year-old words:** you tell the grid the *smallest* comfortable width for one panel
(22rem here — override with `.style("--column", "28rem")`), then stop thinking about it. The grid
fits as many panels per row as will comfortably sit, dropping to fewer columns automatically, down
to one on a phone. No breakpoints, no "if the screen is this wide" code.

This is `grid auto` (`framework.css`) — one line reusing a formula the framework already has
(`repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))`), not a second grid system.

**The alternative we didn't pick: flex-wrap.** The owner asked about this too. Flex-wrap is
simpler, but its rows don't line up into columns — two rows can each wrap at a different point, so
a panel in row 2 isn't necessarily as wide as the one above it. A grid keeps every row in the same
column tracks, which a dashboard of panels wants more than a toolbar row does (`panel.header`'s
controls still use flex-wrap — just not this).

## House rule: three preview levels for any class view

Any kind of thing shown on a Panel2 screen — a session, a task, a file — comes in exactly three
sizes, the owner's own words (2026-10-02): **inline** (an icon and the name), **card** (icon,
title, a ⋯ menu of quick actions, most of the card is a link, plus a corner arrow on touch
screens), **detail** (the full page). The full rule, the two watch-outs on `card`, and where it's
used today: [`doc/preview-levels.md`](./doc/preview-levels.md).

## Open questions (deliberately deferred — `requirements.md` steps 4 and 5)

1. **A fixed-width ↔ fluid-width switch.** The owner mentioned wanting to flip a split panel
   between a fixed pixel width and a fluid share of the row ("maybe layout switches, like fixed
   width to fluid width"). This module only has one mode today — every split panel is fluid,
   sized by the grip's drag (`--panel2-split-a`) — because building a second mode before anyone
   has used the first one risks guessing at a shape nobody needed. The grip's own write callback
   is the seam a fixed-width mode would hook: it would set a `px` value that stops scaling with
   the row instead of a flex-basis that does.
2. **More than one grip in a row.** `Panel2.split` is a straight two-way split; a dashboard with
   three or more resizable columns needs `Panel2.split` nested (`split(split(a, b), c)`), which
   works but gives the outer grip control over "A vs. (B+C)" rather than three independent grips.
   A dedicated multi-pane splitter is real feature, not a quick addition — left out of this first
   version on purpose (CLAUDE.md law 1: the fastest working version first).
3. **"Sprawl" — a layout verb, not built here.** Added mid-task by the owner: big, similar
   sections that stack on a narrow screen and sit side by side on a wide one (three rows at
   1000px becoming three columns at 3000px). Update: `framework-home` built a real module for
   this, [`ext/sprawl`](/framework/ext/sprawl/) — a JS pass that balances sections into columns by
   measured height (the owner asked for greedy shortest-column placement, not equal-height grid
   stretching, which left dead space). If Panel2 ever needs this layout verb, reuse `ext/sprawl`
   rather than building a second version (law 6) — it's a separate, whole-section placement
   concern from Panel2's own split/grid, not something this module owns. Noted, not built — more
   in [`doc/decisions.md`](./doc/decisions.md).
4. **Adaptive panel height in a split.** Added mid-task by the owner: could the shorter side of
   `Panel2.split` grow to match the taller one, instead of always hugging its own content? Noted,
   not built — more in [`doc/decisions.md`](./doc/decisions.md).

## Watch out

- **`panel.header.append(x)` lands in the controls row, not the header's root box.** `Header`
  overrides `append()` once it has rendered (its `title` span and `controls` row exist) so a
  caller's own controls always land to the right of the title, never between the title and
  whatever Panel2 itself already put there (the side-drawer toggle buttons).
- **The 34em breakpoint is borrowed, not invented** — it is `ext/grip/grip.css`'s own floor for
  "a rail stops being a rail." If that floor ever moves, this module's side-becomes-drawer rule
  should move with it (panel2.css says so inline).
- **`panel2-` is a brand new prefix.** It isn't reserved yet in
  [`public/framework/styles/css-scopes.txt`](/framework/styles/css-scopes.txt) (confirmed free,
  2026-10-02) but this task's fence doesn't include that file — the reservation is written down in
  [`doc/decisions.md`](./doc/decisions.md) instead, for whoever can write it next.
- A `Panel2.split()` wrapper is a plain `div.panel2-split`, not a `Panel2` itself — nesting one
  inside `Panel2.split(outer, c)` works because `append()` only cares that the thing has an `.el`.

## More

- [Overview](/framework/ext/panel2/) — the demo page: a plain panel, a resizable split with real
  toolbar buttons, and the phone-width drawer
- [`doc/preview-levels.md`](./doc/preview-levels.md) — the three-preview-levels house rule
- [`doc/decisions.md`](./doc/decisions.md) — the `css-scopes.txt` reservation note, and why the
  split helper is a function instead of a third static part
- Files: `Panel2.js` (the class and its parts), `panel2.css` (the layout), `page.js` (the demo)
- [`ext/grip`](/framework/ext/grip/) — the resize drag this module reuses
- [`ext/Panel`](/framework/ext/Panel/) — the older, unrelated wireframing tool; not a dependency
