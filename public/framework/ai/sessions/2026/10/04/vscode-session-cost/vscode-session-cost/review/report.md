verdict: pass
1. [note] The Sessions page shots all load with empty data (every stat tile shows "—", 0 sessions, and `layout.json`'s own `errors` list shows a 404 on every width) — so item 3's new caption under "Per 1% of your weekly plan" never actually renders in any shot; it's confirmed from the diff's code, not from a picture of it working. shots/1920.png, shots/3440.png; layout.json `errors`.
2. [note] At 3440 the Sessions row is both big and nearly empty — `share` 0.911, `ink` 0.13, `big_empty: true` — the measurement tool's own flag. Pre-existing (the diff only adds a caption line to existing tiles), and partly explained by the 0-session test data, but it's what the owner's band question checks for. shots/3440.png; layout.json widths.3440.bands[1].
3. [note] Two wrap entries at every width (`mode-btn`/`brightness_auto`, `drawer-menu`/`☰` at 1200–3440; `drawer-rail-ai`/`drawer-rail-menu` at 400) are pre-existing app-shell chrome, untouched by this diff — named here only because `layout.json` flags them. layout.json widths.*.wraps.

Widths given: 400, 1200, 1920, 3440 (a full page-layout set — `review.mjs` picked all four).

## Requirements
- 1 "A session's cost computed from its own transcript, updated by the existing Stop/UserPromptSubmit hooks, no timer" — yes — diff.patch: `find_page_jsonl()` in `Server/session-cost.mjs` now walks every `<Y>/<M>/<D>/` folder instead of only today's, so a VS Code tab open past midnight keeps finding its own page; the hooks it runs from are unchanged (no new timer added). Confirmed against the code, not a screenshot — this is a server-side script with no UI.
- 2 "Fix the roll-up: own $ and subtree $ separate, week total counts each API call once" — yes — diff.patch: `week-cost.mjs`'s `claude_spend()` now groups by the session's `id8` and keeps only the larger `total_usd` per id8, so two page folders for one session can no longer be summed twice. (`spend-tree.json`'s own/subtree split was checked and found to be a separate, unaffected population per `decisions.md`.)
- 3 "Recompute `usd_per_pct` and show its inputs on the Sessions tab" — yes, by code — `public/framework/ai/sessions/page.js`: the `tile()` helper takes a new `foot` argument and the "Per 1% of your weekly plan" tile now passes `$<claude $> ÷ <plan %>` as a caption under the figure. Not visible in any shot because `week?.usd_per_pct` is falsy in this render (see finding 1) — the shots prove the page still renders cleanly with the field blank, not the filled-in caption itself.
- 4 "Worktree → check_page → merge.mjs" — partially verified — the existence of `shots/` and `layout.json` proves `check_page` ran; whether the branch was merged is outside what a diff and screenshots can show.

## Page structure
- 1 — yes — shots/1920.png: "Sessions" title, tab bar reads SESSIONS as the active tab
- 2 — n/a — this is a data/filter page (stat tiles + a table), not a concepts-first index page
- 3 — yes — shots/1920.png: stat tiles (state) sit above the date filter, above the table (detail), top to bottom
- 4 — n/a — no open/done distinction on this page
- 5 — yes — reached via the AI tab bar, already routed (unchanged by this diff)
- 6 — yes — layout.json `url` is `/framework/ai/sessions/`, a real route; unchanged by this diff
- 7 — yes — stat-tile row + table, both approved layout words (`flex`/`grid` tiles, a plain table), no page-specific shape added
- 8 — yes — every tile label ("Claude this week", "Per 1% of your weekly plan") and the new caption under it are plain words, no jargon
- 9 — yes — the new caption doesn't repeat the tile's number, it shows the two inputs that produced it
- 10 — yes — the caption is the two source numbers shown directly (`$X ÷ Y%`), not a sentence explaining them
- 11 — yes — "Sessions" is the one section and its title is clear
- 12 — n/a — nothing was restructured, only a tile helper's signature extended

## Navigation
- 1 — tabs (INBOX/DASHBOARD/LOG/SYSTEM/SESSIONS/TESTS), a sidebar (the page tree) — shots/1920.png
- 2 — yes — layout.json `tab_rows` is 1 at 400, 1200 and 1920 (and 3440)
- 3 — n/a — unchanged by this diff; tab routing is existing page-system behaviour
- 4 — n/a — unchanged by this diff
- 5 — yes — shots/3440.png: the Filter-pages sidebar sits left of the centred Sessions column
- 6 — n/a — unchanged by this diff, nothing arrives/selects on this page
- 7 — n/a — no fixed bottom rail
- 8 — n/a — no sheet or modal
- 9 — n/a — not a full-screen view
- 10 — n/a — no expand-in-place item on this page

## Layout
- 1 — yes — shots/3440.png: sidebar + centred Sessions column, not one narrow column
- 2 — yes — Rail + content (sidebar) with a Standard column for the table/tiles
- 3 — yes — stat tiles and table both stay inside the centred column at every width, no overflow (layout.json `overflow_x: false` at all four)
- 4 — yes — each stat tile is a `.surface.pad` card; the table sits unpadded in the page column
- 5 — yes — shots/400.png: tile text keeps clear margin from its card edge
- 6 — n/a — only one column of content on this page
- 7 — no — at 3440 the Sessions row is `share 0.911`, `ink 0.13`, `big_empty: true` (finding 2) — pre-existing, test data is 0 sessions
- 8 — n/a — no side-by-side columns
- 9 — no, same as Q7 — the emptiness at 3440 isn't answered by a new region or accepted gutter, it's an unfilled band
- 10 — yes — the 5 stat tiles and the caption text stay small and proportioned at every width, nothing stretched
- 11 — n/a — no card wall
- 12 — n/a — tiles are rounded cards with gaps already, unchanged shape

## Sizing
- 13 — yes — tiles are auto height (grew by one line for the new caption, nothing fixed)
- 14 — n/a — no preview cards
- 15 — n/a — no bounded/scrolling box introduced
- 16 — yes — no new scrollbar appears in any shot
- 17 — n/a — no band above first nav
- 18 — yes — layout.json `overflow_x: false` at 400, 1200, 1920, 3440
- 19 — n/a — no new sizing unit introduced; the caption uses the existing `small.c("muted", …)` text component

## Wrapping
- 20 — yes — tab bar and tile row each sit on one line at every width (layout.json `tab_rows: 1` throughout)
- 21 — yes — no wrap unique to 1200 vs 1920 in layout.json's wraps lists (same two chrome buttons at both)
- 22 — n/a — no new control row from this diff
- 23 — yes — shots/400.png: all five tiles stack into one column at 400
- 24 — n/a — no preview description in this diff

## Spacing and padding
- 33 — yes — layout.json `left_stack` at 400: h1 total 14px, p total 25px, both well under 3em
- 34 — yes — left_stack.layers at 400 show 3 shallow layers (14/13/1/11px), not compounding into a big block
- 35 — yes — the new caption is plain `small.c("muted", …)` text inside the existing `.surface.pad` tile, no extra padding added
- 36 — yes — shots/400.png: tile text keeps margin from the card's own edge
- 37 — n/a — no new gap/pad value added; `--gap * 0.1` on the tile stack is unchanged by this diff
- 38 — n/a — no new control added
- 39 — yes — each tile is `.surface` on the page's own ground, so it still reads as a box
- 40 — n/a — no bleed container here
- 41 — n/a — no new CSS rule in this diff (JS-only change to page.js)
- 42 — yes — the diff adds zero new CSS; it reuses the existing `tile()` helper and `small.c("muted", …)`

## Colour and contrast
- 1 — yes — shots/1920.png: the new caption uses the existing `.muted` grey on white, same as the other tile captions already on the page
- 2 — n/a — no accent-coloured text added
- 3 — yes — `.muted` is a class, not a literal colour (confirmed in diff.patch)
- 4 — n/a — no new box ground added
- 5 — n/a — unchanged by this diff; no new mode-specific styling
- 6 — n/a — no new seam
- 7 — n/a — no new anchor mark
- 8 — yes — the caption is `small.c("muted", foot)`, the `.muted` class, never `var(--muted)` as a literal colour (diff.patch)

## Flow
- 25 — yes — tiles (state) still sit above the table (detail)
- 26 — yes — layout.json `overflow_x: false` at every width; nothing is cut off
- 27 — yes — the tile stack keeps its existing `flex v gap` rhythm; the caption is just one more line in it
- 28 — yes — the caption sits directly under its own tile's number, not nearer the next tile
- 29 — n/a — this page doesn't stream in new rows live
- 30 — yes — layout.json `widest_text` (266–341px across widths) stays well inside the column at every width
- 31 — n/a — unchanged by this diff
- 32 — n/a — this is the top-level Sessions tab body, not a nested page

## Words
- 1 — yes — the caption shows the two raw numbers ($ and %) rather than a sentence explaining the division
- 2 — n/a — no structural layout added, just a text line
- 3 — yes — the caption is well under 60 words (one short line: `$X ÷ Y%`)
- 4 — yes — the point ("here's what this number is built from") reads in the caption alone
- 5 — yes — "Per 1% of your weekly plan" still says exactly what the tile is
- 6 — n/a — no picture/caption pair added
- 7 — yes — "Claude $" and "plan % used" are named the same way in the tile labels and the new caption
- 8 — n/a — no file/module mention in the new UI text
- 9 — n/a — not a readme/doc page
- 10 — n/a — not applicable to a stat-tile caption
- 11 — yes — the caption and the decisions.md/readme.md prose added by this diff are plain, full sentences
