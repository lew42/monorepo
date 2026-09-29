# How many pages carry their own CSS? — 123 of 1,221 (10%)

**The plain answer.** The owner's worry is that every page has its own CSS. The count says it is fewer than that: about **1 page in 10** (123 of 1,221 `page.js` files) has CSS of its own. But those 123 pages hold **25,814 lines** of CSS, and the ten biggest hold about 60% of it. So the problem is not "every page"; it is a small number of pages that are really apps or realm shells, each with a private stylesheet. The other ~1,100 pages already carry no CSS.

## Where the CSS lives

| Area | Pages | With own CSS | CSS lines |
|---|---|---|---|
| framework/core | 347 | 30 | 2,972 |
| imagine | 255 | 32 | 4,577 |
| framework/ai (task pages, board, v/3, talk) | 162 | 13 | 3,756 |
| framework/styles | 77 | 17 | 2,155 |
| layouts | 73 | 4 | 2,623 |
| notes | 73 | 2 | 296 |
| framework/ext | 45 | 9 | 493 |
| framework/ui, ux | 47 | 6 | 279 |
| web | 25 | 1 | 191 |
| framework/ai2 (the card app) | 1 | 1 | 7,504 |
| framework/dev, websites, resume, others | ~70 | 8 | ~900 |
| blog, edric, arya, framework/audit/start/util | ~50 | 0 | 0 |

By how the CSS arrives: 111 pages load a sibling `.css` file, 23 call `css(...)`, 2 call `style(...)`, 1 has a `<style>` block (some pages do more than one).

## The 15 biggest

| CSS lines | Page | What it is |
|---|---|---|
| 7,504 | [`framework/ai2/`](/framework/ai2/) (`ai2.css`) | The card app: a whole application |
| 2,607 | [`framework/ai/v/3/`](/framework/ai/v/3/) (`v3.css`) | Second board dashboard |
| 1,380 | [`layouts/shell/`](/layouts/shell/) (`shell.css`) | Realm shell |
| 1,273 | [`imagine/paging/`](/imagine/paging/) (`paging.css`) | Paging lab |
| 784 | [`layouts/labs/mag/`](/layouts/labs/mag/) (`mag.css`) | Magazine lab |
| 640 | [`framework/ai/talk/`](/framework/ai/talk/) (`talk.css`) | Talk app |
| 630 | [`framework/core/Page/generator/`](/framework/core/Page/generator/) | Layout generator tool |
| 609 | [`imagine/`](/imagine/) (`imagine.css`) | Realm home |
| 568 | [`framework/dev/DevBar/`](/framework/dev/DevBar/) | Dev bar |
| 492 | [`framework/styles/system/studies/themes/`](/framework/styles/system/studies/themes/) | Themes study |
| 351 | [`framework/core/Sidebar/`](/framework/core/Sidebar/) | Sidebar component |
| 328 | [`imagine/paging/make/`](/imagine/paging/make/) | Page CMS |
| 316 | [`framework/styles/layers/theme/lew42/`](/framework/styles/layers/theme/lew42/) | The theme's own page |
| 308 | [`framework/core/new/1/site/motion/`](/framework/core/new/1/site/motion/) | Motion study |
| 281 | [`layouts/browse/`](/layouts/browse/) | Layout browser |

Almost all of these are **tools or apps that happen to be pages** (they have widgets, drag, panels), or the shell of a realm. That is a different problem from a plain content page.

## What the CSS does (a page can do several; counted per page, 123 pages)

| Kind | Pages | Replaced by | Can go? |
|---|---|---|---|
| Own layout: grid, columns, flex direction, `@container`, `@media` | 84 | The `arrangement`, `navigation`, `width` words (`rail-left`, `main-aside`, `wall`, `columns`, `wide`/`full`); type 3 wall, type 7 realm | Yes for ordinary pages. No for the 12 or so true app layouts (ai2, v3, talk, DevBar, generator, paging). |
| Spacing: padding, margin, `--pad`, `--gap` | 95 | `.pad`, `.card`, the clamps already in framework.css; page `width` word | Yes, almost always: this is the cheapest class to delete. |
| Typography: font-size, line-height, measure | 87 | `type_size` (`compact`/`regular`/`display`), `reading` width | Yes. |
| Colour: background, border, shadow, tint | 102 | The `surface` and `background` words (`plain card tint prim dark`) | Mostly. A few demos paint on purpose, and those are the point of the page. |
| Widget-only styling (a demo's own widget) | about 35 | Not a page type; it is a component. Move it to the widget's own `.css` once, reused. | Moves, does not vanish. |

## The estimate

- **Could drop their CSS entirely with what exists today: about 55 of 123 (~45%)**, which is about 4.5% of all pages. Basis: 39 pages have no structural layout CSS, 18 have 15 lines or fewer; both lists are mostly spacing, type and colour that the words already cover.
- **Another ~35 (~30%) could drop it once a small set of realm templates exists** (types 3, 4 and 7 made real: realm home wall, demo page, notes/reference page).
- **~30 (~25%) will keep CSS**: apps and tools (types 5 and the generator/paging/DevBar family). These are not page-specific CSS in the owner's sense; they are components, and should own their sheet as a component.

So the honest picture: the template rule is nearly free for the ~1,100 pages that already have no CSS. The work is the 123, and 30 of them are really apps.

## Proposed first 5 migrations (small, no layout code, low risk)

Each is a page with a few lines of spacing/type/colour and no structure. Replace the lines with a word (`type_size`, `surface`, `.pad`), look at it at 400 and 1920, delete the CSS.

1. [`framework/faq/`](/framework/faq/) (7 lines, colour) → `surface` word.
2. [`framework/styles/layers/site/`](/framework/styles/layers/site/) (7 lines, type + colour) → `type_size` + `surface`.
3. [`framework/core/Page/old/`](/framework/core/Page/old/) (10 lines, colour) → `surface`.
4. [`framework/ui/kbd/`](/framework/ui/kbd/) (1 line, type) → `type_size`.
5. [`framework/core/new/1/site/sitemap/`](/framework/core/new/1/site/sitemap/) (16 lines, spacing) → `.pad` / `width: reading`.

Runners-up: `framework/ext/tabs/`, `framework/core/Page/old/flow/`, `framework/styles/layouts/fit/`, `michael/page.js`.

**Caveats.** Counts are of `page.js` files and the CSS they own: a `css(\`…\`)` block, a `<style>`, or a `.css` file the page names. CSS pulled in by a *component* a page uses is not counted (it is the component's, not the page's). A few pages named the shared `../styles.css`, which inflates them slightly. Line counts include blanks.

---
*Commands (from `public/`): `find . -name page.js -not -path "*/node_modules/*" | wc -l` (1,221 total).*
*A node script (scratchpad `a.mjs`) walked every `page.js`, summing `css(\`…\`)`, `<style>`, `style(\`…\`)` bodies and any `.css` the file names or that sits beside it as `page.css`/`index.css`.*
*Classes by regex over that CSS text (`grid-template|flex|@container|@media` = layout; `padding|margin|--pad|--gap` = spacing; `font-|line-height` = type; `color|background|border|shadow` = colour).*
