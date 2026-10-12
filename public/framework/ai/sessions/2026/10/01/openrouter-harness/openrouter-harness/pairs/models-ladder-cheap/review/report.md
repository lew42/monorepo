verdict: fix
1. [fix] The table isn't "cheapest first" — it sorts by price-per-token ratio (×Sonnet), not by what a run actually cost, so Claude Sonnet ($0.377/run) sits above Claude Opus ($0.294/run) even though Opus was cheaper here — shot-1200.png, the three "(control)" rows; `models.mjs` sorts on `xSonnet` before `mean_cost`.
2. [fix] Sonnet's price used for the whole table is $3.00 in / $15.00 out, not the $2 in / $10 out the brief names — "Sonnet is $2 in and $10 out per 1M tokens." This also skews every ×Sonnet column, since all of them divide by the same Sonnet rate — shot-1200.png, "Claude Sonnet (control)" row; `ANTHROPIC_PRICE_PER_TOKEN["claude-sonnet-5"]` in `models.mjs`.
3. [fix] No `result.md` in the task folder — the brief asks for five to ten plain lines on what was built, what works, what doesn't. The minion's own log stops at "starting"; the landing commit says its turn died reading an image mid-check, so nothing ever got written.
4. [note] This review's own `diff.patch` and `shots/` are for a different page entirely (the quick-fix-sandbox bold-heading tweak), not for this task. I read the real diff and shot the real page straight from the worktree (`C:/Code/lew42/worktrees/lt2-cheap`, commit 85311581) to do this review — a reader who trusts the files in this folder as-is would review the wrong change.
5. [note] A free model with a measured $0 run still shows "<$0.001" in the $/run column instead of "free" — shot-1200.png, "nemotron-3-ultra-550b-a55b:free" row. Minor, and it's the page's existing `fmt_usd` formatter, not new code from this diff.

Widths used: 400 and 1200 only. This is one new table dropped into an existing page — it doesn't rearrange the page shell — so per the review skill's rule for a component, I shot its natural width (400) plus one wider shot (1200) rather than all four. (`review/shots/` holds shots of the wrong page; `shot-400.png` and `shot-1200.png` in the task folder are the real ones, confirmed against a fresh shot of the running worktree.)

## Requirements
- "A new section... titled 'The cheap ladder', placed ABOVE the current chart" — yes — shot-1200.png: the heading sits directly above "Value per configuration, by kind".
- "One table, one row per model that has run at least one rung, cheapest first (free models at the top)" — no — free models are correctly at the top, but below them the order is by price ratio, not by actual run cost (finding 1).
- "Columns: model · $/1M in/out · one column per rung · $/run (mean of real runs) · price × Sonnet" — yes — shot-1200.png header row: model, $/1M in, $/1M out, H1 page, Fix label, Broken import, Broken overflow, $/run, ×Sonnet.
- "One plain sentence above the table... the cheapest model that passed all four, or the cheapest that passed the most" — yes — "The cheapest model that passed all four rungs is Claude Haiku ($0.2230/run)" — correct for today's data, though it inherits the same sort bug (finding 1) and would mis-pick under different data.
- "Numbers come from models.mjs, extend it to add a ladder block" — yes — `models.mjs` diff adds the `ladder` block; `models.json` carries `ladder.rows`.
- "Prices... ladder-models.json... otherwise OpenRouter's public models list... Anthropic list price for Claude... Sonnet $2 in / $10 out" — no — Sonnet's own listed price is wrong (finding 2); the other three price sources are wired correctly.
- "Draw it in overview.js, render_models(), using the same widgets the page already uses" — yes — uses the existing `table()` widget from `/framework/ui/table/table.js`, the same one other sections on this page use.
- "Run the script, then check the page" — yes — `models.json` is regenerated (ladder data present) and the page renders it correctly in a fresh shot of the worktree.
- "Edit only these files there: models.mjs, overview.js, models.json" — yes — `git diff HEAD~1 HEAD --stat` on the worktree touches exactly those three files and nothing else.
- "Save shot-1200.png and shot-400.png... in YOUR task folder" — yes — both present and match the real page.
- "write result.md in five to ten plain lines" — no — missing (finding 3).

## Page structure
- 1 — n/a — unaffected by this diff; the page's existing opener still says what it is.
- 2 — n/a — unaffected; concepts tiles are above this section, untouched.
- 3 — yes — the new section sits above "Value per configuration", matching the brief's priority (shot-1200.png).
- 4 — n/a — not an open/done distinction here.
- 5 — n/a — no new page created.
- 6 — n/a — no new routed view.
- 7 — yes — a plain data table, the framework's own `table` widget, not page-specific CSS.
- 8 — yes — every label (model, $/1M in, $/run, ×Sonnet) reads plainly; shot-1200.png.
- 9 — yes — no repeated info; each column earns its place.
- 10 — yes — a table of numbers, not a sentence (shot-1200.png vs. the one-line summary above it).
- 11 — yes — "The cheap ladder" + its one-line gist state the section before any row is read.
- 12 — n/a — nothing was restructured, only added.

## Navigation
- 1 — tabs (AI / INBOX / LOG / SYSTEM / TESTS), a sidebar (the framework page rail) — both pre-existing, untouched by this diff.
- 2 — yes — the tab bar is one row at both 400 and 1200 (shot-400.png, shot-1200.png); not measured (no layout.json), judged from the shots.
- 3 — n/a — tab routing is pre-existing and unaffected.
- 4 — n/a — unaffected.
- 5 — n/a — the sidebar's behavior is unaffected by this change.
- 6 — n/a — unaffected.
- 7 — n/a — no fixed overlay involved.
- 8 — n/a — no sheet or modal involved.
- 9 — n/a — not full screen.
- 10 — n/a — no expanding-in-place item here.

