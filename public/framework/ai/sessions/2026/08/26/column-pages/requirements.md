# Columnar paging system — mastermind run

## The ask (verbatim)

> ok mastermind
>
> you're going to improve our columnar paging system.
>
> you are fable, you use the most tokens, so spawn minions to act as your brains, research, ask questions, summarize complex dynamics, etc.
>
> ask the minions to search for anything regarding page columns, look into how pages are shown/hidden (i believe a lot of it is just css logic with active-ancestor type shit).  i believe we had columnar pages before (the catalog/rail system is sort of a similar idea).
>
> we want full-height pages, with sub pages, so that each sub page opens to the right in a new column.  this way, we can create trees of content.
>
> design a system for each page to define it's width (default, small, large, full?), and how that interacts with existing pages.  for example, if a sub page wants to be full, it has to swap into the correct area.  we probably want breadcrumbs, in case we run out of columns.  i think the easiest way to handle the limited space, is to just let the pages container horizontally scroll?
>
> i believe, for this to work, we need a single $pages container at the root, so that all children just automatically render into that container?
>
> after you get column pages working, spawn parallel minions to create many examples that utilize the system.  the appearance of the columns and sub pages could differ, from tab-like, to catalog-like, etc.  let's say we wanted a large column with a grid of small items, where each item opens in a small right column.  or a small grid column that opens a large column.  think about the --measure of each page, and how 2-column default content would look at 3440px monitor.
>
> focus on iterating different background + padding variations.  grids should always have padding, unless it's a "flush" grid, (0 gap, 0 padding).  and the background color behind a grid matters (maybe its transparent?), and the color of the new page matters (does it match the parent column?).  scrollbars will also affect the visual column boundary, so make note to consider content length, and possibly avoid making long pages that force a scrollbar, especially if you're trying to get that "connected tab-to-content" look.
>
> we have that connected tab-to-content look for the top-tabs on the ext/Doc pages.  the framework/ux/* pages try to re-use the top-tabs, for a second row, (ux/Tree/, for example), but it doesn't look right because the tabs background differs from the tabs content, and so we have broken alternating bands of color.  this could be fixed, but i'm thinking we should just use the left inner tabs that the Doc page's "API" tab uses, for example.
>
> we should be able to generate pages, without having to actually create the file system?  look at the framework/styles/layouts/space/ layout generator.  something like this would be useful, but keep it really simple.
>
> spawn minions to work in parallel, and create a library of reusable pages, similar to the existing layouts/space/ generator's words.  maybe create a similar DSL for pages.  however, we need navigation, which those layouts don't have.  we want to be able to generate randomized permutations of layouts from the library.  we can then try to hone the rules about which layouts work well with others, etc.
>
> what i'm realizing, is that all the page previews in the grid on the core/Page/ page, none of the visual previews are particularly revealing.  they don't communicate what it is.  generally, a grid should be extremely visual - self evident previews.
>
> for example, the top tabs that we have, i should see a little preview of page with only top tabs, no distracting content.
>
> i should see a preview of the left sidebar tabs, both the core/Sidebar style, and the "inner" (Docs api/method tabs) version.  we should see the preview of that, and only that...  and when clicking on it, see how to use it.
>
> so, this core/Page overview, should be all the building blocks that can be utilized by the page generator.  create the page generator at core/Page/generator/, make it one of the top tabs.

## Scope

1. Research: page show/hide mechanics, columns prior art (Miller demo, catalog rail), tab anatomy (Doc top tabs, inner left tabs, ux/* band problem), layouts/space generator DSL.
2. Design: column system — width words (small/default/large/full), single $pages root container, horizontal scroll, breadcrumbs, full-width swap.
3. Build: the column system in core/Page.
4. Build: page generator at core/Page/generator/ (a top tab) — generate pages without the file system, DSL like space words, randomized permutations, navigation included.
5. Rebuild core/Page overview previews as self-evident visual building blocks (top tabs only, sidebar tabs only, inner tabs only, ...) — the generator's palette.
6. Example library fan-out: background + padding variations, grid columns (flush vs padded), parent/child color matching, scrollbar-aware content lengths, --measure at 3440px.

## Fences

- The mastermind (this session) owns this file, task.jsonl, and all orchestration.
- Build minions get explicit file lists in their briefs; no two agents in one file.
- Research minions are read-only.
- Never kill or restart the dev server; never drive the owner's live tabs; never git stash; never commit.

## Assumption log

- Run task and effort task folded into this one dir (single-effort run).
