verdict: fix
1. [fix, done] [Object](/framework/ux/Content/Object/) was a blank page: `ObjectCard.own_methods()` ran the `Page.prototype.unknown` getter and threw. Now it reads property descriptors, so getters never run.
2. [fix, done] [InstanceTree](/framework/ux/Content/Object/instance-tree/) had never merged (branch `worktree/instance-tree`, its review said fix). It is merged here. The demo now sits beside the live tree, and the router hook is added once per app, not once per redraw.
3. [fix, done] Every `ux/` page asked for 7 missing files: the card catalog data still pointed at `ext/AITask`, which moved to `ai/AITask` today.
4. [fix, done] [Figma tokens](/framework/ext/Figma/tokens/) opened scrolled to the bottom at 1200 and wider, and showed only one of the demo's two open selects.
5. [fix, partly] [Catalog](/framework/catalog/): 40 previews do not load in under 2 s. Each live preview boots the whole app. Shipped: previews load 4 at a time, top of the screen first (first one at 0.9 s, was 8.3 s). The proper fix, a picture per card, is in [catalog/doc/next.md](/framework/catalog/doc/next.md).
6. [note] The tab bar on Doc-layout pages wraps to 2 rows at 1200 (layout.json `tab_rows 2` on Object, InstanceTree and surfaces). That bar is `ext/Doc`, outside this task's fence.
7. [fix, done] The fresh-eyes reviewer found 9 things. Of the 5 real ones, 4 are fixed here, including an empty Refine class card and the InstanceTree demo buttons wrapping their words. It accepted both declines: the 2 s target, and the tab bar.
8. [done] Merged as `8c2008eb7`. On the main site all five pages render at 1920 with 0 errors, Object included.

## The four pages
| Page | Before | After | Proof |
|---|---|---|---|
| [/framework/catalog/](/framework/catalog/) | first preview 1034 px down at 1920; 10th preview loaded at 1.6 s, 40th at 11.0 s; 70% of the screen empty | NEW pages first, first preview 321 px down; full width; first preview loaded at 0.9 s; clicking a card opens its demo ✅; links to InstanceTree ✅ | [before](shots/monorepo-localhost-framework-catalog/sheet.png) · [after](after/review-site-pages-localhost-framework-catalog/sheet.png) |
| [/framework/ux/Dictate/surfaces/](/framework/ux/Dictate/surfaces/) | 9 surface cards; Dev shell said "not traced" | all 9 say where it is, the file, who answers and where it writes ✅ | [before](shots/monorepo-localhost-framework-ux-Dictate-surfaces/sheet.png) · [after](after/review-site-pages-localhost-framework-ux-Dictate-surfaces/sheet.png) |
| [/framework/ux/Content/Object/](/framework/ux/Content/Object/) + [InstanceTree](/framework/ux/Content/Object/instance-tree/) | blank page and a TypeError; InstanceTree not on the site | renders, 0 errors; after 2 "add a child page" presses the tree shows Demo 1 and Demo 2 (redrawn 2× → 12×) ✅ | [before](shots/monorepo-localhost-framework-ux-Content-Object/1920.png) · [after](after/review-site-pages-localhost-framework-ux-Content-Object-instance-tree/sheet.png) |
| [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/) | opened at the bottom (`scrollY` > 0); lede showed raw `[..](..)` text | opens at the top (`scrollY` 0); the table of Figma variable → site property pairs comes first; links render ✅ | [before](shots/monorepo-localhost-framework-ext-Figma-tokens/sheet.png) · [after](after/review-site-pages-localhost-framework-ext-Figma-tokens/sheet.png) |

Widths 400, 1200, 1920 and 3440 for every page (`Server/layout-check.mjs --bands`). The step-by-step measurements are in [task.jsonl](task.jsonl), and the fresh-eyes report is [review/report.md](review/report.md).
