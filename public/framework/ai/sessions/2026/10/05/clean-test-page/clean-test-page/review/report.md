verdict: fix
1. [fix] None of the shots shows the Try it page working (requirement 1, page 8). Every width shows "Couldn't reach Servex to list models", and there is no model picker, no result and no Run all table. layout.json `errors` lists a CORS block on `http://127.0.0.1:8090/api/clean-test` and `/examples` at all four widths. The likely cause is a Servex that has not been restarted onto this change, since the diff does add `cors` to both routes. After the restart, re-shoot with the picker filled and one Clean result shown, so the main ask is proven by a picture.
2. [note] "Try it" is a child page reached by a link, not a tab (requirement 1 says "a Try it tab"). The reason is written in `Refine/page.js`: with `navigation: "tabs"` and one child, the ladder stopped rendering. The deviation is explained and the page has its own URL, so this is a note rather than a fix.
3. [note] There is a big empty gap between the "Clean something" card and the "Build a test set" card (layout 7 / spacing). In shots/…-Refine-try/1200.png the gap is about 150px, because an empty `.pad` status box and two 0-height divs each take a flow gap (layout.json bands 4–6: share 0.03, 0, 0). Show these boxes only when they have content.
4. [note] In "Build a test set", the label "Good clean text — what the clean step SHOULD have said:" runs straight on from the paragraph above with no rhythm break (flow 27/28). See shots/…-Refine-try/1200.png, bottom band. The label also sits closer to the paragraph than to its own textarea.
5. [note] The Dictate mic is not mounted (requirement 1 allowed it only "if it mounts in one line"), and neither the page nor the readme says why. Add one line saying so.
6. [note] `ext/Refine/files.jsonl` now also lists `weight.jsonl`. The file exists, but nothing else in this diff explains why it was added. Check that it was meant to be part of this change.

Widths given: 400, 1200, 1920, 3440 for both `/framework/ext/Refine/` and `/framework/ext/Refine/try/`.

## Requirements
- 1 "A Try it tab… text box, model picker, Clean button… cleaned text, seconds, real $… Run all side by side" — no — the code has all of these (`try/page.js`: textarea, select, Clean, Run all table with Time and Cost), but every shot shows the Servex-unreachable state, so none of it is shown working. It is also a linked child page, not a tab (finding 2).
- 2 "Calls go through the dev server or Servex, never a key in the browser; reuse :8998 and the OpenRouter provider; smallest route" — yes — `Servex/ext/clean-test/run.js` calls the local proxy at `LOCAL_PROXY_PORT` and uses `read_key`/`spend_guard` from `openrouter/provider.js`. The key is read on the server only. Four small routes were added in `Servex.js`.
- 3 "Uses the SAME clean() prompt Echo uses" — yes — run.js imports `clean` from `ext/Refine/engine.js` and swaps in only `call`. engine.js `nodeCall` builds the same prompt and calls `call` once.
- 4 "Worktree → check_page (400, 1200) → merge.mjs" — yes — this review gate is running, with shots at all four widths.

## Page structure
- page 1 — yes — shots/…-Refine-try/1200.png: the title "Try it" plus the first paragraph say what the page runs
- page 2 — n/a
- page 3 — yes — try first, then build a test set, then a link to Local Models
- page 4 — n/a
- page 5 — yes — `Refine/page.js` `children: "try"`, plus a visible link (…-Refine/1200.png, band 3)
- page 6 — yes — /framework/ext/Refine/try/ is its own URL; results are transient and not views
- page 7 — yes — layout "standard" (layout.json), cards only, no page CSS
- page 8 — no — Clean and Run all sit with no picker beside them in the shots (finding 1); the buttons themselves are clear
- page 9 — no — empty status boxes take space between the cards (finding 3)
- page 10 — yes — results and scores are tables, not sentences
- page 11 — yes — "Clean something", "Build a test set"
- page 12 — n/a

## Navigation
- nav 1 — a sidebar (the site's own); plus a plain link from Refine to Try it
- nav 5 — yes — sheet: the sidebar sits beside main at 3440 and folds into a rail at 400
- nav 6 — yes — the sidebar stays still
- nav 2, 3, 4, 7, 8, 9 — n/a
- nav 10 — yes — results replace a box below; nothing expands in place above the reader

## Layout
- layout 1 — no — at 3440 there is one ~700px column on an empty screen (empty 0.817), but that is the standard reading column for a tool page; a note at most
- layout 2 — yes — Standard
- layout 3 — yes — the cards fit their content at every width (sheet.png)
- layout 4 — yes — framed boxes use `.card`
- layout 5 — yes — text is inset inside the cards
- layout 6 — n/a — the Run all table is not shown; it sits in the reading column (check it once it renders with 4 columns)
- layout 7 — no — empty status bands between the cards (finding 3); no band is `big_empty`
- layout 8 — n/a
- layout 9 — yes
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes — the two cards stand apart with a gap

## Sizing
- sizing 13 — yes — all auto height; textareas use `rows`
- sizing 14 — n/a
- sizing 15 — n/a
- sizing 16 — yes — no stray scrollers in the shots
- sizing 17 — n/a
- sizing 18 — yes — overflow_x false at all widths
- sizing 19 — yes — no new sizes; inline `width:100%` only

## Wrapping
- wrap 20 — yes — the only wraps are site chrome (drawer-rail, mode-btn), none from this page
- wrap 21 — yes — wraps are the same at 1200 and 1920
- wrap 22 — yes — the button rows are `flex wrap gap`
- wrap 23 — yes — 400 stacks in one column (sheet.png)
- wrap 24 — n/a

## Spacing and padding
- spacing 33 — yes — left_stack 28px at 400
- spacing 34 — yes — one layer (page) plus the card
- spacing 35 — no — the status and examples boxes are empty `.pad` divs that add space with nothing in them (finding 3)
- spacing 36 — yes
- spacing 37 — yes — no new CSS
- spacing 38 — yes — default buttons
- spacing 39 — yes — the cards are white on the grey ground
- spacing 40 — n/a
- spacing 41 — yes — no CSS added
- spacing 42 — yes — existing classes; `width:100%` inline is small and static (a note)

## Colour and contrast
- colour 1 — yes — dark ink on white cards; muted text is still readable at 1200
- colour 2 — yes — the accent link on Refine is dark text with an accent underline
- colour 3 — yes — no literal colours
- colour 4 — yes — the cards differ from the grey ground
- colour 5 — not measured — no new colours, so dark mode follows the tokens
- colour 6 — yes
- colour 7 — n/a
- colour 8 — yes — `p.c("muted")`

## Flow
- flow 25 — yes — paste, pick, Clean comes first
- flow 26 — yes — overflow_x false
- flow 27 — no — the label and textarea run on from the paragraph inside the second card (finding 4)
- flow 28 — no — the "Good clean text" label is closer to the paragraph than to its textarea (finding 4)
- flow 29 — n/a
- flow 30 — yes — widest_text 592–714px
- flow 31 — n/a
- flow 32 — yes — padded once

## Words
- words 1 — no — the page cannot show a live result in the shots (finding 1); in the code the result table is the picture
- words 2 — yes
- words 3 — yes — the intro paragraph is about 45 words
- words 4 — yes — "run Echo's clean step against any model" comes through in ten seconds
- words 5 — yes
- words 6 — n/a
- words 7 — yes — "clean" and "Echo" are used the same way throughout
- words 8 — no — "Echo" is not linked on the page, though it has its own page; Local Models is linked
- words 9 — yes — the readme section links to the live page
- words 10 — yes
- words 11 — yes — full, plain sentences
