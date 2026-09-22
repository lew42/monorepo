# Shell — a sidebar that never moves, resizable to any width, and a viewport beside it holding a tree of homepage designs derived one change at a time

Two regions, edge to edge, nothing else on screen. The sidebar is the navigation and it does
not shift by a pixel when the design beside it changes or scrolls. Every row in it is a real
url, so five levels deep is five links. **[Open it](/layouts/shell/)** — drag the sidebar's
right edge, click a row.

The designs are a **tree**: a base homepage, and under it children that each add, change or
subtract exactly **one thing**. The sidebar's shape is the logic — `Home → Taller hero → No
wall → Dark band` is four decisions, in order, and each design says what it changed in a fold
at its own bottom.

## Use

A new design is one file. Import the spec above it, change one key, name it in its parent's
`children:`:

```js /layouts/shell/home/taller-hero/page.js
import { Page } from "/app.js";
import { design, derive } from "../../Design.js";
import { home } from "../page.js";

export const tallerHero = derive(home, { hero: { fold: "clamp(20rem, 62vh, 44rem)" } });

export default new Page(design(tallerHero, {
    meta: import.meta,
    title: "Taller hero",
    changed: "CHANGED one number: the hero's fold budget …",
    children: "no-wall split-hero",
}));
```

`derive(parent, changes)` merges one level deep, so one change reads as one line; `null`
subtracts a band. [What a spec holds](./Design.js) · [why this mechanism and not the other
two](/layouts/shell/doc/pages/).

## Watch out

- **A design's parent is imported as a plain OBJECT, never as a Page.** Imports flow down the
  file tree and `.parent` points up; a child that imported its parent's page would make a cycle
  that breaks only on a deep reload. [`doc/pages.md`](/layouts/shell/doc/pages/)
- **`Object.create(parentPage)` does not work and does not throw** — no constructor, so no
  `declare()`, and `children` is the parent's own Map: adding one child to the clone took the
  parent from two children to three. Measured. [`doc/pages.md`](/layouts/shell/doc/pages/)
- **The sidebar is fixed by construction, not by `sticky` alone.** The shell is `height: 100%`
  and both regions own their scrolling, so there is no page scroll to move the rail; the sticky
  box in a stretched track is the guarantee for the day something does scroll.
- **A page method must not be named after a page WORD.** `width` is one, and a method by that
  name is read back as a CSS class. This module's is `size_rail()`.
- **Every rule about what is inside the viewport is a container query**, because the sidebar's
  width is the point — the designs respond to the room left, not to the window. The shell's own
  stacking is the one media query, since nothing contains the page.
- **A written-out column count needs a ceiling, and it goes on the COLUMN.** Three equal
  columns of a 3,152px viewport made a card's sentence 829px; capping the wall alone left
  1,500px of dead ground between the wall and the rail beside it.
- **A `<summary>` is dressed as a button here** (framework.css styles `button` and `summary`
  together), so a fold left alone is 341px of bordered grey inside a full-width band.
- **`ux/Tree` cannot make a BRANCH row a link.** `Tree.Row.prerender()` decides the tag as
  `!kids && href`. `Shell.js` subclasses past it; one word in `ux/Tree` would delete that
  override.
- **The resize handle is [`ext/grip`](/framework/ext/grip/) now, not a hand-rolled copy** —
  merged 2026-09-18 with `core/Sidebar`'s own copy of the same gesture; `Shell.grab()` is five
  lines that call it.
- **Don't wrap this page's own `render()` in `demo.steps()`.** Tried 2026-09-18: the real
  rail-plus-viewport depends on `.std-shell`'s `height: 100%` sitting directly on the box that
  carries it, and `demo.steps()` adds a box in between with no height of its own — the shell
  grew to its full unclipped content height (9,671px measured) instead of filling the region.
  [`doc/page.js`](/layouts/shell/doc/) has the three gestures as a small hands-on stand-in
  instead, which needs none of this fight. [`ext/demo/doc/method/steps.md`](/framework/ext/demo/api/steps/)

## More

- [`doc/pages.md`](/layouts/shell/doc/pages/) — **the owner's questions about pages**: what is
  a real `page.js` and what is dynamic, is a button a page, is a section, can a page's methods
  render its parts, how pages derive (all three mechanisms, measured), how imports flow, and
  the two things still open
- Files: `page.js` (the shell — its own `render()`, the viewport region, the width) ·
  `Shell.js` (the sidebar: head, tree, foot, the drag handle) · `Design.js` (`derive()`, and
  the one drawer that turns a spec into bands) · `shell.css` · `home/**` (eight designs) ·
  `shots/`
- Beside it: [`/layouts/practice/`](/layouts/practice/) three layouts built big ·
  [`/layouts/labs/shells/`](/layouts/labs/shells/) ten app chromes, a different question — what the frame
  around a page can be, rather than what goes in it ·
  [`core/Page`](/framework/core/Page/) the class all of this is
