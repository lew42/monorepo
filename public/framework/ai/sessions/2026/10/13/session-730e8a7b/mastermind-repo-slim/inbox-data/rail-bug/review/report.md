verdict: fix
1. [fix] Requirements 5: no before/after shots of the bug case. The only shots are `/framework/ai/` showing Live, not a rail row such as Today (`2026-10-13`) or Your prompts opened beside the rail, so the fix is unproven at 1200 and 400 (shots/127-0-0-1-50564-framework-ai/sheet.png).
2. [fix] Page structure: at 1200 the Decision card in the rail breaks its title one word per line ("The / old / day / folde / r / cam / e"), the title column is far too narrow (sheet.png, 1200 left rail, bottom card). Not in the diff, but it is visible on the page under review.
3. [note] Requirements 3: the diff turns the AI h1 into a link to `this.url` and adds `.inbox-head-home` CSS. The link is not visible in any shot, so it is judged from the code only, with no hover or focus evidence.
4. [note] Requirements 4: back and reload land in the same place only because `RAIL_ID` now matches `\d{4}-\d{2}-\d{2}` and `your-prompts`. This was not exercised in a shot.
5. [note] Sizing: at 400 `drawer-rail-ai` and `drawer-rail-menu` wrap to 3.2 lines (layout.json wraps), which looks like the bottom bar labels stacking. It is probably not from this diff.
6. [note] Widths given: 400 and 1200 only, which is correct for a small header and routing change.

## Requirements
- 1 "reproduce on michael/dev; find the cause" — yes — the diff's `RAIL_ID` comment names the cause: day pages and Your prompts were not in the rail-page list, so the rail stepped aside.
- 2 "fix so the rail stays and only the right side changes" — not shown — shots show Live beside the rail, not a day page; the code change is plausible (sheet.png, 1200: rail stays beside Live)
- 3 "the AI header navigates back" — not shown — a link is added in the code, but it is not visible in the shots
- 4 "back/reload land in the same place" — not shown — no evidence either way
- 5 "before/after shots at 1200 and 400" — no — only one after-state page, no before shots, and it is not the bug case
## Page structure
- page 1 (title says what it is) — yes — sheet.png: "AI" with icon and tabs at the top
- page 2 (one clear primary area) — yes — the rail is the switcher and the right side holds the page (sheet.png, 1200)
- page 3 (nothing overlaps or hides) — no — at 400 the rail is replaced by an "← all cards" back link, as designed; at 1200 the rail card titles are cut off (finding 2)
## Navigation
- identify — tabs (Inbox, Dashboard, Log, System, Sessions, Tests), a left sidebar, an inbox rail with a bottom bar at 400
- tabs — yes — tab_rows 1 at 1200; tab_rows 2 at 400 (layout.json), acceptable
- rail as switcher — yes at 1200 (sheet.png, rail stays beside Live)
- way back — not shown — the header link is not visible
- bottom bar — n/a
- sheet, modal, full screen — n/a
## Layout
- left/right split at 1200 — yes — rail about 400px, content beside it (sheet.png)
- stack at 400 — yes — one column with a back link (layout.json bands: ai2-back, ai2-full)
## Sizing
- rail width suits its content — no — the Decision card title is squeezed (finding 2)
- overflow_x — no overflow — layout.json overflow_x false at both widths
## Wrapping
- tab bar — yes — tab_rows 1 at 1200, 2 at 400
- other wraps — no — wraps `drawer-rail-ai` and `drawer-rail-menu` at 400 are 3.2 lines; `mode-btn` and `drawer-menu` at 1200 are 1.7–1.8 lines (layout.json)
## Spacing and padding
- h1 padding — yes — left_stack h1 total 14 at 400, 19 at 1200 (layout.json)
- empty space — yes — empty 0.398 at 400, 0.42 at 1200; band ink is reasonable
## Colour and contrast
- yes — sheet.png: dark text on light grey, orange accents for the active state; the link is `color: inherit`, so the heading colour is unchanged
## Flow
- reading order top to bottom — yes — head, tabs, then rail and page (sheet.png)
- the AI heading looks clickable — not shown — `text-decoration: none`, with only a `title` tooltip as the hint
## Words
- "Back to the AI inbox" tooltip — yes — says what it does
- doc note sentence — yes — `ai-page-notes.md` states the rule and the date plainly
- link on every mention — n/a
