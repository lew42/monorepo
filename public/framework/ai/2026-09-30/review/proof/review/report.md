verdict: fix
1. [fix] Ask 1, "one widget, everywhere", is not met: the diff never touches ChatPanel, the drawer, the sheet or Dictate. Rename and Understand are two new standalone pages, which is the kind of one-off the owner said to avoid ("we don't want to create unique things that aren't encapsulated"). Evidence: review/diff.patch touches only Servex/, ux/Rename/, ux/Understand/ and ux/page.js.
2. [fix] Ask 3, "drill in", is not met: nothing expands a card, and nothing takes the sheet full screen with routed paging. The diff has no drawer or sheet file in it.
3. [fix] The ✓/? demo never finishes marking. "A canned paragraph, marked on load" still reads "marking…" in all four shots, so the "end to end" demo the owner asked for shows nothing (the Understand shots at 400, 1200, 1920 and 3440, band 3).
4. [fix] Two of the owner's 8:40 PM asks are missing: the fast/smart split, and "Refine" (source statements nested under each item, plus an H1/H2 hierarchy). Neither appears anywhere in the diff.
5. [note] Ask 2 works only as a standalone page. The owner can select, rename, pick from 5 options and see the appended line, but only on /framework/ux/Rename/. It is not in the chat widget, and there is no voice path.
6. [note] The selected title and the log box are painted with `--wash`, which is the page's own ground, so they show no box (css 14). The shot shows "(no renames yet)" floating with no box around it (the Rename shot at 1920, band 3). Rename.css and Understand.css, `background: var(--wash)`.
7. [note] Neither page opens by saying what it is: the first line is the owner's quote (page 1). "Understand" is also a title that doesn't say what the thing does (content 5).
8. [note] At 3440 both pages are one narrow column on an empty screen: layout.json `empty` is 0.80 for Rename and 0.81 for Understand (layout 1). This is the standard Doc shape, so it is a site-wide matter, not this task's.

## Requirements
- 1 "One widget, everywhere: the SAME ChatPanel in the drawer, the sheet, and live on the Dictate page" — no — the diff has no ChatPanel, drawer or Dictate file
- 2 "Select, then rename … about 5 alternative names as a DROPDOWN … appends a line (latest wins)" — partly — the standalone Rename page does it (the Rename shot at 1920: tap-to-select titles, and a log with "latest line for an id wins"); it is not in the chat widget, and there is no voice
- 3 "Drill in: tapping a card … expands it; the sheet can go FULL SCREEN … routed, and back out" — no — not in the diff
- Keep v1 reachable — n/a — no existing widget was changed
- Open note: "/api/tidy accepts any system prompt and model from the LAN" — yes for the new route — /api/hitl refuses `system` and `model` (Servex.js, diff lines 27–28); /api/tidy itself is untouched
- Added, "The fast/smart split" — no — not in the diff
- Added, "Per-sentence understanding: ✓ / ?" — partly — built as ux/Understand, but the canned demo is stuck on "marking…" in every shot
- Added, "Clarification cards … a DEMO … working end to end" — not shown — a Decision card exists in the code (Understand/doc/decisions.md), but the shots never reach it
- Added, "Refine: nest source statements … H1/H2 hierarchy" — no — not in the diff
- Added, "Budget: $15 HARD" — not measured — the diff and shots carry no spend

## Page structure
- page 1 — no — the Rename shot at 1920: the first line is the owner's quote; the one-sentence "what it is" sits only in `description`
- page 2 — n/a
- page 3 — yes — the Rename and Understand shots: the ask, then the live demo, then how it works, then Use
- page 4 — n/a
- page 5 — yes — ux/page.js `children:` now ends with "Understand Rename"
- page 6 — yes — the Overview/Docs/Files tabs are routed children in the rail (the Rename shot at 1920, left rail)
- page 7 — yes — the standard Doc page type, with no page-specific layout CSS
- page 8 — yes — "Tap a title below to try it" and the "Mark it" button say what they do
- page 9 — yes
- page 10 — yes — the live widget comes before the words
- page 11 — no — "Understand" doesn't make the page's subject clear
- page 12 — n/a

