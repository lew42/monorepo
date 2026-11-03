verdict: fix
1. [fix] The runs page intro prints raw markdown: `**ask**`, `**outcome**`, `**0.5 means not sure**` and `[confidence.md](/framework/ext/Refine/md/doc/confidence/)` show as literal text, so the link to the scale can't be clicked (content: every mention a link; ask 4). Evidence: shots/…Refine-runs/1200.png, band 2. `p()` reads backticks only; use `b()`/`a()` for these.
2. [note] On the new scale, 62% of the per-ask confidences (496 of 798) are still above 0.7, most at 0.8 or 0.85. Every one has an evidence string, so the rule holds. But this is the "lots of high numbers" pattern the owner disagreed with, and the spot-check found two outcome scores set high for fixes that are still open. Worth a calibration pass.
3. [note] The days' input is mostly agent-written `requirements.md` briefs, not the owner's raw words, and 5 of the 7 days were capped at 20k characters. The readme says each day is a sample, but the runs page only says "(input capped)".
4. [note] On the runs page each day is a wrapping paragraph of numbers and links. A small table (day · asks · ask · outcome · links) would read at a glance and stop the links breaking across lines at 1200 and 400. The page also builds rows with `document.createElement`/`innerHTML` instead of the framework's `p`/`a` tags.
5. [note] The prompt-template part of ask 2 is covered by `Servex/ext/refine/ClarityScorer.js` (the only model prompt that asks for a score). `Server/refine.mjs` has no score prompt, so it needs no change.

Widths given: 400, 1200, 1920 and 3440 for both `/framework/ext/Refine/` and `/framework/ext/Refine/runs/`.

## Requirements
- 1 "The scale, decided and written once" — yes — `doc/confidence.md` (23 lines) has the 0.5 default, the over-0.7-needs-evidence rule, under 0.3 = probably wrong, and the rejected multiplier with its trade-off; `task.jsonl` has a `decision` line
- 2 "Scorer defaults to 0.5, requires evidence over 0.7, labels the number; old scores show '(old scale)'" — yes — `Scorer.js` starts at 0.5 and clamps to 0.7 without evidence; `ClarityScorer.js` prompt and clamp do the same; `Prompt.label()` prints "confidence 0.5: not sure" / "0.85: evidence: …" / "(old scale)"
- 3 "Run it on past days, in reverse … spot-check 10 asks; log the agreement" — yes — `Server/refine-days.mjs`; runs for 10-13 back to 10-06 (10-11 had no owner words); 399 asks, every one with both confidences and evidence; spot-check "8 of 10 agree" is logged; total cost $6.72 of the $12 budget
- 4 "A page listing the days, each with ask count, mean confidence, and the brief; linked from the readme" — yes, with fix 1 — shots/…Refine-runs/1200.png shows every day with its asks, means and a brief link; linked from the readme and the Refine page
- 5 "Report on your card" — n/a — not in the diff

## Page structure
- page 1 (title says what it is) — yes — "Refine runs by day", shots/…Refine-runs/1200.png, top band
- page 2 (one takeaway) — yes — what each day's refined asks scored
- page 3 (reached from its parent) — yes — `children: "try ladder runs"` plus a link in the Refine page footer

## Navigation
- nav 1 — the site sidebar only; the page adds no navigation
- route per view — yes — `/framework/ext/Refine/runs/`, and each brief or coverage file has its own `md/` route

## Layout
- layout 1 — yes — standard single column, text measure, layout.json `layout: standard` at every width
- layout (Refine page) — yes — unchanged apart from one footer link

## Sizing
- sizing 1 — yes — widest text 590 px at 1200 and 712 px at 3440, within the measure; no overflow_x at any width
- sizing 2 (space use) — note — empty 0.776 at 3440, normal for a short text page

## Wrapping
- wrap 1 — note — the title wraps to 2 lines at 400 (layout.json wraps page-title lines 2), which is fine; at 1200 and 400 each day row's links wrap (shots/…Refine-runs/1200.png), see note 4
- wrap 2 (tabs) — n/a

## Spacing and padding
- spacing 1 — yes — left_stack 28 px at 400 and 38 px at 1200, the same as the Refine page; the gaps between bands are even
- spacing 2 — yes — no big_empty band at any width

## Colour and contrast
- colour 1 — yes — default text and link colours; the literal `**` and `[…](…)` are a content fault, not a colour one

## Flow
- flow 1 — yes — intro first, then the days newest first, as the owner asked ("in reverse")

## Words
- content 1 (plain sentences) — yes — the intro defines "ask" and "outcome" in full sentences
- content 2 (links for mentions) — no — the confidence.md link is dead text (fix 1); `Server/refine.mjs` is code, not a link
- content 3 (length) — yes — the intro is 60 words
