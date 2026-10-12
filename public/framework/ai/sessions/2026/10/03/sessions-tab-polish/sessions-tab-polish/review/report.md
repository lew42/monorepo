verdict: fix
1. [fix] `week.json` — the source for all 5 stat cards — is still a hand-run snapshot, not live, so the owner's core ask ("shouldn't this be computed in real time by node... this shouldn't be stale data") is unmet. `Server/week-cost.mjs`'s own header still reads "Run by hand to (re)write... node Server/week-cost.mjs"; `readme.md` says "Re-run it to refresh them." doc/decisions.md explains a live route/watcher needs files outside the fence, but the brief's own named fallback (a small standalone script that re-runs the computation on an interval when started, documented as a decision) wasn't tried either — only the reconciliation bug was fixed, not the staleness itself.
2. [fix] The grid's own Role column still prints raw role strings ("cli", "vscode mastermind") instead of the plain labels used in the filter row and the "by role" list — contradicts the scope-narrowed ask: "give the role-filter checkboxes **and any place these words show** plain names." Evidence: `shots/.../1200.png`, Role column — "cli" and "vscode / mastermind" (two lines) are shown verbatim; `row_view()` in `page.js` is unchanged in the diff, only the filter checkboxes and the "by role" list call `role_label()`.
3. [note] The "Per 1% of your weekly plan" card reads as a bare em dash "—" (current data: $0 Claude this week) with no `title=` explaining why, unlike the other cards. Evidence: `shots/.../1920.png` and `3440.png`, 4th stat tile.

## Requirements
- 1 "Remove the empty bands; the page scrolls from the card, the tabs stay put" — yes — `shots/.../3440.png` and `1920.png`: no gray bands between the SESSIONS tab and the white card; doc/decisions.md measures the removed `.page-column-head` (51px) and prose top padding (25px).
- 2 "A row of small stat cards... big bold dollars, smaller cents" — yes — `shots/.../1920.png`: 5 tiles (Claude, OpenRouter, plan used %, per-1%, sessions shown), each dollar figure shown as a large bold whole-dollar number with smaller cents (`$43`.`18`), reusing the `ui/stats` tile pattern per the brief.
- 2b "cost per 1% spelled out, e.g. '$26.65 per 1% of your weekly plan'" — yes — card label reads "PER 1% OF YOUR WEEKLY PLAN" above the dollar figure, not the confusing "$26.65/1%" string.
- 3 "One source of truth, current... computed in real time by node" — no — see finding 1. The reconciliation bug (OpenRouter $0.00 in range) is genuinely fixed and well diagnosed in doc/decisions.md, but the headline ask — live, not stale — is still unmet; `week.json` stays a manual snapshot.
- 3b "Find why OpenRouter is $0.00 in range" — yes — doc/decisions.md traces it to `sessions.mjs` never writing a per-session OpenRouter `$` field; the range summary is now honestly relabeled ("Claude $ logged in range") instead of showing a false $0.00.
- 4 "Fill the blanks" (role/Start/Stop/Duration) — n/a — the owner's own mid-build follow-up explicitly marked this back-burner (a separate data-grid task is replacing this chrome); correctly skipped and logged, not a miss.
- 4b (scope-narrow) "plain names for '(unknown)'/'CLI' wherever shown" — no — see finding 2; done for the filter row and the "by role" list, missed in the grid's own Role column.
- 5 "Compact controls: date pickers sized to content" — yes — `shots/.../1920.png` and `400.png`: both date boxes are now content-width, not stretched; fixed via `input[type=date]{width:auto;flex:none}`, the root cause the brief itself suspected.
- 5b "Card padding... equal on both sides at 1920 and 3440" — yes — doc/decisions.md measures `.panel2-main`'s padding as equal on all sides at both widths (26px/62px); the "lopsided" look was traced to the date-input width bug instead, which is fixed.
- 6 "Screenshots before/after at 1200, 1920, 3440" — yes (per task log) — `task.jsonl` records before/after full-page sheets and close-up top shots saved to `build/shots/` (gitignored by convention); not independently re-verifiable from this review's own `shots/` folder, which holds only the one "after" set review.mjs picked.

