verdict: fix
1. [fix] The new folders `ai/cards/` and `ai/rail/` have no `readme.md` and no `page.js`, yet `ai/readme.md` now links to them as `[cards/](cards/)` and `[rail/](rail/)`. Those links reach no real page, which breaks "Everything is linked" and "every module has a readme.md" (Requirement 4). Evidence: `ls public/framework/ai/cards public/framework/ai/rail` shows only code and `files.jsonl`.
2. [note] The class files kept their lowercase names (`cards/card.js`, `rail/rail.js` …). The brief asked for "class folders … one class per file named for the class". STATE.md records this as deferred because of the number of callers. That is reasonable, but it is still open work: it should go on the card as a follow-up, not only into STATE.md.
3. [note] `ai/readme.md`, under "Start here", still says "[AI 2](/framework/ai2/): the dashboard". The `ai2/page.js` route alias still titles itself "AI 2", with its own tabs. The old address keeps working as asked, but it still reads as a second dashboard, which is the "zombie" the owner wanted gone. Retitle the alias page, or point it at `/framework/ai/`.
4. [note] Some code comments still name the old paths `ai2/rail.css`, `ai2/doc/*.md` and `ai2/processes.css` (`ux/Card/Card.css:12,1513`, `ux/Inbox/Inbox.css:7-8`, `ai/v/3/v3.css:259`, `ext/drawer/rail.js:269`, `ai/cards/card.js:872`, `ai2/ai2.css:10`). They break nothing, but they send readers to files that have moved.
5. [note] `/framework/core/Page/overview/folders/` shows "Page Load Error" (a 404) at all four widths. This change did not cause it: the diff only edits a comment there, and `core/Page/overview/` has no `page.js`, so the page was already unreachable before this work.

Widths given: 400, 1200, 1920 and 3440 for each of 7 pages (ai, ai/dashboard, ai2, ux/Card, ux/Dictate/surfaces, core/Page/make, core/Page/overview/folders). This change moves files and adds no new layout, so the layout answers below judge whether anything changed or broke, not the existing design.

## Requirements
- 1 "Inventory (a script, not prose)" — yes — `inventory.mjs` + `inventory.md`/`inventory.json`: 63 files, 28 live, 5 with no importers, 91 outside files naming ai2
- 2 "move the live ai2 files into ai/ under the right class folders" — partly — files moved to `ai/cards/` and `ai/rail/`, but the class-file names were deferred (finding 2)
- 2 "one-line re-export shims at every old ai2 path" — yes — e.g. `ai2/card.js` is `export *` plus `export { default }` from `../ai/cards/card.js`; 23 shims are in `manifest.json`
- 2 "keep /framework/ai2/... URLs resolving" — yes — `ai2/page.js` is kept as the route; `shots/…-ai2/*.png` render the inbox
- 2 "Dead files are moved to ai/archive/ai2/ with a manifest, never deleted" — yes — the old page logs are in `ai/archive/ai2/` with a readme; every "deleted" entry in the diff has a matching new path in `manifest.json`
- 3 "ONE script, dry-run first … git mv … manifest, reversible" — yes — `migrate.mjs` + `manifest.json` (moves, shims, rewritten)
- 3 "pages still load at the four widths … zero same-origin 404s" — yes, for the AI pages — ai, ai/dashboard, ai2 and ux/Card render at all four widths; STATE.md reports only the generated `usage.json`/`tasks.json` missing in a fresh worktree
- 4 "Update the readmes … add the new class names to ai/readme.md's index" — partly — the index line lists `AIRail`, `Card`, `CardList` and `Groups`, but the folders it links have no readme (finding 1) and "Start here" is stale (finding 3)
- 5 "Do NOT touch the session folders, ai/sessions/, core/Page semantics" — yes — the diff touches only comments and links in `core/Page/make` and `overview/folders`; there are no `sessions/` paths
- "not leave a zombie" — partly — the alias page still presents itself as "AI 2" (finding 3)

## Page structure
- page 1 (title says what it is) — yes — shots/…-ai/1920.png: "AI" with tabs Inbox · Dashboard · Log · System · Sessions · Tests
- page (level 1 shown, detail nested) — yes — unchanged by this diff; the Inbox rail and the detail look the same as before
- page (one URL per view) — yes — the ai2 tabs and card ids are still routed

## Navigation
- navigation 1 — tabs, a rail (the inbox list), a sidebar (the site tree)
- tabs fit on one row — yes — layout.json `tab_rows 1` at 400 for ai, ai/dashboard and ai2
- rail selection is the URL — yes — `ai2/page.js` `route()` is unchanged; it now imports `ai/rail/rail.js`

## Layout
- layout holds at every width — yes — shots/…-ai/sheet.png and …-dashboard/sheet.png have the same layout as the alias page; `overflow_x false` at 400
- the reader sees what matters first — yes — "Running now" and "Worktree pool" sit at the top of the ai page

## Sizing
- content uses the screen at wide widths — no (existing, not from this change) — layout.json `empty` is 0.67 at 3440 on ai and 0.68 on dashboard; the 3440 shots show a lot of unused right side; this is a note for the page owner, not for this merge
- nothing overflows horizontally — yes — `overflow_x false` on every page at 400

## Wrapping
- no unwanted wraps — yes — the only wraps listed are the drawer's "✦AI" rail button (`lines 3.2`), which is a vertical rail by design

## Spacing and padding
- left stack padding consistent — yes — h1 14 px (`doc-well`) on ai and dashboard, the same as on the ai2 alias
- no big empty bands — yes — `big_empty false` in every band on the AI pages

## Colour and contrast
- contrast unchanged and readable — yes — shots/…-dashboard/1920.png: the same tokens, orange accents and grey meta text as before; no CSS rules changed (the CSS files were only moved)

## Flow
- most important first, the reader's eye moves top-down — yes — ai: Live → Running now → Processes → By task; dashboard: Stalled → In flight → Inbox → Log → Sessions

## Words
- content (plain sentences, a newcomer can follow) — yes — the `ai2/readme.md` rewrite says in four short lines what moved, what stays and why, with links
- names used the same way every time — no — "AI 2" is still used as a live name on the alias page and in `ai/readme.md` "Start here", while the index now says it was merged (finding 3)
- every mention is a link — yes — the readme links the manifest, the inventory, `ai/cards`, `ai/rail` and the archive (but see finding 1: two of those links have no page behind them)
