verdict: pass
1. [note] A side only becomes a drawer when the whole browser window is narrow (`@media (width < 34em)`), not when the panel itself is narrow. So a Panel2 with a 16rem side, placed in a 22rem `.panel2-grid` cell on a wide screen, leaves main about 6rem wide (layout 3, layout 18) — panel2.css, the drawer rule. Part 2 builds a dashboard of these, so a container query is worth deciding before then.
2. [note] The phone iframe loads the whole site shell (site header, Panel2 title, tabs) inside 22em × 26em, so the panel being shown is a small strip at the bottom. A white sliver from the closed drawer, probably its box-shadow, shows at the frame's left edge (layout 10, words 4) — my full-page headless shot at 1200, phone section.
3. [note] The readme says two things the code doesn't do: its Architecture lists a `static grid` that doesn't exist, and it says the header's controls use flex-wrap, but `.panel2-controls` is plain `display: flex` with no wrap (words 7) — readme.md and panel2.css.
4. [note] The drawer has a literal colour, `box-shadow: 0 0 1.5em rgba(0,0,0,0.3)`, and it has no backdrop. Tapping outside the drawer doesn't close it; only the header toggle does (colour 3) — panel2.css, the drawer rule.
5. [note] The grid demo ends with Panel C alone on row 2 at the stage's 817px width (layout 11) — full-page shot at 1200, grid demo.
6. [note] Some paragraphs run past 60 words: the page's phone-section intro (~75), the grid intro (~65), and the readme's Open questions items 3 and 4 (~90 each) (words 3). The readme's H1 is also a whole sentence where a name was wanted.
7. [note] `panel2-` is still not reserved in `css-scopes.txt`. It is recorded in doc/decisions.md for someone who is allowed to edit that file.
8. [note] This review's diff.patch also contains part1b (Inbox restructure) and ai2/drawer files. I reviewed only the ext/panel2 files, plus the one-line ext/page.js and ext/readme.md entries.

Widths: all four (400, 1200, 1920, 3440), because this is a new page with its own layout. The stored shots show only the first screen, so I added one full-page headless shot at 1200×4000 (mcp__site__shot) to see the split, grid and phone demos.

## Requirements
- 1 "A new, small module… reuse only ext/grip" — yes — Panel2.js (~150 lines) imports only View and grip; nothing comes from ext/Panel
- 2 "header (slim toolbar), main, optional footer… start/end side… becomes a drawer" — yes — Header/Main/Footer/Side exist; below 34em a side becomes an absolute `translateX` drawer; the phone iframe shows the ☰ toggle (see note 1 for the viewport-only trigger)
- 3 "a class with parts as statics… header is a real container you .append() into" — yes — `Panel2.Header/.Main/.Footer/.Side` are reached through `this.constructor`; `Header.append()` places controls in the controls row; the full-page shot shows ＋ ⋯ and Refresh in the headers
- 4 "Nesting and splitting… a grip between them… no layout switches, write it down" — yes — `Panel2.split(a, b, {axis})` puts a grip inside `a`; the readme's Open question 1 covers fixed ↔ fluid
- 5 "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))… explained in plain words… flex-wrap as the alternative" — yes — `.panel2-grid { --column: 22rem }` reuses framework.css's `grid auto`; the readme has the "five-year-old words" explanation and a flex-wrap paragraph
- 6 "A demo page… live instances: plain, split with toolbar buttons, phone-width" — yes — the full-page shot shows all three, in that order, live; the phone case is a real iframe (note 2)
- 7 "Docs: readme.md… open items" — yes — readme plus doc/decisions.md; four open questions (fixed ↔ fluid, more grips, sprawl, adaptive height)
- Owner add-on "Sprawl" and "Adaptive panel height" recorded, not built — yes — readme Open questions 3 and 4
- Out of scope: ext/Panel and ai/ untouched by this part — yes — no ext/Panel lines in the diff (the ai/ lines belong to part1b and the task logs)

## Page structure
- page 1 — yes — shots/…panel2/1200.png, top: "Panel2 is the site's standard UI area."
- page 2 — no — no concept tiles; the code sample comes first. Acceptable for a module demo in the ext house style
- page 3 — yes — what it is, then the plain panel, split, grid, phone, then open questions
- page 4 — n/a
- page 5 — yes — the ext/page.js diff adds panel2 to children; it shows under Extensions in the sidebar
- page 6 — yes — Overview/Docs/Files tabs are routed by Doc; the iframe uses `?view=phone`
- page 7 — yes — Doc plus demo() blocks; no page-specific CSS
- page 8 — yes — the toggle has an aria-label and title, "Open the start panel"
- page 9 — yes
- page 10 — yes — live instances, not prose
- page 11 — yes — each demo has a bold lead line
- page 12 — n/a

