verdict: fix
1. [fix] The new AISession page, the spot check's one "fixed on the spot" item, opens to a blank Overview: no readme, no class card, no description, 81–92% of the screen empty at every width (page 1, layout 1). Evidence: shots/…-AISession/1200.png, everything below the tab bar; layout.json tab-panel ink 0.09–0.21. It no longer 404s, but it still shows nothing.
2. [fix] Requirement 2 said "callers updated by Server/RenameScript.mjs with --plan first". The diff updates no callers; all 66 importers of the five files still go through the shims. The census doc changes the plan to "callers move as they are touched" without saying why (Law 4).
3. [note] Requirement 1 asked for a class name and API for each of the top 20. Rows 12, 13 and 18 still read "(name to confirm)", and most rows name a class but not its API.
4. [note] Every shot logged a 404 resource error (layout.json `errors`, both pages, all four widths). The source is not named; it may predate this change.
5. [note] On /framework/ai/AISession/ the parent AI bar still marks INBOX as active, so a reader can't tell from the tabs where they are (navigation). shots/…-AISession/1200.png, top band.
6. [note] Requirement 4 (the card, the `tail -1` landing check, `merge.mjs`) can't be checked from the diff. The links from patterns/readme.md and ai/doc/architecture.md are present ✅.

Widths given: 400, 1200, 1920 and 3440 for both /framework/ai/ and /framework/ai/AISession/.

## Requirements
- 1 "The census, by script… a Haiku pass names the class and its API for the top 20; you check the top 10" — partly. code/patterns/doc/oo-census.md has the ranked table (281 → 276), the rule and the re-run command. Rows 12, 13 and 18 have no name and the API column is missing.
- 2 "The top five become classes… a one-line shim at the old path… callers updated by RenameScript" — partly. PanelGlyphs, LayoutControls, DesignScore, AICost and EditSwitch are each a class in a file named for it. Each shim re-exports every old name (checked against the removed `export` lines), and the statics use the class name, not `this`, so the destructured re-exports work. No callers were moved.
- 3 "'Done properly' spot check for ten modules" — yes, eleven rows in the doc. But the one fix (the AISession page) renders empty; see finding 1.
- 4 "Linked from code/patterns/readme.md and ai/doc/architecture.md; card; landing line; merge.mjs" — the links: yes, both in the diff. The rest: not checkable from the diff.
## Page structure
- page 1 (the title says what it is) — partly. The "AISession" title shows, but the description and readme never render (AISession/1200.png).
- page 2 (level 1 shows the thing) — no. The Overview is blank at every width.
- /framework/ai/: the only change is a child added to its list. The page looks as before (ai/sheet.png).
## Navigation
- techniques: a sidebar (tree), tabs (the AI bar and the page tabs), a bottom rail at 400.
- tabs fit — yes. layout.json tab_rows is 1 at 1200, 1920 and 3440, and 2 at 400 (a stacked header, not a wrap of one bar).
- the active tab shows where you are — no. AI › INBOX stays highlighted on the AISession child (AISession/1200.png, top band).
- reachable by a link — yes. `children:` in ai/page.js names AISession.
## Layout
- the content uses the space — no on AISession: empty 0.81 / 0.83 / 0.89 / 0.92 across the four widths. /framework/ai/: yes, empty 0.12–0.34, the same as before.
## Sizing
- no overflow — yes. overflow_x is false on both pages at every width.
## Wrapping
- unintended wraps — only the existing icon buttons (drawer-rail at 400 and mode-btn at 1200 and up, about 1.7 to 3.2 lines). Nothing new from this diff.
## Spacing and padding
- header bands are padded consistently — yes. AISession's doc-well share is 0.058–0.087, and the gaps look even (1200.png).
## Colour and contrast
- n/a. Nothing new is coloured; it uses the standard doc header tokens.
## Flow
- the reader moves from the title to the content — no on AISession: the Overview has no content to move to.
## Words
- content 1 (plain sentences) — yes. The oo-census.md headings state their gist, and the AISession readme is a short index, one line per file.
- content 2 (no jargon standing in) — mostly. "prototype tier" is explained once, as the core/new/1/site files, where moving them is ask-first. "(name to confirm)" is a placeholder left in shipped text.
- the readme links its doc — yes. patterns/readme.md has one line pointing to doc/oo-census.md.
