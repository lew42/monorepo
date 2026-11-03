# Every page at every width

The four pages the rail was judged on, shot before the first edit and again after
the last one, at 1280, 1920 and 3440 — plus the 400px menu, where the rail stops
being a rail and becomes a top bar.

Each shot is the sidebar's own box plus 100px of the page beside it, so the rail's
right edge is visible rather than cropped at.

## /framework/core/Page/ — the deepest tree on the site, 29 rows over three levels

| | before | after |
| --- | --- | --- |
| 1280 | ![](../shots/before/page-1280.png) | ![](../shots/after/page-1280.png) |
| 1920 | ![](../shots/before/page-1920.png) | ![](../shots/after/page-1920.png) |
| 3440 | ![](../shots/before/page-3440.png) | ![](../shots/after/page-3440.png) |

## / — the home page, a flat list with no folds and no icons

This is the one that shows the empty columns. Nothing in this rail folds and nothing
carries an icon, but every row still reserved a column for both, so nine labels sat
80px into a 256px rail with nothing whatever to their left.

| | before | after |
| --- | --- | --- |
| 1280 | ![](../shots/before/home-1280.png) | ![](../shots/after/home-1280.png) |
| 1920 | ![](../shots/before/home-1920.png) | ![](../shots/after/home-1920.png) |
| 3440 | ![](../shots/before/home-3440.png) | ![](../shots/after/home-3440.png) |

## /framework/

| | before | after |
| --- | --- | --- |
| 1280 | ![](../shots/before/framework-1280.png) | ![](../shots/after/framework-1280.png) |
| 1920 | ![](../shots/before/framework-1920.png) | ![](../shots/after/framework-1920.png) |
| 3440 | ![](../shots/before/framework-3440.png) | ![](../shots/after/framework-3440.png) |

## /framework/ai/

| | before | after |
| --- | --- | --- |
| 1280 | ![](../shots/before/ai-1280.png) | ![](../shots/after/ai-1280.png) |
| 1920 | ![](../shots/before/ai-1920.png) | ![](../shots/after/ai-1920.png) |
| 3440 | ![](../shots/before/ai-3440.png) | ![](../shots/after/ai-3440.png) |

## 400 — the rail is a top bar

| before | after |
| --- | --- |
| ![](../shots/before/menu-400.png) | ![](../shots/after/menu-400.png) |

## The other trees on the site, checked for damage

`ui/tree`'s stylesheet is shared, so re-sizing the fold arrow reaches every tree.
Each of these was loaded after the change: no page error, no row overflowing its
rail, and the arrow reads at a page's font size the same way it does at the rail's.

- `/framework/ux/Tree/` — the class's own demo, 138 rows, drag grips and row buttons
  ([shot](../shots/consumers/ux-tree.png))
- `/framework/ui/tree/` — the template's page ([shot](../shots/consumers/ui-tree.png))
- `/imagine/paging/make/` — the page CMS's tree ([shot](../shots/consumers/make.png))
- `/framework/styles/system/` — where the new ground/field example lives
  ([shot](../shots/consumers/system.png))

`/layouts/labs/trees/` was on the list and turned out not to be a consumer at all:
it draws its own rows from `trees.css` and only mentions `ux/Tree` in comments.

## How these were measured

On the **visible** rail, not the first one in the document. The app keeps a page you
have already visited in the DOM, collapsed to 0px wide, and that includes its own
`Sidebar` — so `document.querySelector(".sidebar")` on `/framework/core/Page/` hands
back the home page's rail, every box on it reading 0. The first measuring pass
reported a zero-width sidebar on three of the four pages and clipped the shots to
100px before that was spotted. Anything measuring this rail again wants
`[...document.querySelectorAll(".sidebar")].find(el => el.getBoundingClientRect().width > 0)`.
