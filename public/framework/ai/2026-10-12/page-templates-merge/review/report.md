verdict: fix
1. [fix] The new Property page never says what it is (content 1, page 1). It shows a title, "listeners: 3" and a bare card of buttons, and its `description` ("One live value…") is not drawn on the page. A newcomer cannot say what they are meant to learn. See shots/…-core-Property/1200.png, band 2: the stray "listeners: 3" span sits above the card it counts.
2. [fix] The new Template page has the same problem (content 1). Under the title come five buttons and a muted counter line, with no sentence saying what a Template is or what the buttons do. The description is never drawn. See shots/…-core-Page-Template/1200.png, bands 2–3.
3. [note] The Property page is 85–92% empty at 1200–3440 (layout.json `empty` 0.845/0.892/0.92). The demo is one small card. That is acceptable for a tiny class, but one line of text and the class structure (`class Property extends Events(Object)`, plus bind/set/listeners) would fill the space with the "show the class" rule.
4. [note] The Page tab bar wraps to 3 rows at 1200 (layout.json `tab_rows` 3). This was already true before this change: Template went into the sidebar, not the tabs. It is recorded only so it is not blamed on this diff.
5. [note] At 400, the A/B demo headings and "THE PALETTE" wrap to 2 lines (layout.json `wraps`). That is normal for headings at phone width.

Widths given: 400, 1200, 1920, 3440 for all four pages (core, core/Page, core/Page/Template, core/Property).

## Requirements
- 1 "Merge qf-2 (core/Property, core/Page/Template)" — yes — the diff adds core/Property (Property.js, its test, page.js, readme) and core/Page/Template (Template.js, BigCard, TemplateDemo, page.js, readme, doc/templates.md). Both are linked from their parents: core/Page `children:` names Template, and core/page.js and core/readme.md name Property.
## Page structure
- page 1 (title says what it is) — no — Property and Template show only a one-word title. Neither has a lead sentence (shots/…-Property/1200.png, shots/…-Template/1200.png, top band).
- page 2 (one takeaway obvious) — no — the Property demo is buttons with no label explaining them. Template is a little clearer because of its A/B/C headings.
- page 3 (reachable by a visible link) — yes — the sidebar shows Core › Property and Page › Template (shots/…-Property/1200.png, sidebar).
- page 4 (show, don't tell) — yes — both pages are live demos, and Template adds an inspector beside each view (shots/…-Template/1920.png).
## Navigation
- page 13 — the sidebar tree, plus tabs on core/Page
- page 14 — no (already true before) — core/Page tab_rows 3 at 1200, 2 at 1920. Not changed by this diff.
- sidebar — yes — the current page is highlighted (Property, Template) at every width ≥1200.
- route — yes — each new page has its own URL (/framework/core/Property/, /framework/core/Page/Template/).
## Layout
- layout fits content — yes for Template (`width: "full"`, demo grid `--column 28em` gives views and inspector side by side at ≥1200). Partly for Property (standard layout, one small card, 92% empty at 3440).
- overflow — yes — overflow_x false on all pages at all widths.
## Sizing
- the Template view and inspector columns are sized well — yes — side by side at 1200/1920/3440, stacked at 400 (sheet.png).
- the Property card hugs its content — yes — shots/…-Property/1920.png.
## Wrapping
- no unwanted wraps — yes — only headings at 400 wrap (Template h1/h2). The drawer-rail/mode-btn wraps are site chrome and the same on every page.
## Spacing and padding
- left padding scales — yes — h1 left stack 28/38/67/90 px at 400/1200/1920/3440 on all pages.
- gaps between bands — yes — band y-steps are regular. The Template `wide` bands are big_empty at 1920/3440 because the inspector is shorter than the stacked views, which is acceptable.
## Colour and contrast
- contrast — yes — the BigCard uses the palette grounds (bg-prime, bg-white, bg-dark) with readable text (shots/…-Template/1920.png). The muted counter line is small and light but legible.
## Flow
- reading order — no (small) — on Property the "listeners" count comes before the card it describes (band 2 above band 3).
- Template order — yes — controls, then counter, then A, B and C in turn.
## Words
- content 1 (plain sentence first) — no — neither new page draws a sentence. The readmes do this well ("Template — a page that renders many times, each time from its own data").
- content 2 (names consistent) — yes — Template, BigCard, Property and Property.Map are used the same way in the readme, the doc and the code.
- content 3 (no jargon without explanation) — no (small) — button labels like "unbind one" and "drop one view of B" assume the reader knows the binding model.
