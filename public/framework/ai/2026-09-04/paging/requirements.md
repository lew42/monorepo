# Paging — page styles, switching mechanisms and transitions, at `/imagine/paging/`

Program brief. Group `paging`. The owner's ask is verbatim at the end; this first half is the mastermind's plan and the vocabulary every minion in the program shares, so six builders working at once produce one world.

## The shape

`/imagine/paging/` is a realm in `/imagine/`'s columns row (registered by the mastermind). Its hub is owned by `paging-core`; every other minion owns exactly one subdirectory and its task dir. The mastermind wires each landed subdirectory into the hub's `children:`.

```
/imagine/paging/                 hub — the transition stage + the vocabulary (paging-core, Opus)
  mechanisms/  styles/  sizes/   the factors, each a small demo tree (paging-core)
  center/                        the vertically centred column system (paging-core)
  transitions/                   any style → any style, by any mechanism (paging-core; cut first)
  rightnav/                      persistent right tree that switches the centre (paging-rightnav)
  explorer/                      the page explorer with mag + a live code tab (paging-explorer)
  toolbars/                      top/left/right/bottom × inside/outside the card (wave 2, after core)
  critique/                      every /imagine/ realm: what is weak, an alternate layout + palette (paging-critique)
  inventory/                     what already matches icon · page · children · navigation (paging-scout)
```

## The vocabulary — use these words and icons, nobody invents a synonym

**Mechanisms** — what a click on a child does. Every item that navigates carries the icon of its mechanism at its end; a demo page offers all four so a reader can feel each from the same content.

| word | what happens | icon (Material **Icons**, classic set) |
|---|---|---|
| `launch` | opens to the RIGHT as a new column/tab; the current page stays | `chevron_right` |
| `expand` | opens BELOW, in place, the item grows; nothing else moves | `expand_more` |
| `swap` | replaces the current page in the same box; the box stays | `swap_horiz` |
| `takeover` | fills the whole screen; ancestors collapse to the crumb strip | `open_in_full` |

The columns vocabulary already says two of these: `launch` is a child column; `takeover` is `width: "full"`. Reuse them; do not reimplement columns.

**Styles** — the page's own surface. `plain` (the site bg, no frame) · `card` (white, padded, no border, a drop shadow — and then a nav card on it takes a light grey bg so it reads) · `tint` (one subtle step of bg from the parent) · `prim` (a prim-tinted surface) · `dark` (a colour-scheme island). Tokens from `framework.css` (`--shade/--paper/--fill-aNN`, `--prim`, `--surface`); no hex.

**Sizes** — two axes, five stops each. Content: `xs` a word · `s` a line · `m` a paragraph · `l` a section · `xl` a wall. Layout: `center` (floats centre-centre, the narrow column) · `column` · `wide` · `full`.

**Toolbars** — `top left right bottom` × `inside` (in the card) | `outside` (on the frame). Every demo page carries a MODE TOOLBAR of chips that switches its own style / size / mechanism live, remembered by `store()` against its url, so slight variants are explored by clicking, not by more pages. Trees of pages are for the big variants.

**Code tab** — every demo page can show a `code` child (a dynamic `route()` child, not a directory): the page's own module source (fetched from `import.meta.url`) plus, appended live, the `this.style("card")`-shaped calls the toolbar clicks would be in code.

## Waves

1. (now) `paging-scout`, `paging-core` (Opus), `paging-rightnav`, `paging-explorer`, `screens-divide`, `paging-critique`. ~1.3M tokens.
2. (after core) `paging-toolbars`; alternate layouts for the /imagine/ realms the critique ranks worst; the transitions matrix if core cut it.

## Rules

Every minion: `minion-rules.md` (`../mastermind-platform/minion-rules.md`), the `code` + `layout` + `new-page` skills before a page, `css` + `new-css-class` before a class (prefix `paging-`), `ui-test` for any gesture it claims works, `documentation`, `finish-task`. Private servers only. Nothing crawls: a page exists when its parent names it.

---

# The owner's ask (verbatim, 2026-09-04)

regarding the X, let's just leave it for now, and explore variations in this new task:

let's add a new page to imagine/ to explore paging styles. page bg, navigation structure/techniques.

i know we've done a lot of this, but this time, we want to focus on page switching, and types of content. small->large content, small->large layout, vary colors of the page bg, use subtle page color changes, use prim and bg or whatever else colors, and try to create useful paging mechanisms. It's basically like icon, page, children (with navigation). similar to the page generator, what other things have we made that match this pattern?

let's try a vertically centered column system? a small amount of content floats center center. a click launches to the right, or swaps it entirely, or even take's over the entire screen? we want these basic mechanisms on each page, so we can automatically experience the transition from one to another. use a > right arrow at the end of an item, if it launches a new tab. use a down arrow if it expands below. use a maximize icon for takeover.

work on a page transition system, and add it to the imagine/paging/ page. design a system to explore transitioning from any page style to any other, using various navigation mechanisms.

if a page wants more of a traditional white bg, padding, no border, maybe a drop shadow, etc, the little nav cards would have to have a different bg color (maybe light gray?).

work on toolbar styles for pages, top toolbars, left toolbars, right toolbars, bottom toolbars, both in the card, and outside the card.

work on a right column navigation system: it's like a right property sidebar, where the right sidebar remains persitent. when you click an item in this right column tree, it switches the main (center) content area to be the new page.

experiment with different paging strategies. look at all the imagine pages, and think about how they could be better, or alternate layouts. alternate color schemes. experiment with different ratios of columns and alignment relative to the viewport or parent page area, and think about how this factor interacts with all the other factors. experiment with various nesting patterns against all of the factors.

for the pages demo pages, i think using a toolbar to switch its mode is the best way to explore slight variants, but create trees of example pages. experiment with the imagine/shells/ and imagine/screens/ patterns for pages. for the imagine/screens/divide/, clicking Two keeps Three active, i feel like it should jsut link to itself /two/, and then three disappears?

implement the imagine/mag/ in the page explorer. have a "code" dynamic sub page for each page, so you can see how it was built? maybe you have to append `this.whatever()` to the code tab, when you use the ui to configure the page, so you can see how you'd do it with code.
