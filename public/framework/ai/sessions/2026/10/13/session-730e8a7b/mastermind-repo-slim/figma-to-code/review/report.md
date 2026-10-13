verdict: fix
1. [fix] The colour swatches and the "All 24 variables" summary that page.js now adds don't appear in the shots: at 400 the `prime` row shows no swatch, though both sides are hex (`#ff6157` / `#FF6157` in map.json), and the table is open with no summary line above it (shots/…tokens/400.png, band 5). Either the shots were taken before the 17:12 fix, or the swatch and `details` code does not render. Re-shoot to prove which.
2. [fix] The new token section is only shown at 400. The 1200, 1920 and 3440 shots are scrolled to the page bottom (layout.json table y -4150 at 1200, ink 0), so the table is never seen at desktop widths (page 1 / layout 1).
3. [note] At 400 the table is 1.86 screens tall (layout.json table share 1.863), and every "Relation" cell wraps to two lines. Shorter labels ("same", "role", "Figma only"), with the note in a `title` tooltip, would halve it (wrapping 1).
4. [note] The inline links "doc/token-sync.md" and "doc/round-trip.md" are now markdown links in page.js. In the 400 shot they are the same colour as body text, so they don't look like links (content: link every mention).
5. [note] round-trip.md's first line says "the Figma file has many pages", while the computed count right below says 36. Say "36 pages, 6 coded" in the headline (words 1).
6. [note] The `drawer-rail-ai` and `drawer-rail-menu` wraps at 400 (3.2 lines) are existing chrome, not this change.

Widths given: 400, 1200, 1920, 3440 for /framework/ext/Figma/tokens/.

## Requirements
- 1 "The inventory, computed" — yes — Server/figma-roundtrip.mjs writes roundtrip.jsonl and figma-pages.md; the counts agree, 36 live pages = 36 rows (round-trip.md counts block)
- 2 "The token link" — yes — tokens/map.json holds 24 rows (5 same value, 2 same name, 9 same role, 6 Figma only, 2 skipped), and they are rendered on the tokens page; next.md says sync.js syncs nothing and gives the first slice
- 3 "The question, answered as an owner_note (decision)" — yes — task.jsonl log 17:12: the owner_note was posted at /framework/ai/2026/10/13/figma-mock-ups-yes-for-looking-no-as-a-s/; the long form is in round-trip.md, with the trade-off and the alternative
- 4 "Coordination" — yes — task.jsonl log: the map link and the dark/fluid ask were sent to ds-lists-cards; the replies from ds-lists-cards and web-ground are recorded in round-trip.md
- 5 "Report on your card" — not verifiable — the card was not in what I was given
## Page structure
- page 1 — yes — 400.png: the title "Figma tokens" and an intro say what the page is
- page structure: new section — yes — the h3 "Figma variable → site property" plus a one-line summary with counts, then the detail inside `details`
## Navigation
- navigation 1 — a sidebar (desktop), a bottom rail (400), one `details` disclosure
- disclosure closed by default — not shown — the table renders open with no visible summary (finding 1)
## Layout
- layout 1 — partly — standard layout at every width (layout.json `layout: standard`); the new section is visible only at 400
## Sizing
- sizing — yes — overflow_x false at all four widths; widest text 343 / 596 / 639 / 719 px
## Wrapping
- wrapping 1 — no (note) — the Relation column wraps every row to 2 lines at 400 (finding 3)
- tab_rows — n/a
## Spacing and padding
- left edge — yes — the p left stack is 28 / 38 / 67 / 90 px from 400 to 3440, all from the page pad (layout.json left_stack)
## Colour and contrast
- contrast — yes — dark text on a light ground, table header tinted (400.png band 5); the swatches are not visible (finding 1)
## Flow
- flow — yes — 400.png: intro → h3 → summary → table → Schemes, with even section gaps
## Words
- words 1 — mostly — round-trip.md opens with the answer in four plain lines; "many pages" should be the number (finding 5)
- words: recommendation — yes — two sentences, the trade-off and the alternative stated plainly
