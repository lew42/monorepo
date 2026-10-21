verdict: pass
1. [note] A 404 resource error appears at all four widths on /framework/core/Item/Dated/ (layout.json errors) — likely a missing file the page or its shell requests; find which and fix or declare it.
2. [note] At 1200 and above the page is 57-69% empty (layout.json empty 0.568 / 0.594 / 0.693): the one-paragraph intro and the demo code block sit in a narrow column while the code block fills the wide space. Acceptable for a doc page, but the demo itself ("Make a demo project") is small and low on the page, below the code (shots/.../1200.png, bottom band).
3. [note] The first paragraph carries a long file path in inline code ("public/framework/ai/sessions/2026/10/20/...", widest_text 337px at 400); it did not overflow (overflow_x false) but is the widest line at every width.
4. [note] Only one of the requirement checkboxes is visible to this review: the dev-server-dependent demo button cannot be verified from shots, and the diff shows the button's error text asks to restart the dev server to load `dated_create`.

Widths given: 400, 1200, 1920, 3440 (page layout, all four) for /framework/core/Item/Dated/; /framework/core/Item/ also shot for its new Dated tab.

## Requirements
- 1 `Dated.js` + `DatedFiles.mjs` with create, move, query, check; `ProjectMove.mjs` a thin caller — yes — diff adds core/Item/Dated.js and Server/DatedFiles.mjs and edits Server/ProjectMove.mjs
- 2 tool and socket route call the same methods, reuse `move_project` — yes — diff touches Server/run.js and Servex/Servex.js, adds `dated_create` socket method
- 3 `Dated.test.mjs` in plain node — yes — file present in the diff (not run by this review)
- 4 page `/framework/core/Item/Dated/` with the projects query and a create button — yes — shots/…Item-Dated/sheet.png shows the intro, the demo code and the "Make a demo project" button; `check_page` not re-run here
- 5 doc home: jsonl.md "The store", Item and JSONL readme pointers, `Dated` in the class list, `Server/doc/dated-files.md`, plan ticked — yes — all in the diff
## Page structure
- page 1 (title says what it is) — yes — shots/…Item-Dated/1200.png: "Item" header with a Dated tab; page title "Dated" in page.js
- page 2 (one takeaway, the thing shown) — yes — a live list plus a button, words short and plain
- page 3 (linked from its parent) — yes — Item/page.js declares "Dated"; files.jsonl lists it; tab visible on the Item page
## Navigation
- techniques used: tabs (Item page tab strip), a sidebar tree, a drawer rail at 400
- tabs wrap — no wrap — layout.json tab_rows 1 at 400; 5 at 1200/1920/3440 is the page shell's vertical tab/side list, not a wrapping strip
- sidebar/drawer reachable at 400 — yes — shots/…/400.png: Menu and AI buttons at the bottom rail
## Layout
- content in one clear column — yes — layout "doc" at every width
- nothing overflows sideways — yes — overflow_x false at 400, 1200, 1920, 3440
- order matches importance (intro, demo, code) — yes — shots/…/1920.png
## Sizing
- widest line readable — yes — widest_text 337 / 581 / 623 / 701px
- big empty bands — no big empty band — layout.json big_empty false at all widths; page-level empty 0.69 at 3440 (see note 2)
## Wrapping
- wrapped controls — note — layout.json wraps: drawer rail buttons 3.2 lines at 400 (shell, not this change); `mode-btn` and `drawer-menu` 1.7-1.8 lines at 1200+ (shell icon text, not this change)
## Spacing and padding
- left stack consistent — yes — layout.json left_stack h1 28/38/54/90px and p 28/68/92/180px, scaling with width
- room to breathe — yes — shots/…/1200.png top band
## Colour and contrast
- text readable on background — yes — shots/…/1920.png light intro text on dark page; code block dark with coloured tokens
## Flow
- reads top to bottom, one action — yes — intro, then demo, then one button
## Words
- plain sentences, names defined — yes — intro explains where a project lives and what the list and button do
- length — yes — intro is two short sentences plus one for the button (~60 words)
- jargon — yes — "pointer row" is explained in the page description
