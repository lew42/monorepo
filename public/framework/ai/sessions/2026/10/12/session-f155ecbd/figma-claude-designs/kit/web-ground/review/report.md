verdict: fix
1. [fix] Ask 1 wants the contrast note from DS 1.2 shown on the demo page beside the schemes. The diff puts it only in `doc/token-sync.md`; `tokens/page.js` adds the Near-black swatch with no note (requirements 1).
2. [fix] Ask 2's sheet is never shown. The new "Dropdown as a bottom sheet (DS 2.6 C)" heading holds one paragraph and no select. On a phone the demo selects start closed, and shots/…/400.png has no open sheet, so the reviewer cannot see it works. The sheet has no widget under its own heading (CLAUDE.md "show it", page 1).
3. [fix] The `page.js` diff changes the "Español / Français" line although the visible text is identical. That is a likely encoding or byte change, and the shot at 1200 doesn't let me confirm the accents survived (words). Check that the bytes are intact.
4. [note] Indentation in `page.js` is off: the new `p(...)` and the following `h3` carry an extra tab (code).
5. [note] At 3440 the dark and near-black cards are clipped at the right edge: a toggle icon is cut off at the card edge in shots/…/3440.png. `layout.json` shows no overflow_x at 400, but that is not measured for 3440 in the part I read.
6. [note] The sheet is not shown by the `.fig-mobile` class and does not work inside `.fig-lay`. Both limits are documented in `doc/controls.md`, which is good, but the demo's phone layouts demo is a `.fig-lay`, so it cannot demo the sheet there.
7. [note] Shots given: all four widths (400, 1200, 1920, 3440), one page.

## Requirements
(`requirements.md` is absent; I used the two numbered asks in `kit/brief-web-ground.md`.)
- 1 ".fig-near-black … generated, opt-in" — yes — `tokens.css` has `.fig-near-black`, built from `FigmaTokens.derived`; accent unchanged (`--fig-prime`)
- 1 "show it beside the others" — yes — the Near-black column sits next to Dark in shots/…/1200.png and 1920.png
- 1 "with the contrast note from DS 1.2" — no — the note is only in the docs, not on the page
- 2 "bottom sheet under a phone width" — yes in CSS (max-width 599px, scrim, grabber, safe-area inset); not shown in any shot
- 2 "Popover or FigSelect, say which and why" — yes — `doc/controls.md` says not `ux/Popover`, with reason
- 2 "nothing outside .fig-* changes appearance" — yes — the rules are all `.fig-*` inside the opt-in `tokens.css`
- Docs updated — yes — `controls.md`, `token-sync.md`
## Page structure
- page 1 — no — the sheet heading has no demo under it (finding 2)
- title and purpose — yes — shots/…/400.png top band, "Figma tokens"
## Navigation
- techniques used: the site sidebar and bottom rail only (page-level nav; nothing added)
- other navigation questions — n/a
## Layout
- yes — the scheme cards sit in a row at 1200 and 1920 and stack at 400
## Sizing
- yes — cards hug their content; at 3440 empty is 0.85 and the content is small on a wide canvas (a note, since it is a demo)
## Wrapping
- no — layout.json wraps at 400: the h3 headings wrap to 2 lines ("A Figma sample, coded…", "Controls (DS 2.6…") and the `.fig-btn` buttons read as 1.8 lines
- yes otherwise — no overflow_x at 400
## Spacing and padding
- yes — the near-black card matches the Dark card's padding in shots/…/1200.png; layout.json 400: no big_empty band
## Colour and contrast
- yes — the near-black ground is darker than Dark with white ink; the docs give secondary text as 7.3:1 against 4.0:1 on plain dark (not recomputed by me)
- the accent label "NEAR-BLACK" is readable on the ground
## Flow
- yes — the page reads schemes, then modes, then controls, then layouts, then the settings screen; the new sheet block interrupts it with text and no widget
## Words
- yes — the sheet paragraph is plain and gives the way to try it ("Resize the window below 600 px")
- no — the possible changed accents on the "Español / Français" line (finding 3)
