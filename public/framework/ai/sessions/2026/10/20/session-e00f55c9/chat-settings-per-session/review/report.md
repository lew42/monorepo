verdict: fix
1. [fix] `core/readme.md` (the core module index) has no line for the new `Settings` module: Plugin is at line 56, Settings is missing. `public/framework/readme.md` and `core/files.jsonl` do list it (law 10, index everything).
2. [fix] `core/Settings/readme.md:29` says "12 tests (31 checks)", but `Settings.test.mjs` has 13 `test(` calls, and `plan.md` Status also says 13. The new grouped-load test was never counted, so the readme is stale.
3. [note] The shots (14:23) are older than the review fixes in this diff (bf6abb46f and 99d86e58d, diff 14:25). They still show the 60 px slider, "this session" in muted text, "The JSON on the right" and the code sample cut off at the right. So I judged the slider room, the "Editing:" line and the wording fixes from the diff, not the pixels. A re-shoot after the fix commits would settle them.
4. [note] The code sample in the diff (`page.js:366-373`) still runs to about 60 characters per line (`fields: [{ key: "volume", label: "Volume", type: "slider",`). At 400 it will probably still clip. The shot is too old to say.
5. [note] The select row puts its help text under the dropdown in a nested column (`Settings.js:142`). At 400 that pushes "follows the system" under the bottom bar (400.png, last band). It works, but the help text would read better on its own full-width line, like the other fields' help.

Widths given: 400, 1200, 1920, 3440 for `/framework/core/Settings/` (a new page), plus single 1920 shots of `/framework/` and `/framework/core/Plugin/`.

## Requirements
- Step 3 of the brief (merge 4): "Build a settings system for the long term, `core/Settings`" — yes — `core/Settings/Settings.js` plus 13 tests, and the page demo.
- "It sits between the data and the UI: `settings.render()` draws the panel" — yes — `Settings.js:121` `render()`; 1920.png band 6 shows its rows.
- "Field types: toggle, slider, number, dropdown" — yes — `Settings.js:128-152` has all four (plus text); 400.png shows Notify, Volume, Retries and Theme.
- "It decides how often to save" — yes — the save policies `each` / `{debounce_ms}` / `manual` (`Settings.js:95`) and three tests for them.
- "Any Item can have one" — partly — it is a plain `Events(Object)` with an injected `persist`, so any Item could hold one, but nothing attaches it to Item yet. Step 4 does that, so this is correct staging.
- "groups `settings.dictate` and `settings.recite`" — yes — the `groups:` option and `s.dictate` / `s.recite`, with tests `own: groups…` and `make_default recurses…`.
- "Make the panel say which one you're editing" — yes, in code — `render()` prints "Editing: " + level in bold (`Settings.js:161`). The shot predates it (finding 3).
- "Every slider says what its two ends do" — yes — the `low`/`high` end texts (`Settings.js:133,137`); 1920.png shows "quiet … loud".
- The five owner asks: none ticked — correct. This is merge 4 of 7, and `plan.md` Status says so.
- Show the class and its live instances — yes — `/framework/core/Settings/` shows a live instance with `settings.own` updating beside it (1920.png band 6).
- A fresh agent can continue — yes — `plan.md` Status now records the step 3 worktree, commit, test count and the next step. This fixes the last round's finding 3.

## Page structure
- page 1 (the title says what it is) — yes — 1920.png top band: "Settings", then a one-sentence definition.
- page 2 (the one takeaway shows first) — yes — the definition, then the code, then "Try it".
- page 3 (show, don't tell) — yes — a live panel with the JSON beside it.
- page 4 (the long form is nested) — yes — the readme sits in `md.details` at the end.

## Navigation
- navigation 1 (techniques used) — the sidebar (core tree) at 1200+, the bottom rail at 400, and the AI side panel.
- sidebar: the page is reachable and marked — yes — 1920.png: "Settings" is highlighted under Core, after Test.
- bottom rail — yes — 400.png bottom band.
- tabs — n/a

## Layout
- layout 1 (the right page layout for the content) — yes — `layout.json` reports layout "standard", a single text column.
- layout 2 (the two demo panes sit side by side, then stack) — yes — 1920.png band 6 shows them side by side; at 400 they stack (layout.json: flex band, 408 px).
- layout 3 (a wide screen is used) — n/a — this is a reading page, and the text column is held to a measure on purpose.

## Sizing
- sizing 1 (the text column holds a readable measure) — yes — widest_text 584 px at 1200, 627 px at 1920, 705 px at 3440.
- sizing 2 (controls get room for their job) — yes in code, no in the shot — the slider was 60 px at 1920 (1920.png band 6). The diff now gives it `flex 1 1 6em; minWidth 6em` and caps the label at `0 1 6em` (finding 3).
- sizing 3 (empty space) — yes — empty 0.68 at 1920 and 0.78 at 3440 is the side margin of a measured column, not a broken layout.

## Wrapping
- wrapping 1 (no horizontal overflow) — yes — overflow_x false at 400.
- wrapping 2 (code fits its box) — no in the shot, probably still at 400 — finding 4.
- wrapping 3 (rows wrap cleanly) — yes — a help text takes `flex 1 1 100%` and drops to its own line.

## Spacing and padding
- spacing 1 (left edges line up) — yes — left_stack: h1 16 and p 16 at 400.
- spacing 2 (row rhythm) — yes in code — the row min-height went from 2.75em to 2.25em. In the old shot the rows sat about 68 px apart.
- spacing 3 (panel padding) — yes — the `surface pad` panes, 1920.png band 6.

## Colour and contrast
- colour 1 (the text has contrast) — yes — dark text on light surfaces; the muted end texts are still legible at 1920.
- colour 2 (the accent is used for state only) — yes — the orange is on the checkbox and the slider thumb only.

## Flow
- flow 1 (reads top-down in the order things are learned) — yes — what it is, the code, try it, groups, readme.
- flow 2 (the demo shows its effect live) — yes — the JSON pane updates on change, and the groups are wired to `refresh`.

## Words
- content 1 (plain sentences) — yes — the page's first sentence defines every term it uses.
- content 2 (names match the code) — yes — `defaults`, `own`, `get`, `set`, `persist`, `render()` and `settings.own` are the real names, which is what the owner asked for.
- content 3 (no claim the layout breaks) — yes in code — "beside it" replaces "on the right" (`page.js:376`).
- content 4 (the docs match the code) — no — the readme's test count is stale (finding 2), and core/readme.md has no index line for Settings (finding 1).
