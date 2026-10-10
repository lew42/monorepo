verdict: fix
1. [fix] Child sessions are not nested by path (requirements, Addendum 8, "literally subdirectories of the parent's directory") and "every session gets a proper name going forward" is not built: the diff only nests rows in the grid from session-tree.json, and priorities.md/layout.md list both as "not built / still to do". The reason is written down (a child can start a day later), but the owner's ask is unmet.
2. [fix] "In flight" has two definitions that disagree: `is_in_flight` counts an idle-but-live Servex agent as in flight, but the state column's ▶ uses `WORKING_STATES` (working/active) only, so rows in the "In flight now" strip show a quiet • (diff, page.js `row_view` vs `is_in_flight`). The state flashing the owner reported can reappear as a mismatch.
3. [fix] The new "In flight now" strip repeats the same rows as the grid and pushes the grid down: at 1920 and 3440 only the first few grid rows appear below the strip (shots/127-0-0-1-50850-framework-ai-sessions/1920.png, bands 2-3). The owner asked for a compact grid and a filter next to the checkboxes, not a second section (CLAUDE.md law 6, law 4).
4. [note] Before/after bytes and requests for the Sessions page (requirements item 4) are not in the diff or the shots; not measured here.
5. [note] The shots folder holds two runs. Port 63872 shows the old page (big tiles, State last); port 50850 shows the new one. I judged the 50850 run. Check the other is not what gets kept.
6. [note] page.js indentation is off in the controls block (the `const tags` line sits after the new in-flight label) and in the poll/stream block. It parses, but confirm the tag filter still renders inside its intended condition.
7. [note] `session-place.mjs` still deletes the stray `files.jsonl` listings, which is outside "never destructive". It is documented as regenerable noise, so a note only.
8. [note] The 400 shot has 43% empty and the two drawer rail buttons wrap to 3.2 lines (layout.json wraps); the rail wrap is older than this change.

## Requirements
Widths given: all four (400, 1200, 1920, 3440), two runs.
- 1 "Account for every message and tool call" — n/a — not in this diff (page and storage changes only)
- 2 "A Session class on server and client" — yes — Session.js changed to resolve one store; node test updated
- 3 "Preview row and detailed view on the Sessions page" — yes — shots/…50850…/1200.png, grid rows
- 4 "Never reprocess a huge raw file; page loads small cached data" — yes — the page reads session-index.json; bytes before/after not measured (note 4)
- 5 "Per-session folder with session.jsonl beside page.jsonl" — yes — layout.md and `Session.locate` merge into the card folder
- Addendum, tags and alerts filters — yes — "needs attention" and tag filter retained
- 8a "Pick ONE store, non-destructive conversion script, old links resolve" — yes — session-place.mjs, moves.jsonl manifest, `--dry`, test; alternative named in layout.md
- 8b "4,000 sessions counted from the index" — yes — counts come from rows and session-index.json
- 8c "State flashes running; make state true" — yes, with a caveat — `true_state` derives it; see finding 2
- 8d "Useful names, never the repo name" — yes — `display_name`
- 8e "Child sessions nest by path, grid nests collapsed with rolled-up cost" — no — grid nesting built, folder rule not built (finding 1)
- 8f "Bars with pace marker, reused from Dashboard" — yes — `usage_rail`, 1200.png top band
- 8g "Cut wasted space above the grid" — no — the stats are compact but the new strip takes the space back (finding 3)
- 8h "In flight filter, sort toggles, state icon first" — yes — checkbox, sortable headers, State is the first column
- 8i "One route per session" — yes — `href = url + r.id + "/"`
- 8j "Sub-pages in the tab, readme and decisions doc, priority ordered, linked" — yes — header links "Priorities" and "Readme & docs"; priorities.md added and linked from the readme

## Page structure
- page 1 (title says what it is) — yes — shots/…50850…/1920.png: "Sessions" heading
- page 2 (one takeaway above the fold) — no — at 1920 the fold holds bars and an In flight strip; the grid is below it
- page 3 (everything linked) — yes — readme links priorities.md and layout.md

## Navigation
- Techniques: tabs (AI tab bar), a sidebar (page tree), header text links (Priorities, Readme & docs)
- tabs wrap — no — layout.json tab_rows 1 at all widths
- every view has a URL — yes — `/sessions/<id>/`, `/doc/priorities/`
- doc links leave the tab or stay inside it — not measured

## Layout
- no horizontal overflow — yes — layout.json overflow_x false at all widths
- primary content leads — no — at 1920 and 3440 the In flight strip precedes the grid (finding 3)
- empty space — no — layout.json empty 0.43 / 0.47 / 0.51 / 0.69 at 400 / 1200 / 1920 / 3440; 69% at 3440 is high

## Sizing
- bars take a sensible width — yes — 1200.png, top band; they flex from 24em
- the grid fits its container — yes — no overflow_x
- row height stays steady — yes — 1920.png, flight rows

## Wrapping
- unwanted wraps — no — layout.json wraps at 400: the two drawer rail buttons at 3.2 lines (pre-existing, note 8); none in the sessions content
- the row collapses on narrow screens — yes — the CSS puts the name cell first at 400 (`:nth-child(2)` order)

## Spacing and padding
- band share and padding right — yes — layout.json bands: bar 1.6% and row 92.6% at 1200, no `big_empty`
- the strip's margin (1.5em) before the controls — yes — 1920.png, a clear gap, not wasteful

## Colour and contrast
- state dot, source chips and bars readable — yes — 1920.png, the blinking ▶ in the red SERVEX chip rows
- not measured numerically

## Flow
- order of top-to-bottom reading — no — bars, In flight, filters, summary, grid; the grid, the main thing, comes last (finding 3)
- state first in each row — yes

## Words
- headings name their topic — yes — "In flight now · 4", "Sessions"
- priorities.md is plain and ordered — yes — each item has Asked, Decided, Lives in
- jargon undefined — note — "true_state", "session-tree.json" appear in priorities.md without a gloss