## Navigation
- nav 1 — tabs (Overview/Docs/Files), the site sidebar, and the in-panel drawer
- nav 2 — yes — layout.json tab_rows 1 at every width
- nav 3 — yes — Doc tabs are routed
- nav 4 — yes — three tabs
- nav 5 — yes — shots/…panel2/3440.png, sidebar beside the doc column; at 400 it folds into ☰
- nav 6 — yes
- nav 7 — yes — 400.png, the bottom rail sits over the page pad
- nav 8 — no — the drawer has no URL and doesn't close on an outside tap. Small for a component (note 4)
- nav 9 — n/a
- nav 10 — n/a

## Layout
- layout 1 — yes — 3440.png: nav column beside a centred doc column
- layout 2 — yes — Docs three-region
- layout 3 — yes on the page; note 1 for the component in a narrow cell
- layout 4 — yes — main and side use `--pad`; the toolbars use control rungs
- layout 5 — yes
- layout 6 — yes — the demos sit in demo stages, not the reading column
- layout 7 — yes — layout.json bands: doc-well 0.067–0.087, tab-panel holds the content, big_empty false at every width
- layout 8 — yes — the split panels' content is about equal
- layout 9 — yes
- layout 10 — no (small) — the phone iframe gives most of its height to site chrome (note 2)
- layout 11 — no (small) — Panel C is alone on row 2 at 817px (note 5)
- layout 12 — yes — the grid panels stand apart with `gap`

## Sizing
- sizing 13 — yes — panels are auto height; the iframe is fixed (22em × 26em), which is deliberate
- sizing 14 — yes
- sizing 15 — yes — `.panel2-main` and `.panel2-side` say `overflow: auto`
- sizing 16 — yes
- sizing 17 — n/a
- sizing 18 — yes on the page — layout.json overflow_x false at all four widths; the grip floors at 60px. Note 1 for main inside a narrow cell
- sizing 19 — yes — `16rem` / `22rem` floors, `34em` breakpoint

## Wrapping
- wrap 20 — yes — layout.json wraps lists only site chrome (`drawer-rail-ai`, `mode-btn`, `drawer-menu`), nothing from panel2
- wrap 21 — yes — no panel2 entry wraps under 1920
- wrap 22 — n/a — the toolbar row doesn't wrap (note 3)
- wrap 23 — yes — a side-by-side split stacks into a column below 34em (panel2.css)
- wrap 24 — n/a

## Spacing and padding
- spacing 33 — yes — layout.json left_stack 28px at 400
- spacing 34 — yes — demo stage → panel → main is one pad each
- spacing 35 — yes
- spacing 36 — yes — the full-page shot: text is inset in every panel
- spacing 37 — yes — `--pad`, `--gap-50`, `--gap-35`
- spacing 38 — yes — the buttons are framework buttons
- spacing 39 — yes — `.surface` grounds each panel
- spacing 40 — n/a
- spacing 41 — yes — every rule is in `@layer theme`
- spacing 42 — yes — reuses `grid auto` and `.surface`; one helper class

## Colour and contrast
- colour 1 — yes — framework ink on surface
- colour 2 — n/a
- colour 3 — no (small) — a literal `rgba(0,0,0,0.3)` shadow (note 4)
- colour 4 — yes — `.surface` panels against the checkered stage
- colour 5 — not measured — only light-mode shots; panel2 uses only tokens apart from the shadow
- colour 6 — yes — `--line` borders between the header, sides and main
- colour 7 — n/a
- colour 8 — n/a

## Flow
- flow 25 — yes
- flow 26 — yes — the closed drawer is off-canvas on purpose; a sliver shows (note 2)
- flow 27 — yes
- flow 28 — yes — each caption sits under its own stage
- flow 29 — n/a
- flow 30 — yes — layout.json widest_text 342/591/634/713
- flow 31 — n/a
- flow 32 — yes — left_stack has a single layer at every width

## Words
- words 1 — yes — live instances and a live phone frame
- words 2 — yes
- words 3 — no (small) — several paragraphs run 65–90 words (note 6)
- words 4 — yes — the first line plus three live demos
- words 5 — yes, except the readme's sentence-length H1
- words 6 — yes — demo captions are one line
- words 7 — no (small) — the readme's `static grid` and its "controls use flex-wrap" are wrong (note 3)
- words 8 — yes — ext/grip and ext/Panel are linked; css-scopes.txt is linked
- words 9 — yes — the readme sits under the live demos
- words 10 — yes
- words 11 — yes — full sentences throughout
