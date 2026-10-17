verdict: pass
1. [note] The variants call the third limit "weekly, one model" while today's meter right above calls it "weekly — Fable", so one limit has two names on the same page (content: one name every time). See shots/…-usage/1200.png: band 2 says "weekly — Fable" and bands 3–4 say "weekly, one model". The cause is `UsagePace.KINDS`, which ignores the model name that `usage_rail`'s label_of uses.
2. [note] A's caption says "The bar is how far ahead of the clock you are", but every shot shows all three limits under pace (33%, 88%, 85%). A better caption: "The bar is your spend divided by the clock" (content: says exactly what it means).
3. [note] On /framework/ai/usage/ the AI page's tab bar still highlights INBOX, so the tabs say you are on the inbox when you are not (navigation: active state). See shots/…-usage/400.png and 1200.png, top band.
4. [note] The parent `ai/readme.md` does not mention `usage/`. The page is reachable through `children:`, but the readme index skips it (readmes: index every system).

Widths given: 400, 1200, 1920, 3440 for /framework/ai/usage/ and for /framework/ai/. The only change to /framework/ai/ is one more word in `children:`.

## Requirements
- 1 "do NOT clobber them" (existing meter untouched) — yes — the diff does not touch `ai/AITask/usage.js` (git status is clean), and the page shows `usage_rail(u)` first, under "Today's meter (unchanged)", in shots/…-usage/1200.png band 2
- 2 "a NEW variant alongside them … pace-relative view" — yes — variants A, B and C sit on the same page as the old meter, all drawn from the same `ai/usage.json`
- 3 "relative usage visualizable early in the week" — yes — at 26% used, A fills 88% of pace (about 44% of the bar), and B zooms its scale so a 4-point gap is still a visible block (1200.png, bands 3–4)
- 4 "while still conveying pace" — yes — A and B both draw a centre line that marks on pace (`.up-track::after` at 50%)
- 5 "possibly several" — yes — three variants: A (used ÷ pace), B (the gap in points), C (one word)
- 6 the math (ratio = percent / elapsed percent) — yes — `ratio = limit.percent / at` with `at = elapsed*100`; A's bar width is `ratio*50`, so 100% of pace lands on the centre line; ratio is null below 10% elapsed, the same rule `pace()` uses
- 7 the page loads — yes — all four usage shots render the page with no overflow (overflow_x false at every width)
- 8 the readme is true — yes — its file list, the `.up-*` rules in the theme layer, the link to the brief and the "Open: pick the winner" line all match the code

## Page structure
- page 1 (the title says what it is) — yes — "Usage pace" in 1200.png, top band
- page 2 (one takeaway) — yes — "compare the variants against today's meter"; each section is a heading, one sentence and its bars
- page 3 (level 1 fits above the fold) — yes — at 1200, the old meter, A and B are all above the fold; C is one scroll down

## Navigation
- navigation 1 — tabs (the AI page's tab bar) and the sidebar tree
- tabs: active state is correct — no — INBOX is highlighted on the usage page (note 3)
- tabs: rows — yes — layout.json tab_rows 2 at 400, 1 at 1200, 1920 and 3440
- route: reload lands in the same place — yes — the page has its own URL, /framework/ai/usage/

## Layout
- layout 1 (the layout fits the content) — yes — `.up-set` is an auto-fit grid: 3 columns at 1200 and wider, 1 column at 400
- layout 2 (comparable items line up) — yes — A, B and C use the same three columns in the same order (3440.png)

## Sizing
- sizing 1 (bands are the right size) — yes — layout.json: the block band is 0.884 of the screen at 1200 and 1.475 at 400 (it scrolls); the title band is 0.049
- sizing 2 (wide screens) — yes — at 3440, empty is 0.752, but the bars widen to fill their columns, so the space carries content rather than sitting blank (3440.png)

## Wrapping
- wrapping 1 (nothing wraps that shouldn't) — yes — layout.json wraps at 400: "Today's meter (unchanged)" and "B. The gap from pace" each take 2 lines, which is acceptable for an h2; the other wraps belong to the shared app chrome (drawer rail, mode button), not this change

## Spacing and padding
- spacing 1 (side padding grows with the width) — yes — layout.json left_stack p: 28 at 400, 38 at 1200, 67 at 1920, 90 at 3440
- spacing 2 (gaps use the tokens) — yes — `gap: var(--gap) var(--flow)`; the rows read evenly in 1200.png

## Colour and contrast
- colour 1 (tokens, not raw colours) — yes — fills use `--ok`, `--warn`, `--hot` and `--error`, the same ramp as `usage_rail`; the track is `color-mix` on currentColor
- colour 2 (contrast) — yes — the dark text and green fill on the light grey track stay legible in every shot

## Flow
- flow 1 (reading order) — yes — today's meter comes first, then A → B → C, from most bar-like to least
- flow 2 (headings name their sections) — yes

## Words
- content 1 (plain sentences) — yes — one short sentence per section
- content 2 (one name every time) — no — "weekly — Fable" and "weekly, one model" name the same limit (note 1)
- content 3 (captions are accurate) — no — A's caption says "ahead of the clock" for a bar that shows being behind too (note 2)

## After the report
Notes 1, 2 and 4 are fixed in commit b0c622d55 (one name per limit, caption, readme index). Note 3 (INBOX tab lit on a child page) is the AI page default-tab behaviour, the same on every child such as /framework/ai/models/; it belongs to the page mastermind. The reviewer ran against the first commit; this folder exists because merge.mjs only scans task logs of the last 3 days and the original task dir (2026/10/13) is older.
