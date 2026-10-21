verdict: fix
1. [fix] Requirement 1 (reconnect, failures in a log the owner can open) is not shown in this diff or shots: the diff holds only a `Sheet.js` min-height clamp, a surfaces `md()` paragraph and the after PNGs; `shots/reconnect-up.png` and `reconnect-down.png` are not evidence of a log line or a button retry. Show the Connection change and the log link, or say it landed in an earlier commit.
2. [fix] Requirement 3 "the page behind stays visible" is only partly met: at 60% (`shots/after/sheet-001.png`) the page shows just the title and tabs; by `sheet-009.png` (90% snap) the page is fully covered, which the owner accepts as snap-open. But the Done-when 400 and 1200 `check_page` run is not shown.
3. [note] `layout.json` wraps at 400: the bottom rail buttons `drawer-rail-ai` and `drawer-rail-menu` report 3.2 lines (icon stacked over label, likely by design), and the page title wraps to 2 lines ("Voice and chat surfaces").
4. [note] `shots/after/sheet-001.png`: the compact sheet head ("AI ▾ New session /framework/ux/Dictate/ × ") has no grey down-arrow button, which meets the "remove or make obvious" ask; the "New session" chip is a solid orange block that reads heavier than the rest of the header.
5. [note] The footer mic row in `sheet-021.png` has a grey fill that differs from the white head, so the two sticky rows do not match.

## Requirements
- 1 Reconnect after a Servex restart, failures logged — no — not in the diff; only `reconnect-up/down.png`, no log shown
- 2 Screenshot series every 40 px on the surfaces page — yes — `after/sheet-000…021` and `before/` 0–17; surfaces/page.js gains the series and a how-to-read paragraph
- 3 One three-row layout (header, well, mic footer), no switching — yes — `after/sheet-009.png`: same head, edge-to-edge well, footer at every step
- 3 Well has side padding only, no radius — yes — `sheet-009.png`: bubbles scroll under the head and footer
- 3 Grey down-arrow gone or clear — yes — `sheet-001.png` shows only a × close
- 3 Page behind visible, 90% snap kept — yes — `sheet-001.png`, `sheet-021.png`; full cover at snap, as asked
- 4 Earlier chat-well instructions honoured — yes — bubble text in `sheet-009.png` echoes them
- Done-when: asks.md ticked and readme updated — not measured — not in this diff
## Page structure
- Widths given: 400, 1200, 1920, 3440 of `/framework/ux/Dictate/surfaces/` (`sheet.png`)
- page 1 — yes — `1200.png`: title "Voice and chat surfaces" says what it is
- Sections lead with a short intro, then the series — yes — `layout.json` bands: page-title, md, md, grid
## Navigation
- Techniques: tabs, a sidebar, a bottom rail, a sheet
- Tabs wrap — no at 400 (tab_rows 1), 1200 and 1920 are 2 rows — `layout.json tab_rows 2`
- Bottom rail at 400 — yes — `sheet-021.png`: ✦ rail present, sheet closes with ×
- Sheet has a clear close and a drag grip — yes — `sheet-001.png`
## Layout
- Single column at 400, grid after — yes — `layout: doc`, `overflow_x false`
- Three rows only grow — yes — `after/sheet-001…009`
## Sizing
- Sheet never under head plus footer — yes — the diff clamps to `Size.STRIP`; `sheet-021.png` shows both rows intact
- Widest text line — yes — 343 at 400, 594 at 1200, 637 at 1920, 716 at 3440
## Wrapping
- Unexpected wraps — no — `layout.json wraps` at 400: `page-title` 2 lines, rail buttons 3.2 lines (finding 3)
## Spacing and padding
- Well side padding only — yes — `sheet-009.png`
- Empty share — note — `empty` 0.27 at 400, 0.40 at 1200, 0.55 at 1920, 0.70 at 3440; the doc page's own width, not the sheet's
## Colour and contrast
- Bubbles legible — yes — `sheet-009.png`: dark text on grey and peach
- Footer fill matches head — no — finding 5
## Flow
- Order head, well, footer — yes — `sheet-009.png`
- Opening click to snap is one continuous series — yes — 22 shots
## Words
- Paragraph "How to read the steps" — yes — plain, with the before and after step numbers given
- Labels ("New session", "Listening · sends when you pause") — yes — `sheet-001.png`
