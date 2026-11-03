# Which big thing does each proposed task plainly serve? (25 tasks)

You sort; you do not build. Do NOT edit any file. This brief has everything you need: do not search the repo. Your final message is ONLY the JSON array described below (the runner saves it to `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/batches/07-priority/results.json`).

The owner has three big things:

1. **See and approve the work** — One page per day where the owner sees every session, opens a demo, and approves a whole session with one press. Approving a session approves everything inside it. Spend that never gets approved shows red, as a leak. What is ready to merge sits on the same page. - **Now:** the review page is being built on the AI dashboard ([/framework/ai/], brief: [review-page]). The Merge list is live at [/framework/ai/merge/] and folds into the review page. - **Inside it:** the phone pages for sessions ([sessions/v/mobile]) and the design picks they follow ([mobile-cards.md]); the session page with its tasks; a time filter (Today, Week, Month, Year) inside a session; the 19 closed worktrees whose commits n
2. **Every ask becomes a task that finishes** — Each thing the owner asks for is filed as a task the first time, runs step by step, and ends done or documented, with its proof. Nothing is lost between sessions. - **Now:** the 230 proposed tasks from old asks are being sorted under these three things (accepted into a priority, or parked in a backlog the owner can approve in one press). Process names are decided (*step*, one class per template, handoff by moving the task) and the rename is under way. - **Inside it:** prompt records (each prompt split into parts, its completion computed: [prompt-records.md]); processes ([process.md]); task resolution ([resolution.md]); node chases a started task that goes quiet (the "task chase" and "status 
3. **Agents that know the rules** — Every agent knows where things go and what was decided, from short readmes it can trust, and the right model does each job. - **Now:** the documentation rule is written (documentation skill §4: `readme.md` is the index, a sibling `<topic>.md` for an often-read topic, `doc/` for the rest; no dated logs in readmes; the mastermind owns its area's docs). Next: a cheap pass that makes every readme follow it. The model experiment: one Opus builder that designs and builds a whole slice, compared with an Opus planner plus Sonnet builders ([models]). - **Inside it:** the readme system ([doc/readme-system.md]); seeing which readmes, skills and tools each agent got ([agent-context.md], the readmes page

For each task below answer ONE question: which of the three big things does finishing it **plainly** serve: 1, 2, 3, or none? Answer `none` when in doubt. A task that merely touches the same folder is `none`; it must plainly be part of the thing's own description above.

## Output

A JSON array, one object per task, same ids, nothing else in your message:

```json
[{"id":"abc1234567","priority":1,"why":"one short line"}]   // priority is 1, 2, 3 or "none"
```

## The 25 tasks

1. `f4377b3aa3` [styles/layouts/cols] For each two column variant, show what goes on each side — No variant page in styles/layouts/cols labels the content of each side; the matrix page (cols/matrix/page.js:53) shows one box only.
2. `048df45752` [styles/layouts/cols] Show background colors for each side of the two column variants — The two-column variants page does not exist yet (see f07fa769e9), so no side backgrounds are shown anywhere in styles/layouts/cols.
3. `3adc7b92f4` [styles/layouts/cols] Show a variant with one side nested within the whole layout — No nested-side variant found in styles/layouts/cols; the variant page it belongs to is not built (see f07fa769e9).
4. `989d54daf1` [styles/layouts/cols] Add a variant: card on one side, image or icon on the other by size — No card-plus-image two-column variant found in styles/layouts/cols; the size-based swap is not shown in cols/matrix/page.js.
5. `f723927dce` [ext/toc] Explore better table of contents styles — ext/toc/toc.css exists and ext/toc/toc.js:18 renders a plain toc-title h4; no alternative TOC style set has been explored.
6. `247bae710b` [ext/toc] Explore styles for H4 and H3 section headings within the table of contents — ext/toc/toc.js:37 collects only h2 and h3 (.h2, .h3); a grep for h4 or icon in ext/toc/toc.css returns nothing, so H4 headings are not styled in the TOC.
7. `0ccf03b516` [styles/layouts/sidebar] Design a left sidebar navigation for single column blog post UI — styles/layouts/sidebar/page.js has no blog-post variant; a grep for mobile, menu, dropdown, nested and inner returns nothing.
8. `e9c7bb3b09` [design/layout] Pick the best design permutations after exploring them — Depends on the variant pages in asks f07fa769e9 through 0ccf03b516, none built yet; the pick has not been made.
9. `d0ec433570` [styles/elements/lists] Create a few variants for lists, built on the existing list work — styles/elements/lists/page.js exists, but it holds no sidebar, nested or menu list variants.
10. `0b205d15c3` [ext/toc] Keep the table of contents a narrow, minimal sidebar — ext/toc/toc.css exists; the narrow minimal sidebar width is not set as the TOC's default.
11. `562babd31a` [styles/elements/text] Let section titles carry icons, larger than H4s — A grep for icon in ext/toc/toc.css returns nothing, and no section-title icon rule exists in the text element styles.
12. `12b6e7b8cc` [ext/toc] Treat the TOC as a tree widget — ext/toc/toc.js:47 builds a flat div.c("toc-links") list; ux/Tree/Tree.js:9 exists to reuse for a nested tree.
13. `bad6d8a087` [ui/tree] Build examples of every tree nesting with icons and hover buttons — ui/tree/page.js exists, but no page shows all the nestings asked for: subheadings, expandable or fixed second level, icons and hover buttons.
14. `0c5c348672` [ai] Check whether a tree widget already exists — ux/Tree/Tree.js:9 - export default class Tree extends View {
15. `889b286a3b` [styles/elements/lists] Create a lists file compiling every list design that fits a sidebar — styles/elements/lists/page.js exists, but a grep for sidebar, dropdown, menu, nested and inner finds only one match, so no sidebar-list compilation exists.
16. `9ef39b57fb` [styles/layouts/sidebar] Add left and right sidebars with a one-column mobile TOC behind a menu — styles/layouts/sidebar/page.js has no mobile dropdown or menu TOC; a grep for dropdown, menu and mobile returns nothing.
17. `7fcf73f951` [styles/layouts/sidebar] Add multiple left sidebars, a global one and an inner one, for giant screens — styles/layouts/sidebar/page.js has no global or inner sidebar pair; a grep for global and inner returns nothing.
18. `fc47d39c1f` [ai] Apply the code-driven loop principle across all AI systems — No 'loop' hit in the worktree's CLAUDE.md or public/framework/doc/rules.md. public/framework/ai/doc/undone-asks-2026-10-17.md:21 says it was a law at the bottom of CLAUDE.md, so the law is missing here.
19. `abbf649543` [audit] Audit the file tree; remove or document files nobody can explain — Open-ended cleanup. Only a glance at .claude/hooks was made; no file-tree audit was located, so the work is treated as still open.
20. `c0989a1fce` [ai] Port everything to one single data structure and remove all stale fragments — Per memory two-dashboards-two-datastores.md: ai/v/3 reads board.jsonl while the original reads task.jsonl and directory.json. Still two stores; not checked in code.
21. `2b553f35c6` [ai] Carefully review the categorisation process for AI and other modules — public/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/categories.json exists; no review of the categorisation process is recorded.
22. `e03da3f39a` [code] Write one large naming skill: names, files, locations, OO, live views — No naming skill in .claude/skills/*/SKILL.md. Only .claude/hooks/naming-guard.mjs exists; the skill covering naming, file names, locations, OO design and live OO views is not written.
23. `c6cd3ff631` [code/objects] Build simple views that show OO classes updating in real time — Grep for live, real time, or updat in code/objects found no matches. The log module description says the idea is 'not built'.
24. `4d7f6e7150` [ext/DataGrid] Move the DataGrid header up and fill the page height above the footer — Grep for footer in ext/DataGrid found no matches. The grid has no height rule that stops it being cut off by the footer.
25. `c53bf72432` [design/layout] Add left padding to the page — Not found as built. The ask names no page, so there is no target to check against.
