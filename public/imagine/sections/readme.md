# Sections — one horizontal band of a page, cut into 2, 3 or 4 columns

A **section** is a head, a left column, a middle, a right column and a foot. When the head,
the two sides and the foot wear one colour and the middle wears another, with no gutter
between them, the four surround the middle and the middle reads as **framed**. Stack sections
down a page and the page scrolls with sticky sides; make one section as tall as the screen and
the middle scrolls instead. Same class both ways.

Open [/imagine/sections/](/imagine/sections/) — every idea below is one section on that page,
saying itself in its own left column.

## Use

```js /imagine/sections/page.js
import { SectionsBand, SectionsStack } from "/imagine/sections/sections.js";

new SectionsStack({ classes: "bleed", space: "gap", bands(){
    new SectionsBand({
        cols: 3, dist: "rail-main-aside",     // 2 | 3 | 4  ·  six ways to divide the row
        frame: "flush",                        // card (one bordered box) | flush (full bleed)
        chrome: "tint", face: "card", back: "plain",   // the frame · the middle · the section
        stick: "on", inner: "off",             // sides stay  ·  sides scroll themselves
        head: () => { span("A head"); },
        side: () => { p("The left column."); },
        main: () => { p("The middle."); },
        aside: null,                           // left out: the aside draws the live chips
        foot: () => { span("A foot."); },
    });
} });
```

Every word is also a **chip** the reader can press. Nothing is remembered — a refresh puts a
section back to what the page declared.

## Watch out

- **The class name is the CSS class.** `SectionsSide` is `.sections-side`. Nothing here is
  called `Section`: `/blog/Section.js` already exports one.
- **Sticky lives on a child of the column, never on the column.** `align-self: start` would
  stop the column painting the frame. [`doc/decisions.md`](./doc/decisions.md)
- **A card section uses `overflow: clip`, not `hidden`** — `hidden` makes a scroll container
  and a sticky sidebar inside one can never move.
- **The block half of `bleed` is dead in a column**, because `framework.css`'s util-layer
  `:first-child { margin-top: 0 }` beats `Page.css`'s theme-layer rule. This realm restates it
  in `util`; the upstream fix is a proposal. [`doc/decisions.md`](./doc/decisions.md)
- **One stacking floor, 52rem**, and four columns become two at 70rem first. Below the floor
  everything stacks, sticky stands down and a nav collapses to a menu.
- **Spacing is always a ramp** — `--pad-default` / `--gap-default`, never a constant.

## More

- [Overview](/imagine/sections/) — the ideas, one section each ·
  [full screen](/imagine/sections/full/) ·
  [a stack of templates](/imagine/sections/stack/) ·
  [with nav](/imagine/sections/nav/)
- [`doc/decisions.md`](./doc/decisions.md) — what this is to `/imagine/layouts/` and to the
  paging vocabulary, the sticky measurements, the four-column answer, what is open
- Files: `sections.js` (the class, its five parts and the words — imports nothing but
  `/app.js` and paging's `blocks.js`) · `sections.css` · `page.js` (the hub) · `full/`
  `stack/` `nav/`
