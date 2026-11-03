verdict: fix
1. [fix] At 1920 and 3440 the model page's paragraphs run the full wide track, far past a reading measure (layout: sizing, line length) — layout.json widest_text 1079 at 1920 and 1706 at 3440; shots/…-navigation-model/3440.png, the intro paragraph and section 1 run ~200 characters a line. Keep the prose in the reading track and let only the cards and demos go wide.
2. [note] The workspace demo page is 86–87% empty at 1920/3440 (layout.json empty 0.861 / 0.873): three panes holding one line each. It proves fill and zero padding, but a pane with some content would show it better.
3. [note] "On this page" appears only from 1920 up (layout.json toc band absent at 1200), and at 3440 five of its entries wrap to 2 lines (toc-link wraps) because the column is narrow.
4. [note] Keep list: the page says "81 before, 25 kept, 56 retired", but only Family tree has moved (manifest.json has one entry). The brief allows this (apply only unlinked pages), and the page says so plainly.
5. [note] The parent page /framework/core/Page/navigation/ has tab_rows 3 at 1200. This was already there: the diff only adds one line and `children: "model"`.
6. [note] The sidebar truncates the new page's label to "Navigation: one …" at every width (shots/…-navigation-model/1200.png, left rail). A shorter `label:` such as "One model" would fit.

Widths given: 400, 1200, 1920 and 3440 for all seven pages.

## Requirements
- 1 "One page, core/Page/navigation/model/, title 'Navigation: one model'" — yes — shots/…-navigation-model/1200.png, title band
- 1 "four questions in one line each, then the answer shown" — yes — four Q/A cards above the fold at 1200 and 3440; the live rail is the demo
- 1 "live demo on a real five-level slice … at 1200 and 3440" — yes — the left rail is opened along Framework → Core → Page → Navigation → model in 1200.png and 3440.png
- 1 "Left sidebar: one tree … breadcrumb carries the ancestors" — yes — NavModel.section_of plus page text; rail in shots
- 1 "Right column 'on this page' … three or more headings" — yes — the toc shows at 1920/3440 (it is hidden at 1200, note 3)
- 1 "kind: document | workspace" — yes — NavModel.kind, and workspace/ is a real workspace page (…-workspace/sheet.png)
- 1 "Link activation … ?in=<ancestor>. One rule, written once" — yes — NavModel.opens(), the Router demo row
- 1 "Each part: a one-line decision with the alternative and why it lost" — yes — the decisions table in the diff (lines 108–113)
- 1 "Reuse … Build no second navigation system" — yes — the reuse paragraph; core changes kept in doc/core-changes.md, and Sidebar/Router/Page are untouched
- 2 "The layouts that survive … counts before and after" — yes — 81 → 25 kept / 56 retired; keep table with links and reasons
- 2 "node script with --plan … git mv with a manifest, --apply only for unlinked" — yes — layouts/archive/retire.mjs, manifest.json (1 move)
- 3 "Where the template library stands … five lines" — yes — the Exists / Missing / Next step section
- 4 "check_page at 400/1200/1920/3440" — yes — shots/ holds four widths per page
- 4 "linked from navigation/readme.md and core/Page/readme.md" — yes — both diffs add the link
- 4 "card report, landing line, merge.mjs" — n/a — these come after the review
## Page structure
- page 1 (title says what it is) — yes — 1200.png title band
- page 2 (level 1 above the fold) — yes — the questions and answers fit the first screen at 1200 and 3440; at 400 they fill it
- page 3 (detail nested below) — yes — the numbered sections follow the cards
## Navigation
- techniques — a sidebar (tree), a right toc column, a bottom rail plus menu at 400
- sidebar shows the active path — yes — 1200.png rail, the "Navigation: one …" row is highlighted
- labels fit — no (note) — the label is truncated (note 6)
- reachable on a phone — yes — 400.png bottom rail ⋯ / menu
## Layout
- the layout fits the page's job — yes — a document with a wide card grid; the workspace child fills
- columns collapse on narrow screens — yes — 400.png: the Q/A cards stack one per row
## Sizing
- reading measure held — no — widest_text 1706 at 3440, 1079 at 1920 (finding 1)
- no horizontal overflow — yes — overflow_x false at every width, all pages
## Wrapping
- headings wrap sensibly — yes — h2 "2. Nest or swap" wraps to 2 lines at 1200, which is acceptable
- toc wraps — note — 5 toc-links take 2 lines at 3440 (note 3)
- parent page tabs — no (pre-existing) — tab_rows 3 at 1200 on /navigation/ (note 5)
## Spacing and padding
- card padding and gaps are even — yes — 1200.png Q/A grid
- workspace has zero padding — yes — …-workspace/1200.png, panes are edge to edge
- empty space — note — workspace 87% empty at 3440 (note 2); model page empty 0.673 at 3440
## Colour and contrast
- text contrast — yes — dark text on white cards and the light-grey page; the muted question line is still readable
- accent used for state only — yes — the active rail row and the active toc entry
## Flow
- top-down order: question → answer → demo → detail — yes — cards, then "The rail on your left is the answer, live", then sections 1–4, then layouts and templates
## Words
- plain full sentences — yes — the intro and the card answers
- one takeaway per section — yes — each h2 states its rule ("1. The left sidebar lists sub pages")
- names link — yes — Sidebar, Router, ext/toc, layouts and Template are all links
