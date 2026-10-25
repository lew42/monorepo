verdict: fix
1. [fix] The readme and the last log line say the Overview rows use `TaskView.row(t, { verbs: false })`, but `SessionOutlineView.js` never imports TaskView; it draws its own rows (`SessionOutlineView.js` diff lines 586–595). The page has no play/stop buttons, so the owner's ask is met, but `AISession/readme.md:8` states something false and the new `verbs` option in `core/Task/TaskView.js:14,62,74` has no caller. Either draw the rows with `TaskView.row(t, { verbs: false })` as the brief asked, or delete the option and correct the readme sentence and the log line.
2. [fix] `AISessionDetail.js` (diff lines 95–96): when a session's folder is its uuid, it never gets a slug, so the work tree waits on a 10-second `setTimeout` before it loads. Until then the Overview says "Reading this session's record…", and the Tasks tab and stats bar stay empty too. Before this change they loaded at once. The timer also re-runs the whole `fill()`, which loads the cost log and trace a second time. Instead, wait on something that says the slug lookup has finished (the `folder_from_day` call just above returns one), not on a clock.
3. [note] `SessionOutlineView.read_snaps` fetches up to 32 day `index.json` files one after another before the first draw, and `AISessionDetail.days_since` builds the same list of days again (Law 6: one of everything). Use one helper for the day list and fetch the files with `Promise.all`.
4. [note] `drill-3.png`: the box under "This session's own work" says "No tasks or child sessions recorded for this session yet.", but the same screen shows one child session just above it. Say "No work of its own yet." (`SessionOutlineView.js` own_group).
5. [note] `after-proof-1920.png`: the open proof shows "No outcome, evidence or commit is recorded on this task", so no screenshot shows a proof that actually has content. Every cost line in the shots also stops at "with children …", because `AICost.summary` is stubbed in the worktree (the log says so). Re-shoot on the main site after the merge to prove both.
6. [note] `SessionOutline.js` build(): `g.kind === "own" ? g.items : g.items` has the same value on both sides; drop the ternary. `AISessionDetail.js` diff line 84 only adds a second space.
7. [note] `SessionOutline` is a new class that holds state the owner would want to watch (children found from each source, tasks drawn), but no page shows its live instances. Today those numbers are only in `data-children` and `data-drawn` attributes.
8. [note] e00f55c9 draws 99 child boxes, 96 of them from tree nodes (log line at 01:38). At 390 that is a very long scroll before "This session's own work". This is in scope for 2a, but 2b–2d should fold or cap the list.

## Requirements
- Groups = child sessions, union of record lines, SessionWork nodes and links.children, de-duplicated, counts logged — yes. `SessionOutline.children()` adds a fourth source (snapshot `parent`); the log gives 5/96/0/0, union 99.
- An "own" group last, sub-grouped by prompt via `source.prompt` — yes. `SessionOutline.source()` is the one place the join lives; test sections 1 and 2.
- Ranking: cost × 0.5^(age÷2) plus recency, and a newest-first mode — yes. `score()` and `sort()`; test section 6; a toggle in the head (`after-proof-1920.png`).
- Each child links to its own `AISessionDetail`, recursively, through a helper — yes. `AICost.session_url`; `drill-1..4.png` reach level 4.
- No chat tab on a child; `?tab=coverage` falls back to Overview — yes. `show()` guard plus `chat_ok`; `drill-3.png` has no Chat or Coverage tab.
- Drill-down test at 390, children logged per level — yes. `drill-1..4.png`; the log gives 99 / 44 / 1 / 0.
- SessionOutline.js DOM-free plus a node test (join, Other work, ranking) — yes. `SessionOutline.test.mjs`.
- View: group heading, one full-width row per task, two-line clamp, custom state icons, child on the row, subtasks folded, done task opens its proof — yes. `.soutline-ttl` clamps; `after-proof-1920.png`.
- No play/pause/stop on this page, by an additive TaskView option, and the log says what the buttons do — partly. No buttons appear and the log explains them, but the option is unused (finding 1).
- Live redraw on replay; SessionFeed kept — yes. `on_session → this.feed.record`; `SessionFeed.js` is untouched.
- Money only from AICost; the SessionWork sum is never printed — yes. `cost_line`/`short`; `item()` uses `usd` only for ranking.
- before/after shots at 390 and 1920, a proof shot, path-1..5 — yes. All are in the folder.
- Two agreeing numbers logged — yes: 500 = 500 on the page, 11 = 11 on the fixture.
- readme.md lines updated — yes, but the AISession line is wrong about TaskView (finding 1).
- Live-instances page for the new class — no (finding 7, a note).
- Could a fresh agent continue from this folder alone? — yes. requirements.md, session.jsonl (branch, commits, numbers, what was left) and the shots are all here, and the parent's session.jsonl links the folder.

## Words
- The headings are plain: "99 child sessions · 500 tasks drawn" and "Ranked by cost · newest first" — yes. `after-proof-1920.png`.
- An empty state contradicts what is on the same screen — no. `drill-3.png` (finding 4).
- The readme sentences are accurate — no. `AISession/readme.md:8` claims TaskView rows (finding 1).
