verdict: fix
1. [fix] The Page generator regressed: a third column entry reads "[object Map]" and the Journal pane never leaves its loading skeleton, at all four widths (requirement 2, "keep every existing page working"). Evidence: shots/…-core-Page-generator/400.png, the left column under "Atlas"; layout.json widest_text_sample "[object Map]" at 400. The likely cause is the `children` shim: `grow()` assigns `this.children = new Map()`, and some path still reads or renders that value as a child entry.
2. [fix] When a page.jsonl page is reloaded, its own `content` changes are dropped (requirement 3, "each live change appends ONE line to the nearest page.jsonl"). Store.js `line_for` writes `{"at":"content","add":…}`. On replay, `Item.locate("content")` needs `page.content` to already be a LiveList, but `Page.jsonl()` sets `page.content ??= page.log_view`, and `ensure_content()` only runs for a `{"content":…}` key, never for `at:"content"`. Locate warns and the line is ignored. The demo avoids this because it attaches its Store to the LiveList itself, in a separate demo.jsonl.
3. [note] The demo saves to its own `demo.jsonl`, not to the page's page.jsonl that the brief names (requirement 5). That is a reasonable choice, but nothing records it as one, and the path the brief asked for has the gap in finding 2.
4. [note] Nothing proves the second tab updates through tail (requirement 5). The shots show only the first load. Also, the demo's "last lines" panel skips every replayed line (`file_store.replaying`), so a second tab's panel won't show a line that arrives from the first tab, even though the rows will move.
5. [note] `PageLog.Reader.attach` no longer resets `this._seen = null` after the first read. The first `changed()` call after load therefore sees every key from the initial lines and redraws the nav one extra time.
6. [note] At 1920 and 3440 the live demo's rows column is about 180px wide, with 82–85% of the screen empty (layout.json empty 0.818 / 0.85). The list could take more of the `wide` track.

Widths given: 400, 1200, 1920, 3440 for all 22 pages.

## Requirements
- 1 "One `set(delta)` on Item … a replay flag" — yes — Item.js `apply`/`set_one` follow the three rules; Store.js `read()` sets `replaying`, and `attach` skips the delta listener while it is true
- 2 "Page extends Item … keep every existing page working" — no — Page extends PageLog extends Item, and `children` is a Map-shaped view over `pages`, but core/Page/generator shows "[object Map]" and a stuck pane (finding 1)
- 3 "Persistence in Item, as a part: static Store … one line to the nearest page.jsonl" — no — `Item.Store` exists and the old saver path still works, but `at:"content"` lines don't replay on a page.jsonl page (finding 2)
- 4 "add (with after), remove, move, order … ids, not indexes … batched into one Append call" — yes — LiveList.js has all four verbs, by id; Store `append` queues and flushes once per microtask
- 5 "A demo page … add, drag, sort, reload … a second tab updating via tail" — partly — /framework/core/Item/live/ exists and shows add, sort, reverse, reset and rows; the second tab is unproven (finding 4)
- 6 "Update the `## Architecture` blocks in the List, Item and Page readmes" — yes — all three are rewritten in the diff

## Page structure
- page 1 — yes — shots/…-Item-live/1920.png: "Live list" plus a lede that says to drag, add or sort, then reload
- page 2 — n/a
- page 3 — yes — controls and list first, file tail second
- page 4 — n/a
- page 5 — yes — the rail shows Item › Live list (sheet.png)
- page 6 — yes — the Live list tab has its own URL, /framework/core/Item/live/
- page 7 — yes — `.wide` plus flex utilities, a small amount of page CSS
- page 8 — yes — Add, Sort A→Z, Reverse, Reset are self-evident
- page 9 — yes
- page 10 — yes — the list is shown live, not described
- page 11 — yes — "demo.jsonl — last lines" titles the side panel
- page 12 — n/a

## Navigation
- nav 1 — tabs, a sidebar (the rail), a bottom rail at 400
- nav 2 — yes — layout.json tab_rows: 2 at 400 and 1 at 1200/1920/3440 for Item and Item-live
- nav 3 — yes — each tab is a routed child page
- nav 4 — yes — five tabs
- nav 5 — yes — sheet.png: the rail sits beside main at 3440 and folds into a menu at 400
- nav 6 — yes
- nav 7 — yes — 400.png: the bottom rail clears the last row
- nav 8 — n/a
- nav 9 — n/a
- nav 10 — n/a

## Layout
- layout 1 — no — 3440: rows and tail fill about half of main, and the rest is empty (finding 6)
- layout 2 — yes — Docs / Rail + content
- layout 3 — partly — the rows column is narrow at 1920+ (finding 6)
- layout 4 — yes
- layout 5 — yes
- layout 6 — yes — the two columns sit in `.wide`
- layout 7 — yes — layout.json bands carry no big_empty flag for Item-live
- layout 8 — yes — at 1920 the rows column and tail panel are about equal height
- layout 9 — yes
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes — the rows are separate rounded strips with a gap

## Sizing
- sizing 13 — yes
- sizing 14 — n/a
- sizing 15 — yes — tail lines truncate with an ellipsis
- sizing 16 — yes — no surprise scrollers in the shots
- sizing 17 — n/a
- sizing 18 — yes — overflow_x false at every width on all 22 pages
- sizing 19 — not measured

## Wrapping
- wrap 20 — yes — wraps are only `mode-btn` and `drawer-menu` (the site chrome, the same on every page)
- wrap 21 — yes
- wrap 22 — yes — at 400 the four buttons wrap two and two, by design (400.png)
- wrap 23 — yes — 400.png: the tail stacks under the rows
- wrap 24 — n/a

## Spacing and padding
- spacing 33 — yes — left_stack h1 28px and p 28px at 400
- spacing 34 — yes
- spacing 35 — yes
- spacing 36 — yes
- spacing 37 — not measured
- spacing 38 — yes — buttons are the standard control
- spacing 39 — yes — the tail and rows paint their own ground
- spacing 40 — n/a
- spacing 41 — not measured (Page.css is in the diff; no unlayered rule seen)
- spacing 42 — yes

## Colour and contrast
- colour 1 — yes — the tail now uses the site's `pre` ink on code-bg, which reads in 1920.png
- colour 2 — n/a
- colour 3 — yes
- colour 4 — yes — rows and tail differ from the page ground
- colour 5 — not measured (no dark shot)
- colour 6 — yes
- colour 7 — n/a
- colour 8 — yes — `.muted` class

## Flow
- flow 25 — yes
- flow 26 — yes
- flow 27 — yes — `flex v gap` columns
- flow 28 — yes
- flow 29 — n/a (rows redraw in place)
- flow 30 — yes — widest_text 711 at 3440, prose stays in its measure
- flow 31 — n/a
- flow 32 — yes

## Words
- words 1 — yes — the live list itself plus the raw file lines beside it
- words 2 — yes
- words 3 — yes — the lede is two sentences
- words 4 — yes
- words 5 — yes
- words 6 — n/a
- words 7 — yes — LiveList, Item.Store and `page.pages` are named consistently across the three readmes
- words 8 — yes — the readmes link /framework/core/Item/live/
- words 9 — yes — the Item, List and Page readmes each have a live page
- words 10 — yes
- words 11 — yes
