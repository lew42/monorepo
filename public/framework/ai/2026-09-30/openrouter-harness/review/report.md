verdict: fix
1. [fix] The runs table is squeezed into the reading column, so its right-hand columns are cut off. At 1920 the "$" column shows only a sliver and the judge's note is cut mid-word, while about 900px of the screen to the right stays empty (layout 6, flow 26). Evidence: shots/…-ai-tests-h1-page/1920.png, runs band. At 400 the table is cut after "pass" (400.png), so score, credit and cost can't be seen. Cost per run is the number this whole task exists to show.
2. [fix] The weights line on the Test library index runs the entries together: "h1-page: 0fix-label: 0broken-import: 0…". Each entry is a `small()` with no separator. It also shows `0` for every test, while each test's own page says the weight "is measured once 4 models have run it". One page shows a measurement and the other says there isn't one yet (page 8, words 7). Evidence: shots/…-ai-tests/1920.png, the band below the cards; public/framework/ai/tests/page.js, `small(`${r.slug}: ${r.weight}`)`.
3. [fix] Every recorded run is at `low` effort. Phase 9 and phase 10 say to start every model at MEDIUM thinking and treat that as the default sample (Requirements, phases 9 and 10). Evidence: every run folder name ends in `-low-`, and so does routing.json's `"effort": "low"`.
4. [note] In the live page, the "note" column has been pushed past the table's edge. The cells left over are narrow, so each row grows to about 300px tall, and four runs fill more than a screen. Evidence: a fresh headless shot of /framework/ai/tests/h1-page/ at 1920. Fix 1 fixes this too.
5. [note] The criteria list shows backticks as literal characters, as in "`new Page({ meta: import.meta, … })`". Only `p()` and `h1`–`h6` read backticks, and the criteria go through `li()` (code/css, CLAUDE.md traps). Evidence: the live headless shot, "What a good run does".
6. [note] The index's test cards show a title only, with no one-line description of what each test asks. At 1200 "Plan views" sits alone on a second row (page 8, layout 11). Evidence: shots/…-ai-tests/1200.png and 1920.png.
7. [note] The "reasoning" column is empty on every row. Hide it until a run fills it (page 9). Evidence: shots/…-ai-tests-h1-page/1920.png.