## Page structure
- 1 — yes — `shots/.../1920.png`: "Sessions" heading, tab already says which section (AI → Sessions).
- 2 — n/a — no concept-tile list belongs on this page (a data tool, not an index).
- 3 — yes — stat cards (state) → filters/date range (what can be adjusted) → summary/by-role → grid (detail), top to bottom.
- 4 — n/a — no open/done distinction on this page.
- 5 — n/a — unchanged by this diff (Sessions is already a reachable tab).
- 6 — n/a — unchanged by this diff.
- 7 — yes — reuses the existing `Panel2` + `ui/stats` tile layout words, no page-specific shape invented.
- 8 — yes — stat labels ("Claude this week", "Sessions shown") and relabeled filter words are self-evident; see finding 2 for the one place that still isn't (grid Role column).
- 9 — yes — the empty bands (pure repetition of nothing) were removed; no small control sits alone on a wide row at any width shot.
- 10 — yes — the week figures are now cards (a number each) instead of one run-on text line, per the owner's own ask.
- 11 — n/a — no new named sections besides the stat row, which needs no heading beyond its tile labels.
- 12 — n/a — nothing destroyed; this is additive/fix work on one page.

## Navigation
- 1 Identify — tabs (INBOX / DASHBOARD / LOG / SYSTEM / SESSIONS / TESTS), a sidebar (the page tree rail).
- 2 Tabs fit — yes — `layout.json`: `tab_rows: 1` at 400, 1200, 1920 and 3440.
- 3 Tabs have their own URL — n/a — unchanged by this diff.
- 4 Tabs useful, not stacked — yes — one row at every width, per above.
- 5 Sidebar beside centred main at 3440, folds at 400 — yes — `shots/.../3440.png` sidebar left, content right; `shots/.../400.png` sidebar collapses to the drawer rail.
- 6 Sidebar/work area stay still — n/a — not exercised by this diff (no new async arrival).
- 7 Bottom rail / fixed overlay — n/a — none on this page.
- 8 Sheet or modal — n/a — none.
- 9 Full screen — n/a — none.
- 10 Selected item opens in its own column — n/a — not touched by this diff (row click behavior unchanged).

## Layout
- 1 — yes — `shots/.../3440.png`: sidebar + wide centred content, not one narrow column.
- 2 — yes — Standard page with a `Panel2` card; no new layout word invented.
- 3 — yes — stat-card row width matches its grid track (`--column: 11em`) at every width; see sizing note below on label wrap.
- 4 — yes — `.sessions-stats`/the tiles are `.pad`/`surface` boxes, not bare bleed.
- 5 — yes — `shots/.../1920.png`: stat text keeps margin from its tile edge via the reused `flex v gap` + `pad` tile.
- 6 — n/a — one column of content here, not a multi-column reading layout.
- 7 — yes — `layout.json`: the former empty bands are gone; `page-columns-row` share is 0.83–0.93 with `big_empty: false` at every width — the band is the card, not dead space.
- 8 — n/a — no side-by-side columns of content on this page.
- 9 — yes — the removed bands, not a widened reading column, is how the dead space was answered.
- 10 — yes — stat numbers are large in a small tile, grid rows are compact in the wide table; nothing tiny alone in a huge band.
- 11 — n/a — no card wall.
- 12 — n/a — no flush-stacked vs rounded-card mix introduced.

## Sizing
- 13 — yes — stat tiles are auto height (`surface pad flex v gap`), no fixed height.
- 14 — n/a — no preview cards here.
- 15 — n/a — no newly bounded box; the grid's own scroll behavior is unchanged by this diff.
- 16 — yes — `.page-column-body`'s own scroll (pre-existing, confirmed in doc/decisions.md) is the one scrollbar; no new surprise scroll box added.
- 17 — n/a — no band above the first nav; tabs sit right under the page's own top bar.
- 18 — yes — `layout.json`: `overflow_x: false` at all four widths.
- 19 — n/a — no new size values added beyond the reused tile's existing `em`/token rules.

## Wrapping
- 20 — yes — `layout.json`: tab row and stat/control rows are 1 line at every width; the `wraps` entries listed (`mode-btn`, `drawer-menu`) are pre-existing site chrome unrelated to this diff.
- 21 — yes — no row wraps only under 1920; same `tab_rows: 1` at 1200 and 1920.
- 22 — n/a — no new chip/control row added beyond the role-filter row, which already used `flex wrap` before this diff.
- 23 — n/a — not exercised; no full-row item introduced.
- 24 — n/a — no preview description shown at two widths.
- (note, not a numbered question) stat-tile labels like "PLAN USED THIS WEEK" and "PER 1% OF YOUR WEEKLY PLAN" wrap to 2 lines at 1200 and 400 — `shots/.../1200.png`, `400.png`. This matches the existing `ui/stats` tile convention being reused, not a new problem.

