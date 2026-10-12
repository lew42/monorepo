# Inventory brief (read-only) — all prior page, layout and navigation work

Load the `minion` skill first. You READ ONLY. The one file you write is your own output file, named below. Do not edit anything else, do not start servers, do not open browsers.

## The owner's words (the acceptance test)

Full text: `public/framework/ai/2026-09-29/page-system/owner-words.md` — read it. The part that is yours:

> "have a cheap minion, do one or more minions, like, you know, first find all the locations of layout work, because there's a lot ... anything that, especially if it kind of crosses page and layout, like the column pages, like the navigation sidebars, the swapping versus switching ... dig through the whole site, all the imagine pages, all the framework stuff, all the tasks over the last few months ... find specifically anything that has to do with pages and layout ... any templates, any previews, any routing ... any substantial work that could help influence the outcome of this page system from the README through the layouts, the navigation."

## Your output

One markdown file (path given in your prompt) holding ONE table, then at most 5 lines of "biggest finds":

| what it is (plain words) | where (site url like `/imagine/paging/`, plus the source path) | state: live / demo / dead / proposal | keep, reference, or drop | why, one line |

- One row per distinct piece of work (a page, a module, a doc, a decision). Aim for thoroughness: 20–60 rows is normal.
- Site url = the path under `public/` (e.g. `public/imagine/paging/page.js` → `/imagine/paging/`).
- "dead" = unreachable (not in its parent's `children:`), or code no page imports. Check with Grep, don't guess.
- Mark anything about NAVIGATION (persistent vs switching, sidebars, tabs, Miller columns, workspace sidebars) with **nav** at the start of "what it is" — the owner cares most about that.
- Mark decisions the owner already made (look for "the owner, <date>" in docs/memory) with **decided**.

Keep the whole file under 150 lines. Finish by replying with the file path and your 5 biggest finds, then stop.
