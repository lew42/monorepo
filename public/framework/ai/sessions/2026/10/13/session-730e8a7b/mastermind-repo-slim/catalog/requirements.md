# Catalog: everything built with a UI, previewed, one click from its demo

Budget: $15. Load the `sub-mastermind` and `page` skills first. The owner's raw words: `../requirements-2.md`, ask 1 ("of all the past projects that we've worked on, I feel like I've only seen a small fraction… a catalog of all the things we've built… a preview on the catalog page is enough… click through to the full demo page… class cards with the icon of the class and the core API… a class list of all the ones designed that way… a live view of the actual instance hierarchy: still haven't seen that yet"). Your log is this dir's `task.jsonl`. CLAUDE.md: one of everything, show don't tell, route everything, link every mention.

## What exists (the mastermind's past-work run, 2026-10-13)

- Class cards exist: `ux/Content/Object/Inspect.js` (every class gets an icon + an `inspect()` card, live on `/framework/ux/Content/Object/`), the dark class card used by `#Mention` and the framework home (`/framework/`), `ext/System` (a class card + live demo + beat), `ai/classes/ClassIndexPage.js` (`/framework/ai/classes/`), `code/objects`, `ui/card`, `ux/Card`.
- A catalog mechanism exists in the demo system (memory: `catalog()` rail, `demo.tree()`, `/web/` guide tier) and `/framework/` is already a wall of sections from the sidebar tree. `public/framework/ai/doc/unreferenced.md` lists files nothing links to (126).
- Run `node Server/PastWork.mjs "catalog demo preview"` and `… "instance hierarchy live view"` yourself and record the answers; the live instance-hierarchy view may exist under a name like debug view, inspect tree, or the Panel/Page "two things side by side" demos.

## Deliverable

1. **The catalog page** at the place the `page` skill and the sidebar tree say it belongs (likely `/framework/catalog/` or a tab of `/framework/`; one page, not two): every module or demo page with a UI, as a card with a live preview (an iframe at reduced scale or a cached screenshot from `ext/DesignTool`'s shot system; pick the one that loads in under 2 s for 40 cards, say why) and its title; click = the demo page. Group by the sidebar's own groups. Computed from the page tree (a script or the tree itself), never a hand-typed list. Mark the ones the owner has probably not seen: no visit in the dev server's page log in the last 30 days if such a log exists, else anything landed after 2026-10-01.
2. **Class cards section:** the list of every class that has a card (icon + core API), each card linking to its page; the three examples the owner asked for first (Refine, Dictate, System), computed from the classes that `inspect()`/`ClassIndexPage` know.
3. **The live instance hierarchy:** find it. If something renders the live instance tree of a running page, link it at the top of the class section with a one-line "this is it" and a screenshot; if nothing does, write the smallest spec in `doc/instance-tree.md` beside the catalog (class name, what it renders, which existing class it extends) and say so on the card. Do not build it in this task.
4. **Four widths** (`check_page` 400/1200/1920/3440), smoke clean, `merge.mjs`; screenshot at 1200 on the card.
5. Report on your card: the link, the count of cards, how many marked unseen, the instance-tree verdict.

Fence: the catalog page's own directory, `public/framework/readme.md` and the sidebar tree entry (one line each), this task dir. Sonnet; Haiku minions for the census. One page, one minion at a time.