## Layout
- 1 — n/a — this is a component dropped into an existing page shell, not a page-layout change; shell unaffected.
- 2 — n/a — same reason; the page's own layout word is untouched.
- 3 — yes — at 1200 the table fills the content column cleanly (shot-1200.png); at 400 it reads but columns past "Fix label" run past the viewport (shot-400.png) — see Sizing/Wrapping below.
- 4 — n/a — table sits in the page's existing `.pad` region, no new box.
- 5 — yes — cell text keeps clear margins from borders at both widths.
- 6 — n/a — one table, not multiple content columns.
- 7 — not measured — no layout.json for this page; by eye the new section's band looks proportionate to its content (shot-1200.png).
- 8 — n/a — not a multi-column layout.
- 9 — n/a — no dead space introduced.
- 10 — yes — the table is sized to its data, no oversized or undersized content.
- 11 — n/a — not a card wall.
- 12 — n/a — not a stacked-card layout.

## Sizing
- 13 — yes — the table is auto height, grows with its rows (shot-1200.png).
- 14 — n/a — no preview content here.
- 15 — n/a — the table isn't a bounded/scrolling box by its own CSS.
- 16 — not measured — at 400 the row data runs past the right edge of the viewport (shot-400.png); it's unclear from a static shot whether this scrolls inside the table or the whole page scrolls sideways. The `table` widget's own CSS forces `width: 100%` rather than the `max-content` the base stylesheet gives tables for self-scrolling, so this is worth a look — but it's pre-existing shared-widget behavior, not something this diff's code changed.
- 17 — n/a — no band above first navigation here.
- 18 — not measured — see 16; judged from the shot, the right-most columns (Broken import, Broken overflow, $/run, ×Sonnet) aren't visible at 400.
- 19 — n/a — no new sizing units introduced; the table uses the existing widget's CSS.

## Wrapping
- 20 — yes — the tab bar and the table's header row each sit on one line at both widths (shot-400.png, shot-1200.png).
- 21 — n/a — not measured without layout.json across widths; nothing in the two shots suggests a width-dependent wrap.
- 22 — n/a — no flex chip/control row in this addition.
- 23 — n/a — the table is one data grid, not a stacking card row.
- 24 — n/a — no preview description text here.

## Spacing and padding
- 33 — not measured — no layout.json; by eye the heading and first paragraph at 400 sit inside the page's normal left padding (shot-400.png).
- 34 — yes — the table sits directly in the page's one padded region, no extra nested padding.
- 35 — n/a — the table doesn't take `.pad` itself; it inherits the page region's.
- 36 — yes — table text keeps a normal cell inset from the table's own edge.
- 37 — n/a — no new gap/pad constants introduced; reuses the existing page and table CSS.
- 38 — n/a — no new control (chip/button) introduced.
- 39 — yes — table rows read against the card/page ground already used elsewhere on this page.
- 40 — n/a — not a bleed container.
- 41 — n/a — no new CSS rules added by this diff (table styling is pre-existing, in `table.js`).
- 42 — yes — the diff writes no new CSS at all; it reuses the existing `table()` widget and `span.c(...)` badge classes already used elsewhere on the page.

## Colour and contrast
- 1 — yes — body and header text read as normal dark-on-light table text, same as the rest of the page (shot-1200.png).
- 2 — n/a — no accent-coloured text introduced.
- 3 — n/a — no new colours; `span.c("pass"/"fail"/"muted", …)` reuses existing token-based classes.
- 4 — n/a — the table doesn't introduce a new "box" ground.
- 5 — n/a — no theme-specific code added; it inherits the page's existing light/dark handling.
- 6 — n/a — no new ground seam.
- 7 — n/a — no new repeated anchor/mark introduced.
- 8 — n/a — no literal muted-colour use in this diff.

## Flow
- 25 — yes — the new section sits where the brief asked (above the chart), matching priority.
- 26 — not measured — see Sizing 16/18: content past "Fix label" isn't visible at 400 in the static shot.
- 27 — yes — the table keeps the page's existing table rhythm; no new spacing system introduced.
- 28 — n/a — no label/card pairing introduced.
- 29 — n/a — not a live-updating list.
- 30 — n/a — no prose line introduced (the one new sentence is short, well under measure — shot-1200.png).
- 31 — n/a — no chrome change.
- 32 — n/a — not a nested-page tab.

## Words
- 1 — yes — the model comparison shows as a table, not a sentence describing it (shot-1200.png).
- 2 — yes — the table's own columns show the structure; the one-line summary doesn't repeat it.
- 3 — yes — the new sentence above the table is one short sentence, well under 60 words.
- 4 — yes — "cheapest first, pass/fail per rung" reads in a few seconds from the table alone.
- 5 — yes — "The cheap ladder" says exactly what the section is.
- 6 — n/a — no picture/caption in this addition.
- 7 — yes — "the cheap ladder" and rung names ("H1 page", "Fix label", "Broken import", "Broken overflow") are used consistently, matching the brief's own names.
- 8 — n/a — no file/module mentions in the new text to link.
- 9 — n/a — the table itself is the widget; there's no separate prose doc for it.
- 10 — yes — the summary sentence (the headline fact) leads; the table (detail) follows.
- 11 — yes — the one new sentence is a full plain sentence, no jargon.
