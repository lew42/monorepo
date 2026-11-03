verdict: fix
1. [fix] The in-flight page is not shown in the shots: `/framework/ai/now/` renders the AI board with its "Now" card (shots/monorepo-localhost-framework-ai-now/sheet.png, all four widths), not the `AINow` view. Either the new child loses to the AI board's own `now` route or the dev server was not restarted. "Right at 400 px" is unproven (Requirements 2).
2. [fix] No before/after shot of the sessions grid, and no `check.mjs` or in-flight vs `list_agents` numbers are in the diff (Requirements 3). The plan note admits the count deviates by design (5-minute "working" vs Servex working), so the equality proof was not made.
3. [fix] `Server/SessionIndex.mjs` (the `tasks` source) is not in the diff, so the "one index feeds the grid" ask for `tasks` is not visibly met (Requirements 1). The diff only imports it, and the readme still describes it as a second source.
4. [note] A `layout.json` of `/ai/now/` at 400 shows 67 items, `empty 0.506` and a 13727 px band. These are the board's numbers, not the new page's.

Widths given: all four (400, 1200, 1920, 3440). Every page-level answer below is judged on the board shown, since the new page never rendered.

## Requirements
- 1 "queries through DatedFiles.query; one reader" — no — `Server/SessionIndex.mjs` untouched in the diff; `DatedFiles.mjs` and `session-query.mjs` changed
- 2 "in-flight page, live, 400 px, empty state" — no — shots show the board, not `AINow`; source files exist (`now/AINow.js`, `AINow.css`, `page.js`), the child is added in `ai/page.js`
- 3 "proof: grid shot, check.mjs, count equality, check_page 400 and 1200" — no — none attached
- 4 "docs: Query readme, dated-files.md, ai/readme.md line, plan tick" — yes — all four files are in the diff
## Page structure
- page 1 (/ai/now/) — no — shots/monorepo-localhost-framework-ai-now/400.png: the title and content are the board's, not a page that says "in flight"
- page 2 (/ai/) — n/a — unchanged apart from the children list
## Navigation
- techniques: rail, tabs (board, unchanged)
- tab_rows — yes — layout.json tab_rows 1 at all four widths
- other questions — n/a
## Layout
- no — layout.json layout "ai2" is the board's layout, not the new page's
## Sizing
- not measured for the new page — layout.json overflow_x false at all widths; widest_text 272 at 400
## Wrapping
- yes for the board — tab_rows 1, no overflow_x; the new page is unmeasured
## Spacing and padding
- not measured for the new page — layout.json left_stack is the board's (h1 14 px, p 66 px at 400)
## Colour and contrast
- n/a — the new page's colours were never rendered
## Flow
- no — empty 0.506 at 400, 0.432 at 3440 on the board; the new page's flow is unproven
## Words
- no — `AINow` copy was never seen; the readme and doc text (dated-files.md "Working now vs. in flight") is clear but long