## Requirements
- Plan 1 "harness runs through OpenRouter; real costs recorded; weekly pace" — yes — gaps.md #2–3 (real cost read from OpenRouter, written to the ledger); the spike evidence is linked
- Plan 2 "five tests, each a page at /framework/ai/tests/, scored on Opus, Sonnet, Haiku" — yes — shots/…-ai-tests/1920.png shows five cards; the runs folders hold runs from all three Claude models
- Plan 3 "Models page ranks value per task kind" — not in this diff — routing.json carries the per-kind choice; the page itself landed earlier
- Plan 4 "cheap models on the same tests" — partly, as planned — only h1-page has gpt-6-sol, gpt-6-luna and gemini-3.1-pro runs; the plan marks the rest as "next"
- Ask 1 "spike: does the SDK work through OpenRouter" — yes — gaps.md #1 has the evidence: 3 tools, an edit and a resume after the fix
- Ask 2 "wire `provider` per tier" — yes — gaps.md: `Agents.js options()` gates the change on `provider === "openrouter"`
- Phase 3 "don't change the tools Claude agents see; document gaps" — yes — gaps.md lines 1–6 and #1
- Phase 3 "test library with kinds, tagged" — yes — broken-import, broken-overflow (broken pages), h1-page (new page), fix-label (quick fix), plan-views (planning)
- Phase 6 "web search: who pays" — partly — gaps.md #7 says "works; exact cost being checked"
- Phase 7 "vision tests with known fouls" — yes — the ui-fouls fixtures (padding, contrast, overflow) and ui-fouls-results.jsonl
- Phase 9 "start every model at MEDIUM" — no — every run is `low` (finding 3)
- Phase 9/10 "AITest class; each test a page.jsonl page; runs programmatic" — yes — AITest.js, tests/*/page.jsonl, library.mjs
- Phase 11 "partial credit, discrimination, near-miss review" — yes — the credit column, meta_line(), reviews_list()
- Phase 16 "`differentiation` property" — n/a — the plan places it later

## Page structure
- page 1 — yes — shots/…-ai-tests/1920.png: the title is "Test library"; each test page is titled with the test's name
- page 2 — yes — the index's first item under the title is the wall of five test cards
- page 3 — yes — a test page runs Prompt, then criteria, then Runs (live shot)
- page 4 — n/a
- page 5 — yes — tests/page.js `children:` names all five tests
- page 6 — yes — each test has its own URL
- page 7 — yes — standard and wall layouts (layout.json `layout`)
- page 8 — no — the run-together weights line, and cards with no description (findings 2, 6)
- page 9 — no — the reasoning column is always empty (finding 7)
- page 10 — yes — runs are shown as a table
- page 11 — yes — Prompt, What a good run does, Runs
- page 12 — n/a

## Navigation
- nav 1 — the site rail only (no tabs on these pages; tab_rows 0)
- nav 5 — yes — the rail sits left at 3440 and folds into the bottom bar at 400 (400.png)
- nav 6 — yes
- nav 10 — n/a

## Layout
- layout 1 — no — at 3440 a single ~640px column sits on a screen that is 79–90% empty (layout.json `empty` 0.79 h1-page, 0.90 index)
- layout 2 — yes — standard, wall
- layout 3 — no — the runs table needs more width than the reading column gives it (finding 1)
- layout 4 — yes
- layout 5 — yes
- layout 6 — no — a 10-column table sits in the reading column (finding 1)
- layout 7 — yes — no `big_empty` band in any layout.json
- layout 8 — n/a
- layout 9 — yes
- layout 10 — no — at 3440 the five small cards and tiny weights text sit in a huge empty band (…-ai-tests/3440.png)
- layout 11 — no — at 1200, "Plan views" sits alone on the second row
- layout 12 — yes

## Sizing
- sizing 13 — yes
- sizing 14 — yes
- sizing 15 — n/a
- sizing 16 — no — the table clips or scrolls inside its card at every width (finding 1)
- sizing 17 — n/a
- sizing 18 — yes — `overflow_x` is false on every page; the clipping happens inside the card instead
- sizing 19 — yes

## Wrapping
- wrap 20 — yes — the only wraps are the shared drawer-rail buttons and one h2 at 400
- wrap 21 — yes
- wrap 22 — n/a
- wrap 23 — no — at 400 the runs table crushes its "when" and "model" cells to slivers (h1-page/400.png)
- wrap 24 — n/a

## Spacing and padding
- spacing 33 — yes — `left_stack` h1 28px at 400
- spacing 34 — yes — one layer (`page`)
- spacing 35 — yes — the prompt is in a `card pad`
- spacing 36 — yes
- spacing 37 — yes — no new spacing constants in AITest.js
- spacing 38 — yes
- spacing 39 — yes
- spacing 40 — n/a
- spacing 41 — yes — no new CSS
- spacing 42 — yes

## Colour and contrast
- colour 1 — yes — body text on a light ground; the muted meta line still reads
- colour 2 — n/a
- colour 3 — yes — no literal colours in the diff's page code
- colour 4 — yes — the prompt card and the table read as white boxes on the grey page
- colour 5 — not checked — no dark-mode shots
- colour 6 — yes
- colour 7 — n/a
- colour 8 — yes — uses `.c("muted")`

## Flow
- flow 25 — yes — the prompt leads, then the runs
- flow 26 — no — the table's right-hand columns are hidden past its edge (finding 1)
- flow 27 — yes
- flow 28 — yes
- flow 29 — n/a
- flow 30 — yes — `widest_text` ≤ 803 at 3440 (within the measure); at 400 it's 631, inside the clipped table
- flow 31 — n/a
- flow 32 — yes — a single `page` layer

## Words
- words 1 — yes — runs are shown as a table, not described
- words 2 — yes
- words 3 — yes
- words 4 — no — on the index, the weights line can't be read at a glance (finding 2)
- words 5 — yes
- words 6 — n/a
- words 7 — no — "weight 0" on the index versus "not measured yet" on the test page (finding 2)
- words 8 — yes — test-library/ links each test
- words 9 — yes — each test page shows its runs table beside the prompt
- words 10 — yes
- words 11 — yes — except the literal backticks in the criteria (finding 5)
