verdict: fix
1. [fix] Requirement "automatic for UI tasks" is not met — the diff has no merge.mjs reminder or step-runner hook (STATE.md: "⬜ merge.mjs reminder; commands sent to @mastermind-step-runner"); shots still have to be remembered.
2. [fix] Requirement "run on the Figma pages, measure whether the overlay helps" is not met — STATE.md lists it open, and the shots given are of /framework/ext/Shots/, not a Figma page.
3. [note] Widths given: all four (400, 1200, 1920, 3440) for /framework/ext/Shots/, two pages. The module page is nearly empty at wide widths (layout.json empty 0.81 at 1200, 0.85 at 1920, 0.90 at 3440) — it shows one link and a collapsed Readme. The brief says show, don't tell, so it should show a live ShotsView demo.
4. [note] layout.json `wraps` at 400 flags the shell's drawer-rail buttons ("✦AI", "⋯More", 3.2 lines). This is shell chrome the diff did not touch; not caused by this change.
5. [note] The diff's content (diff.patch) was only partly read; the one-click better/worse buttons are in ShotsView by code, but I did not see them in a shot.

## Requirements
- 1 "Shots live in each page's `screenshots/` subfolder, gitignored" — yes — .gitignore adds `**/screenshots/`; only runs.jsonl is committed.
- 2 "Resolutions per template / widths rule" — yes — Shots.mjs derives widths and the CLI accepts a list; the 400-only mobile-button rule is in its comments. The open question on narrow-tall pages was not checked.
- 3 "Visual diff with overlay, no new dependency" — yes — Diff.mjs and PNG.mjs are hand-rolled on node zlib, with the moved/changed split. Whether the overlay helps is unmeasured (see 2).
- 4 "Own name and log of every run" — yes — Shots, runs.jsonl.
- 5 "Automatic for UI tasks" — no — see 1.
- 6 "Screenshots tab in the dev shell sidebar, tree of rounds" — yes — DevBar/shots.js and a tools.js entry; `--list` and ShotsView show a tree by `parent`.
- 7 "One-click better / not better for the owner" — yes — judge badge plus buttons per ShotsView code; not seen in a shot.
- 8 "Run on the Figma pages" — no — see 2.

## Page structure
- page 1 (title says what it is) — yes — shots/…-Shots/1920.png: "Shots" h1 plus a one-line intro.
- show, don't tell — no — see note 3.
- every page reachable by a link — yes — ext/page.js and readme.md are edited.

## Navigation
- techniques used — a sidebar, plus a collapsed readme disclosure on the page.
- sidebar — yes — it fills the sheet at 1200/1920/3440; at 400 it collapses to the drawer.
- tabs — n/a

## Layout
- standard layout used — yes — layout.json `layout: standard` at every width.
- the content is a clear single column — yes — the four bands (title, md, shots-index, md-details) are in order.

## Sizing
- widest text line is readable — yes — widest 340 / 497 / 533 / 600 px across the four widths.
- the page uses its space — no — empty 0.81–0.90 at 1200 and up (not measured against a target; judged from sheet.png).

## Wrapping
- no wrapping that shouldn't — yes — the only wraps are the shell's drawer buttons (see note 4); tab_rows 0.
- no horizontal overflow — yes — overflow_x false.

## Spacing and padding
- default padding used — yes — left_stack h1/p total 28 / 38 / 67 px, all from the single `page` layer.
- bands breathe — yes — band gaps in layout.json (e.g. 400: bands at y 72, 154, 308, 382).

## Colour and contrast
- readable contrast — yes — grey text on a light page is legible in the sheet; the orange links are visible.

## Flow
- most important first — yes — title, intro, the Figma link with "4 rounds", then the collapsed readme.

## Words
- plain words — yes — the intro names the command and says what the tab does.
- links for named things — yes — the Figma colours page and the rounds count are linked.
