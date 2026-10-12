# How the Sessions grid loads (2026-10-12)

**Rule:** open on the newest month; older days load only when asked.

The window starts at the 1st of this month (at least 7 days back). Every day has one small real file (`YYYY/MM/DD/index.json`, listed by the month and year roll-ups). Moving the **From** box, or pressing **show 30 more days** under the grid, fetches just the older day files. A day already read is never fetched twice (`AISessionLive.load`, `AISessionsPage.set_from`).

| Measured (headless, same worktree, 1200 and 400 wide) | Before | After |
|---|---|---|
| Whole page, bytes | 10,748 KB | 9,523 KB |
| Day files at first paint | 10 | 5 |
| Time to first row | 0.9 s | 0.85 s |

On the real data (30 days of day files, about 4.7 MB) the same cut removes September, about 1.2 MB. The first row never waited on day files; the saving is bytes and parse time.

## Still open (real blockers)
- **Apply-the-tier button:** needs a browser-to-Servex route that resumes or seeds a session. None exists, and starting agents from a button is the owner's call (`Servex/agents/Layers.js` is the nearest piece).
- **Tree and closed list** still read `session-index.json` (286 KB). They need the day snapshots to carry the `closed` mark and the parent link first.
- **Weight outside this page:** `session-flags.json` (1.4 MB) and `spend-tree.json` (0.9 MB) load on every visit, and `directory.json` (5.8 MB) is fetched about 35 times by the site shell. That last one dwarfs everything here and is not a Sessions file.

## Follow-up 2026-10-12 (owner asks while the grid was open)

| # | Ask | Result |
|---|---|---|
| 1 | Screenshots at 400/1200/1920/3440, before and after | `shots/before-grid-*.png` and `shots/after-grid-*.png` (the Cost and tag clipping, and the wide Name column, are visible in the before set) |
| 2 | Column widths, table or grid | **Kept the CSS grid** (one `--col-*` token per column is the resize knob; a `<table>` has none). Name is capped (`--col-name` 26rem, it took every spare pixel), Cost grows to its widest cell (`max-content`, floor 14rem) so a flag never clips it, Role and Model size to content. *Alternative:* a real `<table>` with auto layout, which sizes columns by content for free but loses the single resize token and the stacked-card layout below 88em. `sessions.css`. |
| 3 | Lag | Measured in a headless page (35 s, 1200 wide): about 6,450 DOM nodes (the grid renders 200 rows at a time; "5955 sessions shown" is the count, not the DOM), **36 full redraws in 35 s** (Servex agent events redrew the grid about once a second, 45 ms each) and a 1.4 MB `session-flags.json` fetch plus redraw every 30 s. Now: agent events redraw only the Now strip in 250 ms, the grid at most every 3 s (`draw_later`), flags every 2 minutes. Result: 11 redraws, redraw time 1646 ms to 564 ms, long tasks 19 to 10. Row count stays paged (200); a windowed list was not built because rows are variable height. |
| 4 | "8,000 became 6,000" | Nothing was lost. The window used to open about 30 days back; it now opens on the 1st of the month. The roll-ups say October 1–12 holds 5,706 closed-day sessions plus today's 449 (the page shows 5,955 after a revived session counts once); **September 12–30 holds 2,286**, which is the missing 2,000. "show 30 more days" brings it back. |
| 5 | "Now" repeats below | The Now strip's sessions are no longer listed again in the grid (`AISessionsPage.render_rows`); a child of a Now session still nests under its own parent, or stands alone if the parent is in Now. |
| 6 | Model from the latest turn | `AISession.current_model()` reads the latest main-thread turn (`s.current`). A state saved before this re-reads its transcript once on its next new lines (`s.rebuilt`). Proof: `current-model-proof.mjs` prints Sonnet most-run, Opus current, title "Usage" for the night-mastermind tab. |
| 7 | What each session spent on | Each row shows the modules it edited and the count of files, from its own Edit/Write calls (`s.touched`), with the task audit's module join winning where it has one. `files.jsonl` in a task folder is only a directory listing, so it was not a source. Which session spent how much on a given *file* is not stored; a per-file list would extend `s.touched` (it already holds file to times). |

Tab title, registered name, current model, a **Now** strip on top and stale rows below: the row title is the tab's own title (`ai-title`/`custom-title` line in the transcript) with the `register_session` name beside it.
