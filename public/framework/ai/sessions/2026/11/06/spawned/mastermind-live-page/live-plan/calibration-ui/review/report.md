verdict: fix
1. [fix] Requirement 3 (drop the storage dot on cards) is not met for saved-screen cards: "Restart check" and "Nov 6 scratch" still draw the dot at 400 and 1200 (shots/127-0-0-1-50322-live/sheet.png, "Saved screens" band). The diff only removed the dot fallback in the non-PageLink branch (`P.stored.item`); a PageLink card still gets its dot through `P.link_icon` (the `P.glyph($icon, fallback)` line).
2. [fix] Proof is incomplete (requirements "Proof"). The shots folder holds only `/live/` at 400 and 1200. The asked-for pages (`/live/calibration/` before and after at 400, 1200 after, `/live/item-test/`, `/live/done/`) are not in `shots/`. The diff adds `proof/{before-400,after-400,after-1200}.png` but there is no `proof/` folder in the task folder as it stands, and there are no item-test or done shots. So requirement 4's code-block bleed and the corner chevron on a card with code (the earlier attempt's failure) were not checked on anything I was given.
3. [fix] The task folder cannot carry a fresh agent. `session.jsonl` has no log line with the branch, commits, shot paths, test results (`LivePage.test.mjs`, `PageUI.test.mjs`) or smoke result, and no close outcome, which the requirements asked for. The diff shows no edit to `public/live/LivePage.test.mjs`, so the new `icon_of_title` and `emoji_icons` have no test (agents.md law 12 asks for one on first change).
4. [fix] Index and readme gaps. `public/live/readme.md` gained the card-icon line, but the "The icon is…" bullet above it still says every card that links to a page shows that page's icon with the stored-dot fallback, while the new bullet says cards show no dot. These contradict for PageLink cards (see finding 1). Fix whichever is wrong. `calibration-ui` has no entry or link in the live-plan folder readme (git grep found none), so it is unindexed.
5. [note] Hierarchy: card titles are now .8rem (about 12.8px) bold while the card text under them is clearly larger (sheet.png, "Process logging" at 400 and 1200). Title is smaller than the H1 as asked, but smaller than its own body text too. This may read as inverted; the owner should judge it.
6. [note] `strip_emoji` is off for PageLink, so a link card (`part-link`) with an emoji title keeps the emoji. The requirements ask for the mapping on both `part-card` and `part-link`.
7. [note] The chevron is a small bottom-right mark with no reserved column, and it does not overlap text or leave the card at 400 or 1200 (sheet.png, every card). The bottom padding added to linked cards makes short cards (Truth, Prompt calibration) a little tall.

## Requirements
Widths given: 400 and 1200 for `/live/` only.
- 1 Icons Material, not emoji — partly — shots show Material glyphs on Process logging, Prompt calibration, Truth; PageLink emoji handling not applied (note 6); no emoji-titled card was in the shots
- 1b readme line for `icon:` — yes — public/live/readme.md diff
- 2 Card titles smaller than the H1 at every width — yes — fixed .8rem vs .live-title 1.05rem, same at 400 and 1200 (note 5)
- 3 Drop the dot on cards — no — saved-screen cards still show it (finding 1)
- 4 Chevron to the bottom-right corner, no reserved column — yes — sheet.png, text runs the full card width
- 4b Whole card stays one link — yes — `::after` stretched link unchanged in the diff
- 4c Code blocks bleed and scroll sideways — not verified — no shot of a card with code; rule moved out of the media query in the diff
- Proof (before/after shots, item-test, done, tests, smoke) — no — findings 2 and 3
- Live instances page for the new class/table? — n/a, no new class (a static table on LivePage)
## Page structure
- page 1 — yes — shots/127-0-0-1-50322-live/sheet.png: the title "Live", tabs, cards; the one link per card is clear
## Navigation
- page 1 — tabs, a bottom rail at 400, a gear
- tab row — yes — layout.json tab_rows 1 at 400
## Layout
- yes — sheet.png: one column of full-width cards at both widths; empty share 0.478 at 400
## Sizing
- yes — layout.json widest_text 370 at 400, no overflow_x; at 1200 cards fill a centred column
## Wrapping
- yes — layout.json wraps lists only the drawer rail buttons (`drawer-rail-ai`, `drawer-rail-menu`, 3.2 lines), which are not part of this change; card titles do not wrap
## Spacing and padding
- mostly — the bottom padding for the chevron adds a little extra height to short linked cards (note 7); no band is oversized (layout.json live-scroll share 0.828)
## Colour and contrast
- yes — icons and the chevron use currentColor, the chevron is at opacity .45 and still visible in sheet.png
## Flow
- yes — head, tabs, cards, saved screens, removed cards, links, status, in order
## Words
- yes — the readme line states what to do ("a Material name, never an emoji") and gives an example; the code comments are long but explain a real specificity trap
