verdict: fix
1. [fix] ext/highlight's docs are now stale: `readme.md` still says "Unregistered languages (`bash`, `diff`) render as escaped plain text" and lists `code.html / css / md / json` without `code.sh`; `page.js` (lines 14-21, the Languages section) names five grammar files and five accessors; `doc/choice.md` "Keep: five languages" and `doc/decisions.md` line 138 (open item "More languages: bash and diff") don't mention that bash has landed. Update all four in the same commit (documentation rule, Law 9).
2. [fix] `public/live/LiveCode.test.mjs` is not indexed: `public/live/readme.md` line 50 lists only `LivePage.test.mjs` under "Tests:". Add it there (Law 10).
3. [note] Ask 1's "a long line scrolls inside the block" is claimed, not shown: none of the three demo cards has a line longer than the block, so the shots prove only `overflow_x false` at 400 (layout.json), not the scroll. The css card's caption says it does; one long line in the js card would prove it.
4. [note] The card title (`h4.live-card-title`) draws almost as large as the page h1 (shots/…code-card/1200.png: "A sum" vs "Page features"), so three cards read as three sections. That size comes from LivePage's existing `.live-card-title`, not this diff.
5. [note] Two `item.on("change")` listeners (one per key, `LiveCode.js:24`) where one listener checking `k === "lang" || k === "code"` would do. Harmless.

Widths given: 400, 1200, 1920, 3440 for `/live/demos/` and `/live/demos/code-card/`.

## Requirements
- 1 "`LiveCode extends Item`, registered `live-code`, `static example`, fields lang/code/title/caption, View draws title → code → caption" — yes — diff `public/live/LiveCode.js`; shots/…code-card/1200.png shows title, highlighted block, caption, in that order
- 1b "A long line scrolls inside the block; the page never scrolls sideways at 400px" — partly — layout.json 400 `overflow_x false`; `pre { overflow-x: auto }` is in LivePage.css, but no demo line is long enough to show the scroll (finding 3)
- 2 "Highlight with what exists … if a language is missing, add it there, small" — yes — `code[lang]` from ext/highlight; bash grammar vendored as one file, `sh`/`bash` accessors added; `html` already mapped to xml
- 3 "A test … replay a `live-code` line, check the fields; under 1 s" — yes — I ran `node public/live/LiveCode.test.mjs`: 4 passed, well under 1 s
- 4 "Two lines in LivePage.js" — yes — the diff touches exactly the import and `card_types`
- 5 "A demo … one js, one json, one css. Shots at 400 and 1200" — yes — `/live/demos/code-card/page.jsonl` holds three cards; `shots/400.png` and `1200.png` committed and listed in its `files.jsonl`; linked from `/live/demos/page.jsonl`
- 6 "Docs in the same commit: readme line + `static example`" — yes — readme table row "a code block", Files list names LiveCode.js; but the test file and highlight docs were missed (findings 1, 2)
- Class page with live instances — n/a for a new page; each instance is a card readable by `page_read` / `item read` on its page, which is enough for a stateless display card (note, no fix)
- Fresh agent continuity — yes — requirements.md names the worktree, branch and fence; proof.md names commit `717846174` and the checks run

## Page structure
- page 1 (title says what it is) — yes — h1 "Page features" with the "Code card" tab active (the tabs rule: the h1 stays the parent's title)
- page 2 (one takeaway) — yes — the header line "Three live-code cards: js, json, css." says it
- remaining page-structure questions — n/a (sub-page demo inside an existing LivePage; the frame is unchanged)

## Navigation
- navigation 1 (identify) — tabs (the LivePage tab row), the bottom rail at 400
- tabs: one row — yes — layout.json `tab_rows 1` at every width
- tabs: the active tab shows — yes — shots/…code-card/1200.png, "Code card" underlined
- tabs at 400 — yes — the row scrolls sideways (first tab cut at the left edge, shots/…code-card/400.png top band); that's how the row already worked before this diff
- bottom rail — n/a (unchanged)

## Layout
- the content sits in one readable column — yes — shots/…code-card/1200.png: blocks span the column, text up to 552px wide (layout.json `widest_text 552`)
- 1920 / 3440 empty space — yes, acceptable — `empty 0.76` / `0.83`; it's the LivePage column plus chat panel, which this diff didn't change

## Sizing
- the code block fits its column — yes — 400: block is full column width with 12px page pad (`left_stack p 12`); 1200: same column as the text
- the code block sizes to its content height — yes — no fixed height; the json block is taller than the js one (1200.png)
- the card title is sized right for a card — no (note) — finding 4

## Wrapping
- nothing wraps that shouldn't — yes — layout.json `wraps` lists only the drawer rail buttons (`drawer-rail-ai` 3.2 lines at 400), which come from the frame, not this diff
- code lines don't wrap — yes — `pre` keeps lines, scrolls instead (shots/…code-card/400.png: no wrapped code line)

## Spacing and padding
- gaps follow the rhythm — yes — `gap: var(--live-step)` between title, block and caption; shots/…code-card/1200.png shows even spacing title→block→caption→next title
- block padding — yes — ~20px inside each `pre` at 1200 (highlight.css, unchanged)
- band shares — yes — 400: live-main `share 0.625`, head `0.095`; nothing oversized

## Colour and contrast
- code tokens readable on the block — yes — shots/…code-card/1200.png: orange/purple/blue/yellow tokens on #404040; the json braces are grey but still readable
- the block reads against the page — yes — a dark block on the light page
- caption contrast — yes — `opacity .8` on body text still reads (1200.png)

## Flow
- reading order title → code → caption — yes — every card, every width
- the three cards read as a sequence — yes — js, json, css top to bottom (400.png)

## Words
- content 1 (plain words, the reader knows what it is) — yes — titles "A sum", "A card's own delta", "The card's own rule"; captions one plain sentence each
- content (no jargon standing in for an explanation) — mostly — the header line "Three live-code cards" uses the type name; fine for a demo of that type
- readme row — yes — "a code block" with its delta, the languages and the optional fields, in one line
