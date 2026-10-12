# Fix round 2: answers to review-2.md

Load the `minion` skill first, then `code`, `css`, `page`, `content`. Task dir (the whole conversation, owner's words in owner-words.md): `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\`. Read `review-2.md` there in full: each finding names the file:line, what's wrong and the fix. Worktree `C:\Code\lew42\worktrees\page-system-929` (server http://127.0.0.1:51061/). Two minions work in this worktree at once, on the two parts below. Commit only your own part's files, by exact path; never commit server-appended page.jsonl lines, `public/framework/ai/**`, `board.jsonl`, `flags.jsonl`. Every process you spawn sets `windowsHide: true`.

## Part X: settings and tabs (minion-page-fix-tabs)
Fence: `core/Page/Log.js`, `ext/Doc/Doc.js` + its stylesheet, `ext/tabs/tabs.js`, `ext/drawer/tabs/settings.js`, `core/Sidebar/Sidebar.js`, `core/Page/settings/**`, `core/Page/weight/weight.js` (read side only), `core/Page/jsonl/doc/format.md`.
- **Finding 3:** one rule for "appears in navigation", read in one place. `tab_visible()` and `page_settings()` use the same function, and it reads settings.jsonl for a page.js page. Decision: weight < 1 counts as out of nav in BOTH, unless a `settings.nav` line says otherwise (an explicit line wins). Proof: untick on /framework/ux/Dictate/, reload, and Dictate is gone from the rail and from UX's tabs. Tick it back and make sure no test line is left behind.
- **Finding 4:** no blind probes. Opening the drawer's Settings tab on /framework/ux/Dictate/ logs zero 404s. Know which files exist before fetching (the parent's `file` lines, `jsonl_url`, or one server index route that already exists). No new server route unless nothing exists; if you add one, tell me.
- **Finding 5:** when `Reader.changed()` sees a `tab`, `file` or `settings` line, redraw the tab strip (`bar()`/`tabs()`) and the rail entry. Drop the drawer's `location.reload()`. Proof: append a `tab` line by hand while the page is open, and the strip changes without a reload (shot before and after).
- **Finding 6:** `{"tab":{"name":"x","active":true}}` makes x the default tab, in `tabs()` and in `Doc.bar()`.
- **Finding 10:** remove the leftover `settings` lines from `settings/normal/page.jsonl`. /framework/core/Page/settings/ shows its own `tab` lines, and the drawer switch as a picture or a short line, above the tabs.
- **API tab:** at 1920 on /framework/core/Page/, the API tab is hidden under the ☰ drawer button at top right. The bar must stop short of that button. Proof: shot at 1920 and 1280 with every tab visible.
Shots: `shots/fix2-*.png`. Budget $4.

## Part Y: loading doc and page work (minion-page-fix-work)
Fence: `core/Page/page.js` (`notes:` and the Overview content only), `core/Page/readme.md`, `core/Page/doc/loading.md`, `core/Page/ai/**`, `ux/Dictate/page.js`, `.claude/skills/new-page/SKILL.md` (one line), `Servex/pages.js` (only if the template lives there, and tell me).
- **Finding 1:** `loading` goes first in `notes:` (core/Page/page.js:60). /framework/core/Page/doc/loading/ keeps the core/Page tab strip, is listed in the Docs rail, and logs zero 404s.
- **Finding 2:** on the core/Page Overview, near the top, show the seven loading steps as a strip of small linked tiles (step name + one word), each linking to its step in doc/loading. Show, don't tell. Keep the Overview's existing content below it.
- **Finding 7:** `page_work()` walks `page.parent` up to the root. Each ancestor supplies its own match (a `work_match` property on the page, or its url path by default). Delete the hand-typed `ancestors:` on Dictate.
- **Finding 8:** one line on /framework/core/Page/ai/ under "Its own work": "Doc pages opt in with one line", linked to doc/work. Also one line in the new-page skill saying new pages place `page_work(page)` by default. Put it in `create_page`'s stub too, if the stub has a content section.
- **Finding 9:** remove cards with duplicate titles from the list (keep the newest), and match `whisper` only together with `dictat` or `mic`.
Proof: /framework/core/Page/, /framework/core/Page/doc/loading/ (reached by clicking Docs, then loading), /framework/ux/Dictate/ and /framework/core/Page/ai/ at 1920, each with zero console errors. Shots: `shots/fix2-*.png`. Budget $3.

Reply with the hash(es) and one line per finding with its proof, then stop.
