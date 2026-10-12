# Page.class.js comment blocks: what to do with each (plan only)

Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history and lessons go to `doc/`. Regenerate: `node public/framework/core/Page/doc/comment-blocks.mjs --md`. The class is a first guess by keyword (dates, "was", "renamed" = history; the warning sign = trap), so skim before moving. Whole-file census: `node public/framework/code/patterns/comment-census.mjs` (934 comment lines; 772 of them sit in the 97 blocks of 4+ lines below).

| Class | Blocks | Lines | Action |
|---|---|---|---|
| history | 37 | 295 | move to `doc/decisions.md`, leave nothing (or `// see doc/decisions.md#x`) |
| trap | 26 | 205 | keep the one-line warning, move the story to `doc/watch-out.md` |
| banner | 12 | 148 | keep the title line, move the intro to the topic doc |
| explanation | 21 | 119 | keep one line, move the rest to the topic doc |
| obsolete? | 1 | 5 | confirm no caller, drop |

Expected result: ~772 lines become ~110 one-liners, so about -660 lines before any class moves.

| Line | Len | Class | Destination doc | Block starts |
|---|---|---|---|---|
| 25 | 5 | history: move | decisions.md | `page.jsonl` plumbing, folded in from the deleted `PageLog` middle cla |
| 33 | 8 | history: move | decisions.md | `Page extends Item` (core/Item/Item.js) directly: `page instanceof Ite |
| 43 | 7 | banner: keep as ONE line + doc pointer | jsonl.md | ════ EXTENSIONS, CODE-REGISTERED — Page.use(Ext) turns Ext.setup(page) |
| 53 | 4 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ Nothing is FETCHED here. A module page constructs ITSELF at import,  |
| 74 | 6 | explanation: move, keep 1 line | jsonl.md | A page's own preferences. Today there is exactly one: `nav` — "does th |
| 92 | 8 | history: move | decisions.md | (2026-10-03, the owner's data decision) `title`/`icon`/`description` l |
| 102 | 11 | explanation: move, keep 1 line | jsonl.md | `apply()` that calls methods instead of overwriting them — Item's `app |
| 126 | 5 | obsolete? check callers, then drop | decisions.md (history line) | ⚠ compat only, one release (2026-10-03 — the owner: "drop the special  |
| 136 | 4 | explanation: move, keep 1 line | jsonl.md | Made the first time a content DELTA arrives (a `{"content": {...}}` li |
| 145 | 5 | explanation: move, keep 1 line | jsonl.md | My sub-pages — the real storage `page.pages`. `of: null` keeps a plain |
| 152 | 5 | explanation: move, keep 1 line | jsonl.md | A Map-SHAPED VIEW over `pages`, so the ~215 existing `.children` calle |
| 159 | 9 | trap: keep 1 line, rest to doc | watch-out.md | A config `children: […]` arrives here through ordinary `Object.assign` |
| 180 | 11 | banner: keep as ONE line + doc pointer | jsonl.md | ════ EXTENSIONS — a page.jsonl line names one on: `{"ext": "Inbox"}` ═ |
| 198 | 10 | banner: keep as ONE line + doc pointer | jsonl.md | ════ STEP 1 — the file EXISTS ════════════════════════════════════════ |
| 226 | 4 | banner: keep as ONE line + doc pointer | jsonl.md | ════ STEP 2 — a child page is LINKED, automatically ══════════════════ |
| 248 | 18 | banner: keep as ONE line + doc pointer | jsonl.md | ════ TAB STATE — `{"tab": {"name": "x", "disabled": true, "nav": false |
| 292 | 6 | banner: keep as ONE line + doc pointer | jsonl.md | ════ THE SIX WORDS AS A DELTA (2026-10-09, the page tool) ════════════ |
| 314 | 7 | explanation: move, keep 1 line | jsonl.md | A LOG ON TOP OF A TEMPLATE. A page drawn by code (a template, like a s |
| 337 | 6 | trap: keep 1 line, rest to doc | watch-out.md | DRAW ME AGAIN, IN PLACE — no reload. The old element is swapped for a  |
| 368 | 20 | banner: keep as ONE line + doc pointer | jsonl.md | ════ NAV VISIBILITY — one rule, read in one place, for the rail, the t |
| 438 | 5 | trap: keep 1 line, rest to doc | watch-out.md | THE PAGE SHOWS ITS OWN FOLDER: page.jsonl and every file its lines nam |
| 520 | 5 | history: move | decisions.md | Every `data` key that isn't one of my own declared `fields` — the only |
| 542 | 13 | trap: keep 1 line, rest to doc | watch-out.md | THE LOADER. `url` is the folder, ending in `/`. Line 1 is the construc |
| 582 | 13 | history: move | decisions.md | A FOLDER'S OWN FILE LIST — what used to cost the whole site's director |
| 628 | 4 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ Folders INSIDE a dated task folder get no log (Server/plugins/PageFi |
| 656 | 6 | history: move | decisions.md | `put()`, not `this.title = …`: a construction-time DEFAULT is not a |
| 664 | 6 | history: move | decisions.md | A page's id is its folder name — `static new_id()` above deliberately |
| 674 | 17 | banner: keep as ONE line + doc pointer | words.md | ════ THE SIX PAGE WORDS ══════════════════════════════════════════════ |
| 698 | 9 | history: move | decisions.md | The classes those words stamp ON THE PAGE. ONE method, so `render()` a |
| 721 | 10 | trap: keep 1 line, rest to doc | watch-out.md | My sub-pages, in declaration order: undefined = not mine, null = decla |
| 777 | 5 | explanation: move, keep 1 line | words.md | Quietly — declaring a child is not a live edit. A stub already holding |
| 805 | 5 | banner: keep as ONE line + doc pointer | roles.md | ════ ROLES — the nearest ancestor that claims one ════════════════════ |
| 815 | 5 | trap: keep 1 line, rest to doc | watch-out.md | A `children()` FUNCTION is called here, ONCE — the first time anyone a |
| 825 | 7 | explanation: move, keep 1 line | roles.md | Memory, then route(), then a filesystem probe. One of the two places ` |
| 857 | 5 | explanation: move, keep 1 line | roles.md | My folder's own page.jsonl (listing() above), IF something already loa |
| 892 | 8 | history: move | decisions.md | This directory's own files, full screen, at my own `fs/` — ext/files/f |
| 940 | 5 | history: move | decisions.md | Draw the doc INSIDE me, over what I was showing, with a way back. A ca |
| 1008 | 11 | history: move | decisions.md | A .md file's page when nothing nearer claims it: its module's md/. The |
| 1031 | 4 | trap: keep 1 line, rest to doc | watch-out.md | Last resort, so a real page.js always wins: a `.md` file beside me IS  |
| 1052 | 6 | trap: keep 1 line, rest to doc | watch-out.md | A module that throws is NOT a module that isn't there — swallowing bot |
| 1070 | 6 | history: move | decisions.md | ⚠ THE SPA FALLBACK ANSWERS EVERY MISS WITH index.html AT 200, so `res. |
| 1082 | 25 | history: move | decisions.md | A `page.json` — an object, or the url of a directory holding one — AS  |
| 1122 | 5 | explanation: move, keep 1 line | api.md | WHAT A `page.json` BECOMES — the six page words plus the three labels, |
| 1170 | 10 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ THE FALLBACK for a page whose OWN `render()` replaced this class's — |
| 1189 | 4 | explanation: move, keep 1 line | api.md | Dev only: an unmarked `.page` is `display: none` by the arrangement co |
| 1206 | 5 | history: move | decisions.md | ⚠ Going UP the chain activates NOTHING — Router.activate() only touche |
| 1217 | 14 | history: move | decisions.md | An ancestor drawn by ext/Doc (its top-level well-and-tabs shell, or on |
| 1248 | 11 | history: move | decisions.md | ⚠ NOT a floating "Folder" link here any more. One existed briefly |
| 1260 | 10 | trap: keep 1 line, rest to doc | watch-out.md | A page that said one of the six words gets a FRAME: the chrome its |
| 1279 | 7 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ APPENDED, not woven into the callback above: the two branches above |
| 1287 | 4 | history: move | decisions.md | "$N.NN of AI work · M tasks" — computed by Server/page-ai-cost.mjs ont |
| 1304 | 11 | history: move | decisions.md | WHAT IS IN THE BOX: a function, a string of text, or — a string starti |
| 1322 | 13 | banner: keep as ONE line + doc pointer | content.md | ════ A CONTENT LIVELIST, DRAWN — the one reusable view (deliverable 6, |
| 1350 | 9 | history: move | decisions.md | A REFERENCE ROW (the owner, 2026-10-03): `{"ref": "/framework/core/Pag |
| 1361 | 4 | history: move | decisions.md | The text under the title, as markdown. ext/markdown is dynamically imp |
| 1373 | 9 | history: move | decisions.md | A ref row is the inline "#Page" chip UPGRADED to a full-width card (th |
| 1385 | 6 | explanation: move, keep 1 line | content.md | `build_row` deliberately builds its chip with `View.captor` nulled (it |
| 1406 | 5 | history: move | decisions.md | ⚠ A BLOCK BODY, not `() => list.forEach(draw_row)` — `forEach()` retur |
| 1425 | 11 | history: move | decisions.md | A PAGE OR A FILE, AT AN ADDRESS, DRAWN IN THIS PAGE'S BOX. `content: " |
| 1478 | 4 | explanation: move, keep 1 line | property/related.md | Is there already a heading with this word ON MY OWN VIEW? Unlike ext/t |
| 1487 | 16 | history: move | decisions.md | The aside itself: a small "Related" heading (skipped if the page alrea |
| 1526 | 25 | banner: keep as ONE line + doc pointer | columns.md | ════ COLUMNS — the Finder shape ══════════════════════════════════════ |
| 1553 | 4 | explanation: move, keep 1 line | columns.md | The narrowest a DRAG may leave a column: past this the head's title an |
| 1559 | 5 | history: move | decisions.md | Asked at RENDER time, never walked — so a child that only loads when y |
| 1570 | 11 | trap: keep 1 line, rest to doc | watch-out.md | My column, then the region MY children mount in — so the DOM stays an  |
| 1584 | 6 | history: move | decisions.md | ⚠ A page is BUILT when it activates, so a child marked `default` would |
| 1611 | 10 | history: move | decisions.md | The child that opens when nothing deeper is routed — a column browser  |
| 1632 | 8 | history: move | decisions.md | ⚠ `render_content()`, NOT the two-branch version written out by hand.  |
| 1645 | 6 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ `index: true` — my content ALREADY shows my children, as a `previews |
| 1661 | 6 | explanation: move, keep 1 line | columns.md | A COLUMN IS ALREADY A RAIL, so `related:` here is a short list at |
| 1671 | 8 | trap: keep 1 line, rest to doc | watch-out.md | ── the seam — drag it and this column keeps the width you left it at ─ |
| 1698 | 7 | trap: keep 1 line, rest to doc | watch-out.md | The width a drag leaves behind, written as the SAME three tokens the w |
| 1716 | 20 | trap: keep 1 line, rest to doc | watch-out.md | ── `even` — N columns, all the same width, N computed from the ROOM ── |
| 1761 | 8 | history: move | decisions.md | The room changed, or a column opened. Size the columns FIRST and scrol |
| 1771 | 11 | trap: keep 1 line, rest to doc | watch-out.md | Should a navigation inside this row slide, or jump? Measured headless, |
| 1793 | 4 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ The row has no box yet on a cold load, and no frame you can count wi |
| 1799 | 4 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ One frame, for every navigation after that: Router.mark() marks what |
| 1806 | 4 | trap: keep 1 line, rest to doc | watch-out.md | The deepest column on screen, brought in by the smallest move — the co |
| 1833 | 7 | explanation: move, keep 1 line | previews.md | A card per child, drawn BY the child. A declared-but-unresolved one ha |
| 1852 | 15 | trap: keep 1 line, rest to doc | watch-out.md | One rung per child: its name as a link, then ITS children as cards. An |
| 1897 | 7 | trap: keep 1 line, rest to doc | watch-out.md | ⚠ The thumb is INERT (Page.css): the label below it is a link, so a li |
| 1912 | 8 | explanation: move, keep 1 line | previews.md | THE THUMB, plus the one measurement Page.css can't make on its own: wh |
| 1938 | 6 | explanation: move, keep 1 line | previews.md | How deep my declared subtree is FETCHED, and the one number that decid |
| 1947 | 9 | trap: keep 1 line, rest to doc | watch-out.md | My children fetched, and theirs, until the budget runs out. `levels` i |
| 1960 | 5 | history: move | decisions.md | ⚠ THE GUARD ABOVE IS WHY THE WAIT BELONGS HERE, IN CORE. A page whose  |
| 1973 | 12 | banner: keep as ONE line + doc pointer | method/prefs.md | ════ PREFERENCES — the page's own url IS the id ══════════════════════ |
| 1991 | 6 | trap: keep 1 line, rest to doc | watch-out.md | The box the six page words open, in its own file because this one is l |
| 1999 | 4 | history: move | decisions.md | Registered (2026-10-03) so `define_fields()` actually runs and builds  |
| 2005 | 5 | history: move | decisions.md | THE SHIM — a Map-shaped VIEW over `page.pages` (the real List storage) |
| 2040 | 4 | history: move | decisions.md | List.insert() refuses an id that equals a property of the list's owner |
| 2072 | 4 | explanation: move, keep 1 line | method/prefs.md | `Item.Store`, specialised for a page.jsonl file — one per URL (`Reader |
| 2118 | 6 | history: move | decisions.md | A `tab` or `file` line describes MY OWN children's state, so I redraw  |
| 2142 | 7 | history: move | decisions.md | WHAT `listing()` ANSWERS — the entries directly inside one folder, rep |
| 2180 | 6 | history: move | decisions.md | `track()` installs `Page.track(instance)` / `Page.instances()` — opt-i |
| 2188 | 4 | explanation: move, keep 1 line | method/prefs.md | Where a save goes when localStorage will not take it — private mode, a |
| 2212 | 7 | history: move | decisions.md | The whole idea, in one line. `id` is the seam for a caller that is not |
| 2221 | 6 | explanation: move, keep 1 line | method/prefs.md | THE GUARDED PAIR (plus `clear_raw`) — one JSON-able value under one |
