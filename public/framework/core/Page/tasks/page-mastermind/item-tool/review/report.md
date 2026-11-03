verdict: pass
1. [note] Subtask 4, last bullet: the brief said to call the unused `js_children` helper (`Subpages.js:107-114`). The branch deletes it instead, and changes the stale test so it checks that the child is noted in the parent's `page.jsonl` and `page.js` is left untouched. The ask's core (a `page.js` parent gets its child noted) is met, and the reason (a page.js is code and is never edited, 17c696fa6, 645ccbe33) is written in `Servex/doc/item-tool.md`. The mastermind should confirm this departure from the brief at merge — diff.patch, `Servex/agents/page_tools.test.mjs` hunk.
2. [note] `page_class()` ends in `.catch(() => null)`, and `page_refusal` then returns null. If `Page.class.js` ever fails to import in node, every page line is written unchecked and nothing logs why. One warning line would make that visible — diff.patch, `page_tools.js` `page_class`.
3. [note] `page_refusal` re-parses and replays the whole `page.jsonl` on every page write (`Page.replay([...parse_lines(at.file), …])`). The cost grows with the file, so a session page with thousands of lines pays it on every `page_add`. Task files keep a live root; page files could do the same later — diff.patch, `page_tools.js` `page_refusal`.
4. [note] The new doc section is dated 2026-10-24 ("A real Page, and lines refused before they are written"), but the work is from 2026-10-23 — `Servex/doc/item-tool.md`.
5. [note] The handoff checks in `item_tool.test.mjs` are now skipped when `Servex/node_modules` is missing (in a worktree). The test prints a line when it skips, but its pass count then varies by tree.
6. [note] There was already a problem on the navigation page, and this diff does not cause it: the tab bar wraps to 3 rows at 1200 (navigation 14) — layout.json tab_rows 3 at 1200, 2 at 1920.

Widths given: 400, 1200, 1920, 3440 for both pages (`core/Page/navigation/`, `core/Page/parts/`). The only visible changes are the navigation page's picture path (`shots/` → `doc/`) and one `{"file":"kinds.js"}` line on the parts page.

## Requirements
- 1 "A delta whose keys are all queries runs them … and writes no line; a mix is refused; target works for queries; no separate get key" — yes — `ask()`/`walk_queries` in page_tools.js; tests "a query writes no line (file size before = after)", "a mixed delta … is refused, nothing written", "target walks into a child for a query"; no `get` key exists
- 2 "One call on a session folder answers its tasks, completion, cost, duration and child sessions … plus a summary query … keep the fields the current answer already has … write down Session vs Task" — yes — `Task.summary()`, `children`, `total_cost`, `at_path`; the real session-e00f55c9 answer is in session.jsonl's outcome; the decision (stay a Task) and its reasoning are in item-tool.md; `task_state` is untouched
- 3 "Tests: a query writes no line; a mixed delta is refused; the session summary is correct with nested and referenced tasks" — yes — item_tool.test.mjs query block (nested a1, referenced child-session, plain-task); session.jsonl: "item_tool.test.mjs 84 pass"
- 4a "A Page loader … a bad key or unknown part type is refused before it is written" — yes — `page_class`, `bad_page_delta`, `page_refusal` on item/page_add/page_call/page_set; Page.test.mjs section 3
- 4b "Make the import-time DOM touches safe in node … so no stub is needed" — yes — guards in View.js (stylesheet, supports_sanitizer), Reader.js, Jsonl.js; site-hooks.mjs resolve hook, no stub
- 4c "Load one list of part types for the tool, the tests and the browser" — yes — `parts/kinds.js` `PART_TYPES`, imported by Parts.js, AISessionDetail.js, page_tools.js, Page.test.mjs
- 4d "Add Page.test.mjs: replay through the real Page; typed parts become their classes; an unknown type is reported; the item tool refuses a bad line" — yes — Page.test.mjs sections 1, 2, 3
- 4e "Fix the hole that makes page_tools.test.mjs fail: a page.js parent gets its child noted" — yes — the child is noted in page.jsonl and the test asserts it; the helper was deleted rather than called (finding 1)
- "Update the item tool's doc: what a query is, and one example of each" — yes — ai-api.md "Asking without writing: queries", item-tool.md, Servex/readme.md
- Live instances of changed classes (Task, Page, Item) — n/a for a new page. The item tool itself now answers a live Task (`{"summary":{}}`), and no new class holds state of its own (`kinds.js` is a list)

## Page structure
- page 1 (title says what it is) — yes — shots/…navigation/1200.png "Navigation", …parts/1200.png "Parts"; unchanged by this diff
- the rest — yes — neither page's structure changed; the diff only touches an img src and a file-list line

## Navigation
- page 13 (identify) — tabs (module top tabs), a sidebar (site tree), a bottom rail at 400
- page 14 (tabs fit) — no — layout.json tab_rows 3 at 1200, 2 at 1920 on navigation; this is not caused by this diff (finding 6)
- sidebar persistent, active item marked — yes — sheet.png, "Navigation" / "Parts" highlighted in the tree
- bottom rail at 400 — yes — 400.png bottom band; wraps for ✦AI/☰Menu (3.2 lines) are icon+label stacks, as designed

## Layout
- layout — yes — navigation `doc`, parts `standard`; overflow_x false at every width

## Sizing
- picture sized — yes — navigation img band 337 px at 1200 (share 0.337, ink 0.525), so the new `doc/levels-1920.png` path loads
- text measure — yes — widest_text 595/638/713 (navigation), 436–526 (parts)

## Wrapping
- headings — yes — "1. Persistent vs switching" wraps to 2 lines at 400 only; "A page made of parts" also 2 lines at 400; acceptable at phone width
- controls — yes — brightness_auto 1.7 lines is the icon-font ligature, the same at every width and not caused by this diff

## Spacing and padding
- side padding — yes — left_stack h1 28 px at 400, 38 at 1200 (navigation and parts); it grows with width
- empty share — n/a — parts at 3440 is 83% empty, but that is a short page, not something this diff caused

## Colour and contrast
- contrast — yes — sheet.png: dark text on light ground, accent links; unchanged

## Flow
- order — yes — navigation: title → intro → cards → sections → picture; unchanged by this diff

## Words
- doc words — yes — ai-api.md and item-tool.md say what a query is in one sentence, then give examples; the refusal texts end with "Nothing was written."
- dates — no — item-tool.md section dated 2026-10-24 (finding 4)
- owner's name — yes — absent from the diff
