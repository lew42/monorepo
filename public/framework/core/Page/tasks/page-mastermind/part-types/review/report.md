verdict: pass
1. [note] On the demo you can't tell which block is which type at a glance (requirement 3; content: one takeaway per demo). part-link and part-file get a separate grey code label above them. part-card and part-view name themselves in their own title. part-heading and part-text have no label at all. The part-link line's own title "part-link" is also replaced by the linked page's title, "Item readme, as parts" (PageLink shows the child's first line). One small label above each of the six blocks would fix it. Evidence: shots/…-parts-types/1200.png, middle band.
2. [note] The part-file block drops `notes.md`'s own `# A markdown file, drawn in place` heading. The block then starts mid-thought ("This block is notes.md…"). Evidence: shots/…-parts-types/1200.png, part-file band.
3. [note] The demo's `doc/types-1200.png` is the same file as `doc/live-before.png` (same md5). So the committed 1200 shot shows the page without the "Added while open" card, which `page.jsonl` now holds. The live proof itself stands: live-before and live-after differ.
4. [note] `types/Meter.js` sets its bar's height and background with inline `.style(...)` instead of a class in CSS. That is fine for a tiny demo module, but it is the first example agents will copy.

Widths given: 400, 1200, 1920, 3440 for both pages (/framework/core/Page/parts/ and /parts/types/).

## Requirements
- 1 "Add PageView.js (part-view) and PageFile.js (part-file) … add both to kinds.js" — yes — diff: parts/PageView.js, parts/PageFile.js, kinds.js PART_TYPES lists 6
- 1a "make the two parts and place share one implementation … log a decision line naming the alternative" — yes — the parts call page.draw_module / page.draw_md; session.jsonl decision 21:55 names "move the methods into the parts" as the alternative
- 2 "Tests: part-view and part-file accepted and replay into the two new classes; part-nope refused, refusal lists the types" — yes — item_tool.test.mjs new block; Page.test.mjs 1b replays to PageView:v, PageFile:f
- 3 "Demo … one page with one part of each of the six types, a tiny View module, part-file at a real .md" — yes — parts/types/page.jsonl, Meter.js, notes.md; shots/…-parts-types/1200.png shows all six (labels uneven, finding 1)
- 4 "Docs: ai-api.md the two new types + part-text note; parts/readme.md the six types" — yes — both in diff
- 5 "Prove it … shots at 400/1200/1920/3440 in the demo's doc/ … live append redraws without reload" — yes — types/doc/ holds 4 widths + live-before/after (finding 3)
- 6 "Log ready … send mastermind-page one line" — n/a (not visible in the diff)
- Class page: "can you open a page that shows its live instances?" — no — PageView/PageFile hold no state the owner would watch; the demo page shows one live instance of each (note only, not listed)
- Index (law 10): types/ is linked from parts/page.jsonl (types-link card) and appears in the sidebar — yes — shots/…-parts/1200.png, "Part types" card

## Page structure
- page title says what it is — yes — shots/…-parts-types/1200.png top band: "Part types"
- one takeaway — yes, but weakened — the h2 "The six part types, one each" states it; the labels don't carry it through (finding 1)
- most important first — yes — heading and intro, then the blocks in kinds.js order
- reachable by a click — yes — Parts page "Part types" card; sidebar under Parts

## Navigation
- identify — a sidebar (desktop), a bottom rail (400)
- sidebar marks the current page — yes — 1200.png sidebar: "Part types" highlighted
- bottom rail at 400 — yes — 400.png bottom band: logo, menu, AI
- stable navigation — yes — same chrome on both pages, every width

## Layout
- layout fits the content (a short single column) — yes — layout.json layout "standard" at every width
- no horizontal overflow — yes — overflow_x false at all four widths
- columns — n/a
- wide screens use the space — yes for a reading page — empty 0.70 at 1920 and 0.80 at 3440 is the measure cap on a single column; the chat panel takes the right edge

## Sizing
- reading measure — yes — widest_text 295/508/545/613 px at 400/1200/1920/3440
- cards and the meter are sized to the column — yes — 1200.png: the cards and the meter bar fill the 560px column
- title size proportional — yes — page-title band share 0.04–0.053

## Wrapping
- headings that wrap badly — no — the h2 wraps to 2 lines at 400 ("The six part types, / one each"), a clean break (layout.json wraps)
- tab rows — n/a (tab_rows 0)
- controls that wrap — the drawer-rail buttons are listed in wraps at 3.2 lines at 400, but they are icon-over-label rail buttons, so that is by design; on the frame, not this diff

## Spacing and padding
- left stack consistent — yes — h1 28/38/54 px, p 42/56/74 px; scales with width
- gaps between blocks even — yes — 1200.png: same gap between each card and its code label
- the part-file list after the paragraph — yes — the gap is a little large but within rhythm (1200.png)
- padding inside the cards — yes — matches the existing part-card

## Colour and contrast
- text contrast — yes — dark grey on light grey/white, every shot
- meter bar — yes — currentColor, dark on white (1200.png)
- code labels readable — yes — grey chip, dark mono text

## Flow
- top-down reading order — yes — heading → text → card → link → view → file → live card
- nothing big and empty — yes — big_empty false for every band
- the Parts page link card sits at the end of its content — yes — shots/…-parts/1200.png

## Words
- plain sentences, no jargon standing in — yes — intro and notes.md read plainly
- every block explains itself — partly — finding 1 (labels), finding 2 (missing heading)
- ai-api.md row text is clear for a new coder — yes — it gives the line, then what happens
- readme Index bullet — yes but long — one sentence covers all six types; acceptable as an index line
