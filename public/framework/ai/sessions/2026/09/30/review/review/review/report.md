verdict: fix
1. [fix] Asks 1 and 4 are only half met: the card never shows the sheet or links the report. review.mjs writes `{"shots":…}` and `report` into task.jsonl, but nothing in the diff renders them (ai2/card.js is untouched and has no `shots` or `report` reader), so a reader can't open the shots from the card. Evidence: review/diff.patch file list.
2. [fix] The questions page says "in the order it asks them", but its wall does not read in that order (layout 25, content 5). Masonry fills top to bottom, so the top row reads Page structure · Sizing · Flow at 1920 and Page structure · Layout · Wrapping · Colour and contrast · Words at 3440. Evidence: shots/127-0-0-1-64869-framework-ai-review/1920.png and 3440.png, the wall band. The author logged this as "left for later".
3. [note] The concept tiles wrap to 3 rows at 1920 and 3440 while the right half of that band is empty (layout 9, wrapping 22). Evidence: 1920.png and 3440.png, tile band; layout.json flex share 0.139 / ink 0.275 at 1920, 0.21 ink at 3440.
4. [note] "What's in flight" sits under the whole wall, 4–12 screens down (page 4, open before done). Evidence: layout.json `wide` band share 12.585 at 400 and 5.38 at 1920.
5. [note] Each system's "Source:" is plain text, not a link (content 8). The reason is written down in doc/decisions.md, so this is a known gap, not an oversight.
6. [note] The readme counts "nine systems" including Requirements, but the page shows nine tiles without Requirements and with Words (content 7). Requirements has no questions file, so its entry in `SYSTEM_ICON` is never used.
7. [note] merge.mjs's refusal says the report comes "with shots at 400/1200/1920/3440", but the gate only checks that report.md exists. It never checks the pngs.

## Requirements
- 1 "Screenshots belong to the task" — no (half) — shots/ holds four widths plus a sheet and layout.json per page, and task.jsonl has a `shots` line; the card does not show the sheet (finding 1)
- 2 "One review, loaded with the whole design system" — yes — .claude/skills/review/SKILL.md loads page, layout, css and content plus every questions.md, requirements first, all in one pass
- 3 "The questions, per system" — yes — Page structure, Navigation (identify first, q13), Layout, Sizing (fixed or auto, q13), Wrapping, Spacing (stacked, css q1–2), Colour and contrast, Flow; Requirements live in the skill
- 4 "A review report per task… linked from the card" — no (half) — review/report.md is written and linked from task.jsonl, but not from the card (finding 1); proof/review/report.md shows a real run
- 5 "Documented in one place, questions beside rules" — yes — questions.md sits beside each SKILL.md, and /framework/ai/review/ reads them live through questions.json
- 6 "Measurable parts run by themselves" — yes — review.mjs calls layout-check.mjs `--bands` (no second tool); tab_rows, left_stack, bands and wraps are in every layout.json

## Page structure
- page 1 — yes — 1920.png: "Review questions", then one line saying what the page is
- page 2 — yes — 1920.png: the system tiles come first, each linking to its section
- page 3 — no — the wall is out of order (finding 2)
- page 4 — no — "What's in flight" comes last (finding 4)
- page 5 — yes — ai/page.js `children:` adds "review"
- page 6 — yes — each tile is a `#anchor`
- page 7 — yes — the `wide masonry card` words; no page CSS
- page 8 — yes — 1920.png: tiles and cards are self-evident
- page 9 — yes
- page 10 — yes — the questions are shown as a list, not described
- page 11 — yes — one h2 per system card
- page 12 — n/a

## Navigation
- page 13 — a sidebar (site nav) at 1200 and up; a bottom rail (… / ✦) at 400; anchor tiles
- page 14 — n/a
- page 15 — n/a
- page 16 — n/a
- page 17 — yes — 3440.png: the sidebar sits beside the main column; at 400 it folds into ☰
- page 18 — yes
- page 19 — not measured — 400.png: the bottom rail sits over the last visible row; no end-of-page shot to check
- page 20 — n/a
- page 21 — n/a
- page 22 — n/a

## Layout
- layout 1 — yes — 3440.png: five columns fill the width (empty 0.546, down from 0.825 in the earlier localhost shot)
- layout 2 — yes — Standard, with a wide wall
- layout 3 — yes — 1, 2, 3 and 5 columns across the four widths; cards hold full sentences
- layout 4 — yes — `card pad`
- layout 5 — yes
- layout 6 — yes — the wall is in `wide`
- layout 7 — yes — layout.json: no big_empty at any width; the tile band ink is low at 3440 (0.21, finding 3)
- layout 8 — no (note) — masonry card lengths differ, so the columns end at different heights
- layout 9 — no (note) — the empty right half of the tile band (finding 3)
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes — the cards stand apart with a gap

## Sizing
- layout 13 — yes — every card is auto height
- layout 14 — n/a
- layout 15 — n/a
- layout 16 — yes — no inner scrollers in the shots
- layout 17 — yes — title, intro and tiles take about 20% at every width (layout.json bands)
- layout 18 — yes — overflow_x false at all four widths
- layout 19 — yes — `--column: 26em`

## Wrapping
- layout 20 — yes — wraps list only the site chrome (mode-btn 1.7, drawer-menu 1.8, drawer-rail 3.2 at 400), which is the same on every page and not this diff's; no h2 wraps
- layout 21 — yes — no wrap that appears only under 1920
- layout 22 — yes — the tiles are `flex wrap` and wrap cleanly (finding 3 is about the empty space, not the wrap)
- layout 23 — yes — 400.png: one column
- layout 24 — n/a

## Spacing and padding
- css 1 — yes — left_stack 28px, one layer, at 400
- css 2 — yes — one layer at every width (page)
- css 3 — no (note) — the cards use `card pad`, and the rule says never `.pad` on a card
- css 4 — yes
- css 5 — yes — no constants in page.js
- css 6 — yes
- css 7 — yes — 1920.png: the cards are white on the grey ground
- css 8 — n/a
- css 9 — yes — no new CSS
- css 10 — yes — the one inline style is a token override

## Colour and contrast
- css 11 — yes — 1920.png: dark ink on white; the muted rule tags are grey but readable
- css 12 — n/a
- css 13 — yes
- css 14 — yes
- css 15 — not measured — only the light shots exist
- css 16 — yes
- css 17 — yes — the muted rule tag repeats under every question
- css 18 — yes — `span.c("muted")`

## Flow
- layout 25 — no — the wall's reading order (finding 2)
- layout 26 — yes — overflow_x false
- layout 27 — yes — `flow` in each card, `flex v gap-25` for each question
- layout 28 — yes — each rule tag sits right under its own question
- layout 29 — n/a
- layout 30 — yes — widest_text 600px at 1920, 675px at 3440

## Words
- content 1 — yes — the questions are shown as live cards
- content 2 — yes
- content 3 — no (note) — the readme's opening paragraph runs about 70 words
- content 4 — yes — the title, one line and the tiles
- content 5 — yes
- content 6 — n/a
- content 7 — no (note) — finding 6
- content 8 — no (note) — finding 5
- content 9 — yes — readme.md sits beside a live page
- content 10 — yes — the tiles lead
- content 11 — yes
