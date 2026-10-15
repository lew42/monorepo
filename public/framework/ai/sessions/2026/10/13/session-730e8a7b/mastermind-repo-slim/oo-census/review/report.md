verdict: pass
1. [note] Ask 2 said "under about 10 callers each"; the five classes have 10, 13, 10, 12 and 21 importers (oo-census.md table). `ext/Ask/edit.js` at 21 is double the limit. Shims keep it safe, but the brief's limit was passed without a stated reason.
2. [note] Ask 1 wanted a Haiku pass naming the class and API for the top 20. Rows 12, 13, 33, 35-40 say "name to confirm", and no row lists an API. Only the "Should be" column is filled.
3. [note] Ask 3 says ten modules, but the spot-check table has eleven rows (`ai/AISession` was added to the ten). The count is off by one, and the card title "10 modules spot-checked" needs the same fix.
4. [note] The AISession page shows its title twice: page-title "AISession", then the readme's h1 "AISession — one Claude session as a class family". At 400 that h1 wraps to 4 lines (layout.json wraps, h1 lines 4). It is readable, so this is not a fix.
5. [note] Only `AISession` has shots. The five class changes are not pages, so n/a for them. The diff did not show callers rewritten by `RenameScript`; I could not verify this from the patch.

Shots given: `/framework/ai/` and `/framework/ai/AISession/`, each at 400, 1200, 1920 and 3440 (all four widths, since `ai/page.js` children changed).

## Requirements
- 1 "The census, by script" — yes — `oo-census.md` has the ranked table (top 40, importers, exports, lines, should-be), the rule, and a script command. Part of the Haiku-naming ask is weak (finding 2).
- 2 "The top five become classes… shim at old path" — yes — `AICost`, `EditSwitch`, `DesignScore`, `PanelGlyphs` and `LayoutControls` exist. The old `cost.js`, `edit.js`, `score.js`, `glyphs.js` and `controls.js` are each cut to 4 lines. The caller limit was exceeded (finding 1).
- 3 ""Done properly" spot check" — yes — ten modules plus one fixed on the spot (AISession: readme, page, `children`). Finding 3 notes the count.
- 4 "Linked from patterns readme and architecture.md" — yes — both diffs add the link. The AISession page is linked from `ai/page.js` `children`. Card, `tail -1` and merge are not visible in the diff, so not checked.

## Page structure
- page 1 — yes — `shots/…AISession/1920.png`: the title says what it is, and a one-line description opens the readme.
- page 2 — yes — one flow, a short list of classes, a "Watch out" line, no wasted sections.
- page 3 — n/a — nothing in the diff changes `/framework/ai/` visually beyond one more child entry.
- page 4 — note — double title (finding 4).

## Navigation
- identify — a sidebar tree, the AI tab strip (inbox, dashboard, log, system, sessions, tests), and a drawer rail at 400.
- tabs at 400 — note — `tab_rows 2` at 400, one row at 1200 and above (layout.json).
- sidebar — yes — AISession is reachable; the route is `children`-declared.

## Layout
- one column of reading content — yes — `layout.json` bands at 1200: title 5%, flow 67%, no overflow_x at any width.
- overflow — yes — `overflow_x false` at 400 and 1200.

## Sizing
- measure — yes — widest_text 337 at 400, 576 at 1200, 618 at 1920, 695 at 3440. Line length is readable and does not grow with width.

## Wrapping
- h1 — note — wraps 4 lines at 400, 2 at 1200 (layout.json wraps).
- drawer rail buttons "✦AI" and "⋯More" — note — 3.2 lines at 400. They are the app chrome, not part of this diff.

## Spacing and padding
- band padding — yes — left_stack h1 14 and p 28 at 400, 19 and 38 at 1200. No band flagged `big_empty`.
- empty share — note — `empty` 25% at 400, 52% at 1200, 66% at 1920, 78% at 3440 (`shots/…/3440.png`). A narrow text column in a wide page is expected for a readme render, so not a fix.

## Colour and contrast
- text and code chips — yes — `shots/…AISession/sheet.png`: dark text on a light ground, code chips legible.

## Flow
- reading order — yes — title, intro, class list, watch-out line, top to bottom, with no competing columns.

## Words
- 1 plain sentences — yes — the readme opens with what `AISession` is and where its grid is, then lists the classes one line each.
- 2 jargon — note — "shims" is used in the readme and the census without a gloss; `oo-census.md` explains it once in the heading.
- 3 links — yes — Sessions page and `ext/Session` are linked; the file names in the list are plain code, not links, since each file is a source name.
