verdict: fix
1. [fix] AI is not a System in this diff (requirement 2): `ai/page.js` and `ai/overview.js` are untouched. The conversion exists as its own commit, 63f499cb on worktree/ui-system (ai-convert/task.jsonl), but it is not part of what was reviewed. Meanwhile the diff ships text saying the opposite: core/System/page.js says "AI is not a System yet" and readme.md says "AI: pending". Land 63f499cb together with this change and update both sentences, or the page will be wrong as soon as it merges.
2. [fix] The demo page (the proof for page.jsonl) has a big empty band (layout 7). layout.json gives `big_empty` true on the tab-panel at 400, 1920 and 3440. In shots/…core-System-demo/1920.png, the Files box is about 480px tall and holds two file names, and the page.jsonl line is cut off at the right edge of the viewer (widest_text 2153). There is also no sentence saying what the demo is: `left_stack.p` is 0 at every width.
3. [note] The Design tiles break onto a second row with only "UI" on it, even at 3440 (layout 11). See shots/…framework-design/sheet.png, top band.
4. [note] On the core/System Overview, the paragraph that starts "`System extends Doc`…" runs about 75 words (content 3). It also repeats what readme.md and doc/system.md already say.
5. [note] On the demo, `tab_rows` is 2 at 1200 and 1920. The bar it measured is the nested vertical Overview · Inbox list, which is vertical by design, so this is not a wrapped tab bar.

Widths given: 400, 1200, 1920, 3440 for every page (run 51848, the latest of three).

## Requirements
- 1 "create a system class … `System extends Doc`" — yes — the diff adds core/System/System.js: concepts tiles, the readme folded in at the end of the Overview, an Inbox tab, and `omit:`
- 1 "works both ways: page.js and page.jsonl line 1" — yes — design/code/ui/ux are page.js Systems; core/System/demo/page.jsonl line 1 names the class (shots/…core-System-demo/)
- 1 "Inbox tab slot" — yes — every System's strip shows an Inbox tab (shots/…framework-design/1920.png, the tab bar); it lists `page.inbox` and links to /framework/ai2/
- 2 "design, code, ux, ui become `new System`, keeping what each shows" — yes — the sheets show the same content under Overview · Inbox (· Docs); UI keeps its browse wall
- 2 "the framework AI page should probably be a system" — no — not in this diff (finding 1)
- 3 "core/System is a module: readme, page.js, doc/, linked from core children" — yes — all four are in the diff; the page shows all five systems as tiles
- 4 "write system/shape.md for the architect" — yes — system/shape.md exists
- Proof "zero console errors on ai/system, ai/skills, a task page" — not measured here; the AI pages were not shot

## Page structure
- page 1 — yes — each title plus its first line says what the page is (shots/…framework-design/1920.png, top band)
- page 2 — yes — Design and Code put their concept tiles first; on core/System a single sentence comes before the tiles
- page 3 — yes — the content runs tiles, then the intro, then the folded readme
- page 4 — n/a
- page 5 — yes — `System` was added to core/page.js `children:`
- page 6 — yes — each tab is a Doc section with its own url (/framework/core/System/demo/)
- page 7 — yes — the pages use Doc's own layout, with no new CSS
- page 8 — yes — the tab labels and tiles are plain words
- page 9 — no — the demo's Files box is mostly empty space (finding 2)
- page 10 — yes — tiles replace prose lists
- page 11 — yes — the section titles match the page as it was before
- page 12 — n/a

## Navigation
- nav 1 — tabs, a sidebar (the site rail), nested vertical tabs on the demo
- nav 2 — yes — tab_rows 1 at every width on design, code, ui, ux and core/System; the demo shows 2, but that is the vertical list (finding 5)
- nav 3 — yes — the tabs are Doc sections, each routed
- nav 4 — yes — `omit: "parts"` keeps each strip to 2–5 tabs
- nav 5 — yes — the site rail sits beside the main column at 3440 and folds at 400 (the sheets)
- nav 6 — yes
- nav 7–9 — n/a
- nav 10 — yes

## Layout
- layout 1 — no — one reading column on an empty screen at 3440 (empty 0.81 on design). This is Doc's layout from before this change, not new here
- layout 2 — yes — Docs three-region
- layout 3 — yes, except the demo's file viewer (finding 2)
- layout 4 — yes
- layout 5 — yes — Shell's demo filler gained `.pad`
- layout 6 — yes — the UX and UI walls sit in `bleed`
- layout 7 — no — demo `big_empty` true at 400, 1920 and 3440
- layout 8 — n/a
- layout 9 — yes
- layout 10 — yes
- layout 11 — no — one "UI" tile alone on the second row on Design (finding 3)
- layout 12 — yes

## Sizing
- sizing 13 — yes
- sizing 14 — yes
- sizing 15 — no — the demo's code viewer clips its one long line without saying so
- sizing 16 — yes
- sizing 17 — yes
- sizing 18 — yes — overflow_x false on every page at every width
- sizing 19 — yes

## Wrapping
- wrap 20 — yes — the only wraps are pre-existing headings on ui and Shell, plus the drawer buttons
- wrap 21 — yes — no wrap appears only under 1920
- wrap 22 — yes
- wrap 23 — yes — the 400 shots stack into one column
- wrap 24 — yes

## Spacing and padding
- space 33 — yes — left_stack 28px at 400 on every page
- space 34 — yes — one layer each (doc-well, page)
- space 35 — yes
- space 36 — yes — Shell's filler text no longer sits at 0
- space 37 — yes
- space 38 — yes
- space 39 — yes
- space 40 — yes
- space 41 — yes — no new CSS
- space 42 — yes

## Colour and contrast
- colour 1 — yes — the theme's own ink on the theme's own ground; nothing new
- colour 2 — yes
- colour 3 — yes — no new colours
- colour 4 — yes
- colour 5 — n/a — no new colour
- colour 6 — yes
- colour 7 — yes — the same tile style on every System
- colour 8 — yes — `small.c("muted")`

## Flow
- flow 25 — yes
- flow 26 — no — the demo's page.jsonl line runs past its viewer's edge
- flow 27 — yes
- flow 28 — yes
- flow 29 — n/a
- flow 30 — yes — widest_text stays at 720px or less on the five Systems (the demo is code, not prose)
- flow 31 — n/a
- flow 32 — yes — left_stack has one layer

## Words
- words 1 — yes — the core/System page shows the five systems as tiles and links the live demo
- words 2 — yes
- words 3 — no — one core/System paragraph runs about 75 words (finding 4)
- words 4 — yes
- words 5 — yes
- words 6 — n/a
- words 7 — yes — "System", "concepts", "Inbox" and "omit" mean the same thing everywhere they appear
- words 8 — yes — the systems and Concepts link to their pages
- words 9 — yes — the readme sits under the tiles and a live demo
- words 10 — yes
- words 11 — yes — but "AI is not a System yet" goes stale once the AI commit lands (finding 1)