## Spacing and padding
- 33 — yes — `layout.json` `left_stack.h1.total`: 14px at 400 (well under 3em/48px).
- 34 — yes — doc/decisions.md measured the card's own padding as one equal value, not stacked ancestors.
- 35 — yes — the stat tiles use `.pad` via the reused `surface pad` pattern, never applied to a bleed element.
- 36 — n/a — not exercised by this diff.
- 37 — yes — `.sessions-stats{margin-block-end:var(--gap)}` and the reused tile's own `--pad`/`--gap` — no constant px spacing added (the one px value, `.sessions-stat-cents{font-size:0.55em}`, is a type-scale step, not a spacing value).
- 38 — yes — the date-input fix (`width:auto;flex:none`) is exactly "a control keeps its own size," not a spacing clamp misused on a control.
- 39 — yes — stat tiles are `surface` (a different ground than the page's `--wash`), so they read as boxes.
- 40 — n/a — no bleed container involved.
- 41 — yes — all new rules sit inside `sessions.css`'s existing single `@layer theme` wrapper.
- 42 — yes — no new CSS class beyond the one the owner's own ask required (`.sessions-stat-cents`); everything else reuses `ui/stats`'s existing classes.

## Colour and contrast
- 1 — yes (not independently measured) — `.sessions-stat-cents` reuses `var(--subtle)` at 0.55 alpha, the same muted-text convention already used sitewide for secondary numbers; legible in `shots/.../1920.png`.
- 2 — n/a — no accent-coloured text introduced.
- 3 — yes — `var(--subtle)` is a real token (`framework.css`), not a literal colour.
- 4 — yes — the stat tiles are `surface`, which differs from the page's `--wash` ground; visible as white cards against the light-gray page in every shot.
- 5 — n/a — not exercised by this diff (no new light/dark-specific rule).
- 6 — n/a — no new ground seam introduced.
- 7 — n/a — no repeated anchor mark introduced.
- 8 — yes — `.muted` class is reused for existing muted text (summary line, "by role" label); the one new rule (`.sessions-stat-cents`) sets colour directly rather than through `.muted`, but it is a type-scale/weight step, not the `.muted` convention, so this is a correct non-use rather than a violation.

## Flow
- 25 — yes — state (stat cards) → controls (filters/dates) → summary → detail (grid), most important first.
- 26 — yes — `layout.json`: `overflow_x: false` at every width; nothing shown past the right edge.
- 27 — yes — the stat row uses `grid gap auto` (a UI grid rhythm), consistent with the rest of the controls' `flex`/`flow` rhythm.
- 28 — yes — each stat label (`h4 muted`) sits directly above its own value inside one tile, not ambiguous between neighbours.
- 29 — n/a — not a live-arriving list in the sense the rule means (the grid already just re-renders on poll, unchanged by this diff).
- 30 — n/a — no prose lines introduced.
- 31 — n/a — not touched by this diff.
- 32 — n/a — not touched by this diff.

## Words
- 1 — yes — the week figures are now shown as cards (a number each), not described in a sentence — exactly the owner's own ask.
- 2 — yes — five separate tiles show five separate numbers; no sentence explains what they mean beyond the label.
- 3 — yes — all new/changed copy (tile labels, filter labels, the range caveat) is well under 60 words each.
- 4 — yes — the top band alone (five labelled numbers) gives the page's point in seconds.
- 5 — yes — "Claude this week", "OpenRouter this week", "Sessions shown" each say exactly what they are.
- 6 — n/a — no new picture/caption.
- 7 — mostly yes, one gap — "Terminal sessions"/"VS Code tabs"/"(unknown)" are named once and reused consistently in the filter row and the "by role" list — but see finding 2: the grid's own Role column still uses the old raw names ("cli", "vscode mastermind"), so the same concept has two different names on one page.
- 8 — n/a — no new file/module mentions added to this page's own text.
- 9 — n/a — not a readme/doc page itself (the readme.md and decisions.md changes are documentation, each already paired with this page's own live widget).
- 10 — yes — the stat-card row (the most important numbers) now leads, above the filters and grid.
- 11 — yes — the new code comments and doc/decisions.md prose are in full, plain sentences; no undefined jargon in the on-page copy.
