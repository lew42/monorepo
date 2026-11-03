# Brief: tidy every Claude page into one 1920 wrapper, made a component (owner, 2026-10-13)

The rule is [doc/page-layout.md](/framework/ext/Figma/doc/page-layout.md): read it first, then [use-figma.md](/framework/ext/Figma/doc/use-figma.md) (recipe rules 6–7, Traps). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Your pages are listed in the prompt; touch no others (other agents are working on other pages at the same time). The owner's pages (Page 1–8, Color Schemes, Vector Design, Paragraph Design) are off limits.

The owner's words: "each page to be a 1920 pixel wrapper and then lay everything out in there… vertically scrollable… prioritize the above the fold section, just like we do in web design… make sure everything is auto layouted properly and the visual hierarchy makes sense, the spacing between headers and the content and how all the content is grouped… just make everything a component by default so that we can put that on a table of contents page." Example of what to fix: a card with Back and Next stacked, both left-aligned, with a lot of empty space beside them. They belong on one row.

## Per page
1. Screenshot it first (the desktop MCP is faster for reads if your session has `figma-desktop` tools; otherwise use the remote `get_screenshot`).
2. Build `Page · <page name>`: a 1920 auto-layout wrapper. Its above-the-fold top holds the title, a one-line gist, the page's Notes box and the key specimen; the sections follow. Move the existing frames into it (moving keeps node ids, so the Overview links and hyperlinks still work). Reset moved children to HUG/FILL so they don't keep stale FIXED sizes. Bind spacing to the Resolution tokens (section-pad, gap).
3. Fix layout faults you see on the way: overlapping layers, absolute stacks, rows that should be one line, a heading that sits farther from its content than from the section before.
4. Exceptions:
   - Kit masters (COMPONENT / COMPONENT_SET) go into a `Components` frame beside the page component, and the page shows instances.
   - Prototype destination screens stay top-level in a Section named `Prototype screens`. Count prototype reactions before and after; they must match.
   - Anything wider than 1920 gets its own wrapper beside the first.
5. `was · …` backups go into a Section named `Backups` at the far right. Never delete.
6. Turn the wrapper into a component (`figma.createComponentFromNode`). Screenshot it and fix what looks off.

Report `kit/tidy-<group>.md` (one line per page: page id, page component id, what moved, what you fixed, reactions before/after), committed by path. Don't build the Index page: the mastermind does that after all groups report.
