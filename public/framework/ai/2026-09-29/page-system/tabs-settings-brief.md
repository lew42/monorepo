# Minion brief: tabs that manage themselves, and per-page settings

Load the `minion` skill first, then `code`, `page`, `css`, `content`. Task dir (the whole conversation, the owner's raw words): `public/framework/ai/2026-09-29/page-system/`. Read `loading-study.md` sections 3 and 4 there (with the verbatim owner quote at its top) before anything else. Re-check every file:line it gives.

The owner: "it might be better to just add tabs to the page.jsonl … the presence of a new tab might be sufficient … then we don't need the kind of explicit call to the tabs. The tabs could basically manage themselves … the tab itself could maybe save its state, like whether it's active or disabled … maybe there's like an appears in navigation flag … I think we need a page settings system that we don't have yet … maybe it's in the right sidebar."

**Never destroy a viable version:** the existing `this.tabs()` and `Doc.bar()` paths keep working unchanged for every page that doesn't use the new lines.

## Decisions (made; don't reopen)
- A page.jsonl line `{"tab": {"name": "x", "label": "X", "disabled": true, "nav": false, "order": 3}}` records one tab's state. A child that exists (a declared child, or a `{"file": "x/page.jsonl"}` line) is already a tab on a Doc page; a `tab` line only adds state to it, or declares one. Read by a new setter `tab(obj)` in `core/Page/Log.js`, kept in a Map on the page.
- `Doc.bar()` (`ext/Doc/Doc.js`) and `tabs()` (`ext/tabs/tabs.js`) skip a tab with `nav: false`, draw a `disabled` one greyed and unclickable, and use `order` when given.
- Per-page settings: a `{"settings": {"nav": false}}` line, read by a `settings(obj)` setter that merges into `this.settings`. The first and only setting is `nav` ("appears in navigation"). If absent, `nav` follows weight: a page whose weight is below 1 (see `core/Page/weight/weight.js`) is out of nav. The parent's nav/tabs respect it.
- The right drawer's Settings tab (`ext/drawer/tabs/settings.js`) gets a "This page" section: the current page's url and an "Appears in navigation" checkbox. A change appends a `settings` line to that page's page.jsonl through an existing server write route (find the one the Make/page tools use; do not add a new npm dep). For a page.js folder, write to `settings.jsonl` beside it instead (the same rule as weight.jsonl) and read it the way weight.jsonl is read.
- A demo: `core/Page/settings/` as a page.jsonl page (a child of core/Page, a top tab "Settings"), showing a parent with three child tabs driven only by `tab` lines: one normal, one `disabled`, one `nav: false`. Its readme says what the two line kinds are, with the JSON shown.

## Fence
`core/Page/Log.js`, `ext/Doc/Doc.js` (bar only), `ext/tabs/tabs.js`, `ext/drawer/tabs/settings.js`, new `core/Page/settings/**`, `core/Page/page.js` (the one children/bar line), and `core/Page/jsonl/doc/format.md` (add the two line kinds). Nothing else; ask me for more.

## Proof
- `/framework/core/Page/settings/` at 1920: three tabs as specified, reached by clicking the top tab. Shot `shots/settings-1920.png` in the task dir.
- Open the drawer's Settings tab on that page, untick "Appears in navigation" on one demo child, reload: it's gone from the bar and a line was appended. Shot `shots/settings-drawer.png`. Then tick it back.
- `/framework/core/Page/`, `/framework/ext/Doc/`, `/framework/ext/tabs/` and three other Doc pages load with zero console errors and their tabs unchanged (before/after shot of one).
- Commit by exact path only, in the worktree. Every process you spawn sets `windowsHide: true`. Budget about $5. Reply with hashes and one line per decision with its proof, then stop.