## Navigation
- page 13 — tabs (Overview · Docs · Files), a sidebar rail, a bottom rail at 400
- page 14 — yes — layout.json tab_rows 1 at every width, on both pages
- page 15 — yes — each tab is a routed child page
- page 16 — yes — three tabs
- page 17 — no — the rail sits beside a left-aligned column, not a centred main, at 3440 (the Rename shot at 3440); at 400 it folds into ☰
- page 18 — yes
- page 19 — yes — the Understand shot at 400: the content ends above the bottom rail
- page 20 — n/a
- page 21 — n/a
- page 22 — yes — the ? scrolls to the clarification card; it doesn't expand in place (Understand/doc/decisions.md)

## Layout
- layout 1 — no — layout.json empty 0.80 for Rename and 0.81 for Understand at 3440, one narrow column
- layout 2 — yes — Standard
- layout 3 — yes — the reading column is right at 400 and 1200; it is narrow at 3440 (see 1)
- layout 4 — yes
- layout 5 — yes
- layout 6 — n/a
- layout 7 — yes — the bands `big_empty` is false everywhere; the tab-panel carries the ink (0.25–0.66)
- layout 8 — n/a
- layout 9 — yes — widest_text is 717px at 3440
- layout 10 — yes
- layout 11 — yes — the ux/ wall ends balanced at 3440 (the ux sheet)
- layout 12 — yes

## Sizing
- layout 13 — yes
- layout 14 — yes
- layout 15 — n/a
- layout 16 — yes — the only scrollbars are the code blocks
- layout 17 — yes — the title band's share is 0.067–0.077
- layout 18 — yes — overflow_x is false at every width, on all three pages
- layout 19 — no — `var(--pad-card, 1em)` falls back to a constant (Rename.css, Understand.css)

## Wrapping
- layout 20 — yes — the wraps list only holds site chrome (mode-btn, drawer-menu, the rail buttons), plus headings at 400
- layout 21 — yes — no wrap in this page's own content appears only under 1920
- layout 22 — n/a
- layout 23 — yes — the Understand shot at 400: the textarea and the button stack full width
- layout 24 — yes

## Spacing and padding
- css 1 — yes — left_stack 28px at 400
- css 2 — yes — one layer (doc-well or page)
- css 3 — yes
- css 4 — yes
- css 5 — no — the `1em` fallback constant in `--pad-card, 1em`
- css 6 — yes
- css 7 — no — the padded log box uses `--wash`, so it has no different ground (the Rename shot at 1920, band 3)
- css 8 — n/a
- css 9 — yes — `@layer theme` in both CSS files
- css 10 — yes

## Colour and contrast
- css 11 — yes — dark ink on a light ground; the white "Mark it" text on orange is borderline (the Understand shot at 400)
- css 12 — yes
- css 13 — yes — `--prim`, `--ok`, `--warn`, `--line`
- css 14 — no — `background: var(--wash)` on the selected title and the log box
- css 15 — not measured — no dark shot
- css 16 — yes
- css 17 — yes — the uppercase eyebrow labels (LOG, TRY YOUR OWN) match
- css 18 — n/a

## Flow
- layout 25 — yes — the demo sits above the explanation
- layout 26 — yes — overflow_x is false
- layout 27 — yes
- layout 28 — yes
- layout 29 — n/a
- layout 30 — yes — widest_text is at most 717px

## Words
- content 1 — yes — each page is a live widget first
- content 2 — yes
- content 3 — yes — the longest paragraph ("How it works", Rename) is about 57 words
- content 4 — yes for Rename; no for Understand, whose demo shows "marking…"
- content 5 — no — "Understand"
- content 6 — n/a
- content 7 — yes
- content 8 — yes — each readme links to its sibling page
- content 9 — yes — each readme sits beside its live demo
- content 10 — yes
- content 11 — yes
