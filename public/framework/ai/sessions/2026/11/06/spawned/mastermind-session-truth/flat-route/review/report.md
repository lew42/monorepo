verdict: fix
1. [fix] Server-side code still builds flat `/framework/ai/sessions/<uuid>/` links and writes them into committed files (requirement 2). `Server/AskIndex.mjs:47` (`AskIndex.link`, written into module inboxes at :157 and :260), `Servex/ext/refine/TagRouter.js:63` (the tag note's text), `Servex/ext/refine/CardAsk.js:39` (a card's `source`) and `Server/RefineQueue.mjs:171` (the prompt page fallback). All four run in node, where `SessionFolders.at(store).of(id)` gives the dated folder. Until they change, every new note or card adds another link that needs the redirect, and the decision to keep the redirect rests on those links.
2. [fix] The census in the task log still leaves out the node/Servex builders in finding 1 (and `Servex/ext/refine/VoicePage.js:37`, `page_tools.js:200` `own_page`, which pass a flat path to the page tools as input). It neither fixes them nor says they were left on purpose, so a fresh agent working from the folder alone would think the census is complete (deliverable 1). Rounds 1 and 2 grepped only `public/*.js`. A grep that also covers node: `git grep -n -E 'ai/sessions/\$\{(session|id|who|p\.session)\}/' -- Server Servex`.
3. [note] `Servex/agents/doc/own-page.md:14` still says "the url `/framework/ai/sessions/<id>/` only redirects there". That is true, but this same diff rewrote line 6 of the file to "its one dated folder", so the old wording now sits beside the new. Reword it to match agents.md ("a bare-uuid url is a browser-only redirect for old links").
4. [note] Servex must restart before the new `page_tools.js` PAGE_PATH text and `Agents.folder_line` take effect. The hook text changes on merge: this reviewer's own start line still printed the old "/framework/ai/sessions/<uuid>/ is only a redirect" wording.
5. [note] The one page change (`ux/Dictate/surfaces/page.js`, the text of one table cell) sits below the fold in every shot. It does not change layout, so the shots stand as evidence that the page still draws, not as a view of the edited cell.

Widths given: 400, 1200, 1920, 3440 for `/framework/ux/Dictate/surfaces/`. The `/live/` and `/live/design/` shot folders are left over from round 1 and are not evidence for this branch, which is 5 commits on `worktree/qf-2` ending at 122611d52.

## Requirements
- 1 "A list (task log `log` lines) of every place that serves, builds or advertises sessions/<uuid>/" — no — the log's "Places fixed" and "Round 2" lines cover `public/` and the docs, but they miss the Server/Servex builders (findings 1 and 2)
- 2 "Code that builds a flat URL builds the dated one instead … say which in one decision line" — partly — the browser links now go through `AISession.page_url` / `AICost.session_href` (diff: SessionOutlineView, SessionTimeline, SessionTasksGrid, DashRow, PageInbox, RoleView, PromptView). The decision line (22:44:26) keeps the redirect and names the alternative. But `AskIndex.link`, `TagRouter.text`, `CardAsk` and `RefineQueue` still build the flat url
- 3 "Every doc, skill, role readme, MCP tool description … stops pointing at the flat path" — yes, with one stale line — PAGE_PATH, session-page.mjs, `Agents.folder_line`, agents.md and about 20 docs are rewritten. Only `own-page.md:14` still has the old wording (note 3)
- 4 "indexing-past-work.md and sessions/readme.md say the one dated folder is the only address" — yes — diff: indexing-past-work.md, new paragraph after the event-line section; sessions/readme.md, the ⚠ line
- 5 "Tests … pass; run node <file> each" — yes — I reran them in `worktree/qf-2`: page_tools 44 checks, handoff-route 8, session-route-tasks 13, SessionConsolidate.test ok
- Class page for a new or changed class — n/a — no new class; `AICost.session_href` is one static, recorded in the AITask readme

## Page structure
- page structure — yes — shots/…Dictate-surfaces/1920.png: the title "Voice and chat surfaces" says what the page is; the diff changes the text of one cell only

## Navigation
- techniques — tabs, a sidebar, a side chat panel
- tabs fit — yes — layout.json tab_rows 1 at every width
- sidebar — yes — unchanged by this diff; 400.png folds it away

## Layout
- layout — yes — unchanged by this diff; 1920.png, a sidebar, a content column and a chat panel

## Sizing
- sizing — yes — widest text 358/594/637/716 px (sheet.png captions), within the measure

## Wrapping
- wrapping — yes — layout.json wraps: only the h1 at 400 (2 lines, expected) and icon buttons (mode-btn, drawer-menu, which measure tall by glyph). Nothing new from this diff

## Spacing and padding
- spacing — yes — left_stack 16/38/54/90 px at 400/1200/1920/3440, a single layer each time

## Colour and contrast
- colour — n/a

## Flow
- flow — yes — 1920.png: intro, "Same conversation", then a card per surface, top-down; order unchanged

## Words
- content — yes — the new wording is plain ("its one dated folder", "the only address", "a browser-only redirect kept for old links") and the same in agents.md, the sessions readme, identity.md and the hook
- consistency — no (note) — own-page.md:14 still has the older wording (note 3)
