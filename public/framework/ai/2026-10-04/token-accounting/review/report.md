verdict: fix
1. [fix] Layout — at 1920 and 3440 the Sessions page (the page this task's new "Cache $ breakdown" section was added to) is one narrow left-hand column with the rest of the screen empty: `layout.json` empty 0.725 at 1920, 0.837 at 3440; the `page-columns-row` band takes share 0.92/0.911 of the screen but ink only 0.271/0.154 — a band both big and nearly empty. Evidence: `shots/.../1920.png`, `shots/.../3440.png`. This predates this diff (same narrow-column shape at every width in `layout.json`) and the task's own scope was token accounting, not this page's shape — naming it, not asking this task to fix it.
2. [note] The session-detail "Logged cost" breakdown row (`page.js`, `session_page()`) uses a new class, `sessions-cost-breakdown`, that the diff doesn't add any CSS for (no `.css` file is touched in this diff) — it rides on the utility classes alongside it (`card flex gap-50 v-center muted`), which is probably enough, but no shot covers a session's own detail page, so this couldn't be checked against a real render. The index-page addition reuses an existing, already-styled class (`sessions-by-role-row`) correctly.
3. [note] Requirements item 5 ("Worktree → check_page → merge.mjs") is a process step, not something a screenshot or the diff can confirm either way.

## Requirements
- 1 "Map it: every place a cost or token count is written and read" — yes — `decisions.md`'s 2026-10-04 entry has the one table (writer/reads from/what), naming every script in the brief's own list.
- 2 "Pick the one source... make the others compute from it or link to it" — yes — `session-cost.mjs`'s `PRICES` table and `cost_of_transcript()`/`price_for()` are now the one place a token is priced; `task-cost.mjs` and `spend-tree.mjs` both import it rather than keeping their own copy (diff.patch lines 165, 275).
- 3 "Check the math on 3 real agents" — yes — `decisions.md` names the exact three agent logs, the exact formula, and an exact-to-the-decimal match once `cache_write` used `in × 2`; one worked turn-level example is shown.
- 4 "Breakdown view: per agent input/cache write/cache read/output + $, % from cache reads, grouped by role and by trigger" — yes — `cost_of_transcript()` returns `usd_breakdown` + `cache_read_pct`; `spend-tree.mjs` adds `by_role`/`by_trigger` with `cache_read_usd`/`cache_read_pct`; the Sessions tab renders both (confirmed live in `shots/.../1200.png`: "by role — task-mastermind $2789.03 cache reads of $4345.57 (64.2%) · 167 agents").
- 5 "Worktree → check_page → merge.mjs" — n/a — a process step; not visible in a diff or a screenshot.

## Page structure
- 1 — yes — "Sessions" title unchanged by this diff, still says what the page is (shots/.../1920.png, top).
- 2 — n/a — this page is a report/tool page, not a concepts-first index; unchanged by this diff.
- 3 — yes — order is: stat cards (what/state), filters, then the role/trigger/cache breakdown lists (detail) — the new section slots in after the existing ones, same priority order.
- 4 — n/a — no open/done distinction on this page.
- 5 — yes — unchanged, already reachable from the AI tab's Sessions sub-tab.
- 6 — n/a — not changed by this diff (no new route or tab added).
- 7 — not measured — `layout.json` names the page's layout `"ai2"`; can't confirm from a shot alone whether that's an approved layout word.
- 8 — yes — the new rows read as plain labelled numbers ("task-mastermind $2789.03 cache reads of $4345.57 (64.2%) · 167 agents"), self-evident without more text.
- 9 — yes — the new section doesn't repeat the two lists above it; it's visually labelled "all-time" specifically so it doesn't read as the same figure (page.js comment + rendered label, shots/.../1920.png).
- 10 — yes — numbers shown as a list of rows, not prose.
- 11 — yes — "Cache $ breakdown, all-time — share of each group's $ spent re-reading cached context" states the section's point in its own line.
- 12 — n/a — nothing was restructured; this is an addition.

## Navigation
- Identify: tabs (INBOX/DASHBOARD/LOG/SYSTEM/SESSIONS/TESTS), a sidebar (the page tree), a rail (the leftmost icon column) — all unchanged by this diff.
- 2 — yes — `layout.json` `tab_rows: 1` at every width (400, 1200, 1920, 3440).
- 3 — yes (unchanged) — existing routed tabs, not touched by this diff.
- 4 — yes (unchanged).
- 5 — no — at 3440 the sidebar sits beside the main column, but that main column is not centred — it's left-anchored with the rest of the 3440px width left blank (shots/.../3440.png). Same pre-existing condition as Layout finding 1. At 400 the sidebar folds away cleanly (shots/.../400.png).
- 6 — not measured — no interaction shots to check against.
- 7 — n/a — no bottom rail or fixed overlay in the new content.
- 8 — n/a — no sheet or modal involved.
- 9 — n/a — no full-screen view involved.
- 10 — not measured — no selection interaction shown in the static shots.

## Layout
- 1 — no — see finding 1: at 3440 the page is one narrow column, not several columns or a centred main beside a nav column (shots/.../3440.png; layout.json empty 0.837).
- 2 — not measured — can't confirm `"ai2"` against the approved-layout list from a shot.
- 3 — no — same root cause as Q1: the content column itself is undersized for 1920/3440 (shots/.../1920.png, 3440.png).
- 4 — yes — the new rows take padding only as list rows (`sessions-by-role-row`'s own `padding-block`), no extra boxing.
- 5 — yes — rows keep a gap from the sidebar and the right edge (shots/.../1200.png).
- 6 — n/a — no multi-column content in the new section.
- 7 — no — see finding 1: `page-columns-row` band share 0.92 (1920) / 0.911 (3440) but ink only 0.271 / 0.154 — big and nearly empty.
- 8 — n/a — single column.
- 9 — no — the dead space to the right of the column at 1920/3440 isn't a deliberate gutter or a second region; it's unused screen (shots/.../3440.png).
- 10 — n/a — covered by Q1/Q7; the content itself (small list rows) isn't mis-scaled, the column is.
- 11 — n/a — no card wall.
- 12 — yes — new rows use the existing `sessions-by-role-row` divider style (a hairline rule), consistent with the rows above them, not cards.

## Sizing
- 13 — yes — the new rows are auto-height text rows (shots/.../1200.png).
- 14 — n/a — no previews in the new content.
- 15 — n/a — no bounded box in the new content.
- 16 — yes — no stray scrollbar visible in any shot.
- 17 — n/a — nav is a top tab bar, not a hero band.
- 18 — yes — `overflow_x: false` at all four widths.
- 19 — not measured — can't confirm `em`/`rem` usage from a screenshot; the diff adds no new CSS to check.

## Wrapping
- 20 — yes — `layout.json` `wraps` lists only pre-existing chrome buttons (`mode-btn`, `drawer-menu`), none from the new content.
- 21 — yes — same wrap entries appear at every width tested; nothing new-content-related wraps only under 1920.
- 22 — n/a — the new section isn't a control row.
- 23 — not measured — the 400px shot (`shots/.../400.png`) is cut off above the new "Cache $ breakdown" section, so there's no evidence of its shape at 400.
- 24 — n/a — no preview descriptions in the new content.

## Spacing and padding
- 33 — yes — `left_stack.h1.total` is 14px at 400 (well under 3em).
- 34 — yes — `left_stack.h1.layers` shows one layer (`doc-well`), not nested padding.
- 35 — yes — the new rows carry no extra `.pad`; they reuse the existing row class's own padding.
- 36 — yes — rows keep the same left margin as the rows above them (shots/.../1200.png).
- 37 — yes — `page.js` reuses existing utility classes (`flow`, `flex gap-50 v-center`) rather than a new constant.
- 38 — n/a — no new controls in this diff.
- 39 — n/a — the new rows don't introduce a padded box.
- 40 — n/a — no bleed container involved.
- 41 — not verified — the diff touches no `.css` file; `sessions-cost-breakdown` (session-detail page) has no rule in this diff, see finding 2.
- 42 — see finding 2 — the index-page addition reuses an existing styled class (`sessions-by-role-row`, confirmed to have CSS in `sessions.css`); the session-detail addition introduces one new, unstyled class name.

## Colour and contrast
- 1 — not measured — text reads as the existing `.muted`/body styles at the same size as rows above it; no contrast tool run.
- 2 — n/a — no accent-coloured text in the new content.
- 3 — yes — no literal colours added; new markup only adds class names, no inline styles (diff.patch).
- 4 — n/a — the new rows don't introduce a new box ground.
- 5 — not measured — can't confirm dark mode from a light-mode shot.
- 6 — n/a — no new ground seam introduced.
- 7 — n/a — no anchor mark involved.
- 8 — yes — the new text uses the existing `.muted` class (`small.c("muted", ...)` in page.js), not a raw colour var.

## Flow
- 25 — yes — order top to bottom still runs stat cards → filters → existing lists → new list, most important first.
- 26 — yes — `overflow_x: false` at every width; nothing is hidden off-screen.
- 27 — yes — the new section reuses the same `flow`/`flex gap-50 v-center` rhythm as the lists above it.
- 28 — yes — each row's label sits directly beside its own numbers, same proximity as the existing rows.
- 29 — n/a — this is a polled, not live-streaming, list; no "N new" pattern applies here.
- 30 — yes — `widest_text` tops out at 722px at 3440, well inside a normal reading measure.
- 31 — n/a — no dev-shell/frame change in this diff.
- 32 — n/a — no nested `.page` added.

## Words
- 1 — yes — numbers shown as a labelled list, not described in prose.
- 2 — yes — the list layout itself shows the grouping; the one caption line doesn't re-explain it.
- 3 — yes — every new line is well under 60 words.
- 4 — yes — the point ("here's how much of each group's $ is cache reads") lands in one caption plus the rows.
- 5 — yes — "Cache $ breakdown, all-time" says exactly what it is.
- 6 — n/a — no pictures in the new content.
- 7 — yes — "cache reads" is named the same way in every row.
- 8 — n/a — no file or module name appears in the visible new text to check for a link.
- 9 — n/a — this new content is the widget itself, not a prose file needing one beside it.
- 10 — yes — the new section is placed after, not before, the higher-priority stat cards and filters.
- 11 — yes — the one caption sentence is a full, plain sentence a new coder could follow.
