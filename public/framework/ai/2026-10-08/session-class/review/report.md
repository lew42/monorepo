verdict: fix
1. [fix] At 400 a row's meta line runs past the right edge and is cut off: "claude-s…" and the State cell are lost on the monorepo row, and the prompt preview stops mid-word with no ellipsis (layout 26, wrapping 23) — shots/…sessions/400.png, rows band (y≈840–870). layout.json reports overflow_x false, so the box clips rather than scrolls; the meta line should wrap (it is a control-style row) or drop the model to its own line.
2. [note] The headers are now all sort toggles, but nothing shows it until one is clicked: plain text, no arrow or hover cue at rest (page 8) — shots/…/1200.png, header row. A faint ↕ on hover, or the default-order arrow on Cost, would make it self-evident.
3. [note] `State` sorts "biggest first", so the first click puts idle sessions (1) above working ones (0) — the reverse of what a reader wants first (page.js `SORT_VALUE.state` + `natural_dir`). Make `state` start ascending.
4. [note] `Session.read_text` in node now calls `Session.locate`, so a READ can rename a flat folder into its day folder, and an unknown id gets today's day cached. A read with a move side effect is surprising; doc/layout.md mentions it only for writers.
5. [note] The diff deletes ~140 tracked `sessions/<id>/files.jsonl` listings and `session-place.mjs` `rmSync`s them. They are server-generated and now gitignored, so nothing is lost, but "Never destructive" asks that the landing report say so.
6. [note] At 3440 the Name column takes ~60% of the grid while Updated / Duration / Role sit in ~70px tracks (shots/…/3440.png, rows band; layout.json empty 0.75 at 3440). Not wrong, but a Name ceiling would let the numbers breathe.
7. [note] Previous round's fix (empty shots, no index) is resolved: every width now shows 603 sessions and priced rows.

Widths given: 400, 1200, 1920, 3440 (page /framework/ai/sessions/, one sheet).

## Requirements
- 1 "Account for every message and every tool call… Claude and OpenRouter kept separate" — yes — cost cells read "Claude $109" etc. (1200.png); this diff does not touch the accounting
- 2 "A Session class, usable on the server AND the client" — yes — Session.js keeps its node/browser split; `locate` (node) and `dir_url` + `use_index` (browser) added for day folders; Server/session-place.test.mjs covers the move, the record and the reader
- 3 "A preview row… and a detailed view (click-through)" — yes for the row (1200.png, rows band); detail view not in the shots — not re-proved by this diff
- 4 "Never reprocess a huge raw file on load… measure the bytes" — yes — the page still reads only session-index.json; the new `day` column adds ~13 bytes per row; no new request
- 5 "Per-session folder… session.jsonl beside page.jsonl; a Servex tool writes each line" — yes, changed — folders move to `sessions/YYYY/MM/DD/<id>/` (doc/layout.md gives the reason and the rejected alternative); writes still go through `Session.log`/`close`
- Addendum "filters/sorts by tag and has a needs-attention filter" — yes — NEEDS ATTENTION checkbox (1200.png, filter row); every column now sorts (page.js `sort_rows`)
## Page structure
- page 1 — yes — "Sessions" panel under the AI tabs; the four tiles say what it measures (1200.png, top band)
- page 2 — yes — usage / cost / count tiles first
- page 3 — yes — state tiles, then filters, then the table
- page 4 — n/a
- page 5 — yes — SESSIONS tab in the AI tab bar
- page 6 — no — the sort state (`page.sort`) is not in the URL, so a reload drops it (note-level; pre-existing for Cost)
- page 7 — yes — the existing grid, no new page CSS in this diff
- page 8 — no — headers give no sortable cue at rest (finding 2); "(n/a)" and "(unknown)" chips are not self-evident
- page 9 — yes
- page 10 — yes — a grid with numbers
- page 11 — yes
- page 12 — n/a
## Navigation
- nav 1 — tabs, a sidebar, a bottom rail (400)
- nav 2 — yes — layout.json tab_rows 1 at every width
- nav 3 — yes — /framework/ai/sessions/
- nav 4 — yes — six tabs
- nav 5 — yes — sidebar beside the main column at 3440; folds to a menu at 400
- nav 6 — yes
- nav 7 — yes — 400.png: the bottom rail sits below the last visible row
- nav 8 — n/a
- nav 9 — n/a
- nav 10 — not shown in these shots
## Layout
- layout 1 — yes — sidebar + full-width grid at 3440
- layout 2 — yes — Rail + content
- layout 3 — no — at 400 the row meta line is wider than its box (finding 1); at 3440 Name is over-wide (finding 6)
- layout 4 — yes
- layout 5 — no — 400.png: row text runs to the box edge and is cut
- layout 6 — yes
- layout 7 — yes — layout.json rows band share 0.83–0.93 with ink 0.25–0.70; bar band 0.015–0.019
- layout 8 — n/a
- layout 9 — yes
- layout 10 — yes
- layout 11 — yes — the four tiles fill one row at 1200+ and 2×2 at 400
- layout 12 — yes
## Sizing
- sizing 13 — yes
- sizing 14 — yes
- sizing 15 — no — the prompt preview line is clipped with no ellipsis (1200.png row 2, 400.png)
- sizing 16 — yes
- sizing 17 — yes
- sizing 18 — yes — layout.json overflow_x false at all four widths
- sizing 19 — not measured
## Wrapping
- wrap 20 — yes — tab_rows 1; layout.json wraps list only the drawer/mode buttons (icon glyphs, not this diff)
- wrap 21 — yes — same wraps at 1200 and 1920
- wrap 22 — yes — the chip row wraps cleanly at 400 and 1200
- wrap 23 — no — 400.png: the row meta line crushes off the edge instead of stacking (finding 1)
- wrap 24 — n/a
## Spacing and padding
- space 33 — yes — layout.json left_stack h1 14px at 400
- space 34 — yes
- space 35 — yes
- space 36 — no — 400.png: row text meets the right edge
- space 37 — not measured; no CSS in this diff
- space 38 — yes — chips keep em padding
- space 39 — yes — the panel is white on the grey ground
- space 40 — n/a
- space 41 — yes — no CSS in this diff
- space 42 — yes
## Colour and contrast
- colour 1 — yes — dark ink on white; muted lines read (1200.png)
- colour 2 — yes — orange SERVEX / blue VS CODE badges are outlined and legible
- colour 3 — yes — no colours in this diff
- colour 4 — yes — tiles are outlined boxes
- colour 5 — not shown (light shots only)
- colour 6 — yes
- colour 7 — yes — the source badges repeat identically
- colour 8 — yes
## Flow
- flow 25 — yes — tiles, filters, then the most costly rows first
- flow 26 — no — 400.png: model and State cut off past the right edge (finding 1)
- flow 27 — yes
- flow 28 — yes
- flow 29 — not shown
- flow 30 — yes — layout.json widest_text 430–552px
- flow 31 — yes
- flow 32 — yes
## Words
- words 1 — yes — numbers in tiles, rows in a grid
- words 2 — yes
- words 3 — yes — doc/layout.md paragraphs are short
- words 4 — yes
- words 5 — yes
- words 6 — n/a
- words 7 — yes — "day folder" and `first_at` used the same way across Session.js, doc/layout.md and session-place.mjs
- words 8 — yes — readme links doc/layout.md as a plain file path
- words 9 — no — doc/layout.md has a path tree in text but no picture; fine for a deep doc
- words 10 — yes
- words 11 — no — "814 spawned agents have no recorded parent" and the "(n/a)" / "(unknown)" chips are unexplained on the page (pre-existing)
