verdict: fix
1. [fix] Color Schemes is still a narrow single column at wide screens (layout: use of space), although STATE.md says the "full width" fix landed in `595d46a80`. The cards are about 360px wide at 1200 and about 720px at 3440, so 86% of the 3440 shot is empty: shots/framework-ext-Figma-colors/sheet.png, and layout.json `empty` 0.68 / 0.77 / 0.86 at 1200 / 1920 / 3440.
2. [fix] Buttons on the prime ground still have white text (about 2:1), which breaks decision 2 ("ink on prime is dark") and the contrast rule. Seen on CHOOSE PLAN and SUBMIT: shots/framework-ext-Figma-palette-pricing/1920.png, card band; shots/framework-ext-Figma-palette-controls/1920.png, form cards.
3. [note] Every Figma page shows its title twice: the page title, then the frame's own uppercase h1 ("Pricing & Dashboard" / "PRICING & DASHBOARD"). At 400 both lines wrap to 2 lines (layout.json wraps, h1.page-title and h1.h1).
4. [note] At 3440 the pricing cards stretch to about 830px each, with the price and the button far apart. Give them a max width: shots/framework-ext-Figma-palette-pricing/3440.png.
5. [note] The card's home, /framework/ui/card/, opens with a View card (thick black border), not a plain `.card`. The one card this task defines is not the first thing shown: shots/framework-ui-card/1920.png, top band.
6. [note] On the Figma tasks and timeline pages, card headings wrap 5 to 8 lines at 400 ("Update release notes…" 8 lines, layout.json). The columns do not drop to one at that width.
7. [note] The sweep shot 101 pages, many of them outside this task. castin/styles shows "Page Load Error" (h1.h1 wrap at 400), so check that it loads, though it is probably unrelated to this diff.

Widths given: 400, 1200, 1920, 3440 for all 101 pages. layout.json: overflow_x false everywhere. tab_rows > 1 only on DesignTool/taste (4) and servex/lifecycle (2), neither of which this task touched.

## Requirements
- 1 "Tokens: few, reusable — `--prime`, `--light`, `--dark`, keep `--prim` alias, migrate by script, lighten/darken by one rule" — yes — diff adds `--prime` and the darken/lighten steps (`--darken-1..3`, `.bg-darken`); STATE.md records rename-tokens.mjs, 1,305 replacements, with a manifest
- 2 "Utility classes: `bg-white`, `bg-prime`… keep it tiny" — yes — four grounds, shown live on shots/framework-styles/1920.png, "system on one screen" band
- 3 "One card everywhere… a section defined… card() helper?" — yes — the pricing, controls and scheme pages all use `.card` plus a ground (shots/…palette-pricing, …controls, …palette); a nested card steps darker; Section = core/Section; no helper, decided
- 4 "Which page is the card page" — yes, with a note — /framework/ui/card/ is the home, and core/Page/card is marked superseded; but the home leads with a View card (finding 5)
- 5 "Where styles live… names and scopes at the top of each page" — yes — "What goes here / Next door" lines on Style library (shots/framework-styles/1920.png, intro band), Code: CSS and Design (diff lines 4569, 5202)
- 6 "Figma subpages real routed pages" — yes — FigmaFilePage, FigmaPagePage and FigmaComparePage are added; each palette subpage has its own URL and its own shot folder
- Order: past-work audit first — yes (styles/doc/past-work.md); architecture page before build — yes (/framework/styles/); CSS line count by script — yes (css-lines.mjs, 2,235 → 322 lines, 205 → 4 raw colours)
- "Make the Figma scheme show `--prime`, not blue" — yes — orange prime on every Figma shot
## Page structure
- page 1 (title says what it is) — yes — "Style library", "Card", "Controls", "Pricing & Dashboard"
- page 2 (one takeaway shown above the fold) — yes — shots/framework-styles/1920.png: four grounds as live cards above the fold
- page 3 (no duplicate title) — no — Figma pages repeat their title (finding 3)
- page 4 (level-1 detail nested) — yes — Style library: TOC on the right, sections below
## Navigation
- page 13 — a sidebar, a right TOC, and tabs (OVERVIEW/API/DOCS/FILES on ui/card)
- page 14 (tabs on one row) — yes — tab_rows 0 on every touched page
- sidebar (the current page is marked) — yes — "Style library" highlighted, shots/framework-styles/1920.png
- routes (each view has a URL) — yes — Figma subpages routed (requirement 6)
## Layout
- uses the width it is given — no — Color Schemes (finding 1); the Style library grid, pricing and controls fill their width
- columns collapse at 400 — yes for pricing, controls and palette (they stack in the 400 shots); no for tasks and timeline headings (finding 6)
- no horizontal overflow — yes — overflow_x false at all widths
## Sizing
- cards sized to their content — partly — pricing cards about 830px at 3440 (finding 4)
- text measure readable — yes — widest_text 562–678px on the pricing page
## Wrapping
- headings do not wrap needlessly — no (note) — the Figma double title wraps at 400; tasks headings wrap 5 lines at 400; "Grounds — the same card, four…" wraps 4 lines at 400 on ui/card
- buttons do not wrap — mostly — hero "GET STARTED" / "LEARN MORE" wrap to 2 lines at 400 (layout.json)
## Spacing and padding
- default padding inside cards — yes — even padding on every ground, shots/framework-styles/1920.png
- breathing room between cards — yes — gap visible on the pricing, controls and palette shots
- left edges align — yes — left_stack h1 and p totals are equal at each width (28/38/67/90)
## Colour and contrast
- tokens, not raw colours — yes — 205 → 4 raw colours by census
- text on each ground passes — yes for body text — Color Schemes measures white 17.4:1, prime 7.7:1, nested 14.5:1 and 5.6:1 (shots/framework-ext-Figma-colors/1200.png)
- controls on prime pass — no — white button text on prime (finding 2)
- nested card steps one shade — yes — visible on all four grounds
## Flow
- most important first — yes — Style library opens with the system on one screen; Figma pages open with the composition
- the reader knows where to go next — yes — Next door links on every scope page
## Words
- content 1 (plain sentences, no clipped jargon) — yes — "A card on this ground; the ink comes with it."
- content 2 (names consistent) — yes — "ground", "card", "prime" used the same way across Style library, ui/card and the Figma pages
- content 3 (short intros) — yes — Color Schemes intro is 3 sentences
