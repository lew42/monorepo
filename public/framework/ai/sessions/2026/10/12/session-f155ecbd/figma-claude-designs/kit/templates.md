# Report: Templates · Two-column pages

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-templates.md](brief-templates.md). Task log: [templates/task.jsonl](templates/task.jsonl).

## Pages built
- Page `Templates · Two-column pages`, overview component `Page · Templates · Two-column pages` (`262:34669`, 1920) at the top left, with the Notes (verdict) and How-to boxes and all 15 templates at 22% with captions.
- The 15 masters sit full size, top level, right of it (x from 2200, four per row).
- Below the masters (x 0, y about 16400): section `▶ PROTOTYPE · Templates` (`261:72043`), then section `Filled examples · instances of the templates` (`261:72336`).
- Linked from the Overview design-system card (text `262:72373`, goes to the overview component).

## The 15 templates (`Template / 2col / <name>`)
Twelve are component sets with a `Scheme` variant (Mixed, Light, Gray, Dark) and the properties `Title`, `Description` and a `Content` slot:
- `sidebar-280 · article`, `sidebar-280 · dark nav · table`, `1/4 · 3/4 · card grid`, `1/3 · 2/3 · masonry`, `2/5 · 3/5 · form`, `1/2 · 1/2 · list and preview`, `3/4 · 1/4 · right rail`, `1/4 · 3/4 · sticky TOC · long article`, `360 · fill · filters and cards`, `1/3 · 2/3 · profile · table`, `1/2 · 1/2 · prime splash · article`.
- `1/4 · 3/4 · section rows`: a header plus three rows, each row a narrow title and description on the left and a slot (`Section 1..3`) on the right.
Three nest the `Site template` global nav, with an inner sidebar from `Kit · Slots vs components`: `site nav · docs TOC · article`, `site nav · section sidebar · card grid`, `site nav · settings TOC · table`.

## How the owner's rules landed
- **Ratios:** 1/4, 1/3, 2/5, 1/2, 3/4, plus fixed 280 and 360, as fixed widths at 1920 (480, 640, 768, 960). Grounds differ per side (gray | white, white | gray, dark | white, prime | white).
- **Nav interaction:** active tree item (`List / Tree item` Active), a selected item with its preview, a sticky TOC, the three Site-template navs.
- **Margins:** 64 outer, 48 at the centre line; articles use a 760 measure; cards and tables reach both margins.
- **No ragged grids:** card rows use a fixed height (160, named in the layer) with the cards FILL in a wrap with min and max width; the masonry balances by real height. Card counts are 4, 8, 10 or 12 so no row is left with an orphan.
- **Nesting grounds:** two grounds per page (left and right, or alternating section rows), no box inside a box inside a box.
- **One dropdown:** `Scheme` sets the fill and the Text mode on both sides together; `Resolution` is set once on each root.

## Not possible, and why
- The three `site nav` templates have no `Scheme` dropdown and no `Title` or `Description` property: they nest the `Site template` master, whose fills and text are inside the nested instance, and Figma cannot expose a nested instance's text as a property of the outer component. Edit the text in place; recolour by swapping the nested masters.
- The masters have a fixed height (set from the content, minimum 720) because Figma does not let a FILL-height column grow its parent. Change the root height if you put in a lot more content.
- Sticky is annotated (template name, kicker `LEFT STICKS` and the overview) but a component cannot hold a sticky behaviour; it is set when the page is built.

## Filled examples (6, real content)
- Three wired screens in the prototype section (detached copies of the nav templates, so the destinations are top-level frames): `Example · Docs · Getting started`, `Example · Pages in this section` (equal-height card rows), `Example · Sessions table`. Global-sidebar Home, Docs and Settings are wired between them; flow `Templates prototype`.
- Three instances in the examples section: `Example · Pages in this file` (equal-height cards), `Example · What each page covers` (masonry), `Example · Design system overview` (section rows with real counts: pages, templates, examples).
- Content is real: page names and descriptions from this file, the `Grid card`, `Stat`, `DataGrid`, `Row`, `List / Tree item`, `Search` and `Chip` specimens as new instances; nothing was moved.

## Verdict (also in the overview Notes box)
- **Most pages, five:** `site nav · docs TOC · article` (docs), `1/4 · 3/4 · card grid` (indexes), `1/3 · 2/3 · masonry` (mixed lengths), `sidebar-280 · dark nav · table` (data, tools), `1/2 · 1/2 · list and preview` (pick and see).
- **To redo the DS pages:** `1/4 · 3/4 · section rows`.

## Checked
Every master's Mixed variant was screenshotted at 100%; fixed: clipped content (heights), empty data-grid rows (filled with `Row`), orphan card rows, a void under the prime splash. Light, Gray and Dark variants share the structure and differ only in fill and Text mode; the four widths are not applicable (these are 1920 masters).

## Not done
- No new text style or variable; the 64, 48, 56 and 160 values have no token and are named in layer names.
- The overview thumbnails are clipped at 250 high, so the tallest masters show their top part.
