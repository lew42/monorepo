# The Page system program: requirements (top priority)

The owner's words are in `owner-words.md` (long; read every line). The Page, meaning the class, the concept and /framework/core/Page/, is the foundation of everything: layout, colour, content, file structure, navigation, sub-pages, AI integration and storage. Getting it right is the priority.

## Asks (tick each against the owner's sentence)

1. **Inventory first, cheaply.** Sonnet minions, one area each, find ALL prior work on pages, layout and navigation:
   - /imagine/ (incl. /imagine/paging/ column paging), /layouts/;
   - framework/styles/sections;
   - core/Page (columns, width words, the Layout and Make tabs), core/Sidebar variants, ext/drawer;
   - the layout explorer (being built), layouts/decide, the page previews and templates, routing;
   - the task logs of recent months (public/framework/ai/**/task.jsonl: requirements and outcomes).
   Output: one table: what it is, where it lives (a link), its state (live, demo, dead), and whether it's worth keeping or referencing.
2. **core/Page/layout/ becomes THE layout system:** a directory, not a class. It covers page layouts and the layout inside pages, with a README (core concepts, an index of layout types, the decision process, research worth keeping) and the layout work moved or referenced there, starting from the parent structure and navigation and then the internal structure. Move only what's safe; link the rest.
3. **A NEW core/Page/navigation/ page and system:**
   - the core concepts, starting with the one that matters most: is navigation PERSISTENT (it stays fixed and never jumps) or SWITCHING (everything swaps on a click)? Persistent navigation must not move;
   - the levels of navigation (header, left sidebar, top tabs, inner left sidebar) and when stacking them gets absurd;
   - the class-doc top-tabs pattern documented as the go-to for multi-level navigation until something better exists;
   - the alternatives (Miller columns from /imagine/paging, a workspace with contextual left and right sidebars that swap), each with a demo link.
4. **The new-page process:** what must happen when a page is created, above all a child page thinking through its PARENT's layout and visual hierarchy. Decide what's a skill (words) and what's a tool (a node function that creates the folder, page.jsonl, the parent link and the readme reliably). Update the `page` and `new-page` skills; keep them short.
5. **README vs rendered page:** the README is the text version; the rendered page is navigational and structured (modules, clickable structure). The page is designed FROM the README. Short-term duplication is acceptable. Say so in the documentation skill. (The readme-as-content example is being built by task-mastermind-module-experts; reference it.)
6. **page.jsonl as each page's source of truth,** including the files and folders appearing under it. Document its size (is there monitoring or purging?) on the Page page. Propose one if none exists.
7. **The core/Page readme** lists every sub-system (layout, navigation, making a page, storage, AI and sessions) in one line each, with no explanation of the self-evident.
8. **Sessions stay reachable:** post each agent's session id on the card (who, what, session) so the owner can go back and ask any of them "what did you find, and why?".

## Rules
- The inventory (step 1) goes first, with Sonnet minions; judge with Opus.
- Keep every existing version reachable; never destroy a viable layout.
- Use a pool worktree, the smoke test with links followed, merge.mjs, and a fresh-eyes review against the owner's words.
- At most 3 minions at once; budget about $15, stated before each step.
- task-mastermind-module-experts is building the Page EXPERT (loading and checkpoint). You own the Page CONTENT (readme, layout, navigation). Split the core/Page readme edits with it explicitly, so neither clobbers the other.
- Post progress on card 2026/09/29/the-page-system-layout-navigation-new-pa.

**Decision from the owner (audio/owner-words.md, "Continued (about 8:40 PM)", the end; relayed 20:30 by mastermind-servex-7):** a card is a tiny page WITHOUT a folder by default. Its data is a line in the parent's page.jsonl, with a virtual, routed URL through the parent's route(). A folder is made ON DEMAND, only when the card grows. The rule: a card's data lives in the nearest page.jsonl that exists.
