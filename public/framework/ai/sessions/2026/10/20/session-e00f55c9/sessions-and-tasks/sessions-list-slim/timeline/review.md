verdict: pass
1. [note] `after-1920.png` was taken before commit 83cea8187: its task rows still show "from owner", which the final code removed (session.jsonl log, 02:50:30). The proof shows an older build than the one that will merge, so retake it before or after the merge.
2. [note] The page now reads `prompts.jsonl` twice: once through `PromptLog.read` for Coverage (`AISessionDetail.js`, the `coverage.read_records` line) and once through the new `SessionTimeline.Tail`. The brief only banned a second read of the record, so this is allowed, but Coverage could use the tail's lines and drop the extra fetch.
3. [note] `SessionTimeline.js:192-195` gives `KINDS`, `HIDDEN`, `rows` and `landed_of` new names that only point back to `SessionTimelineRows`. Calling `SessionTimelineRows` directly would make the code shorter and easier to follow.
4. [note] At 390 px the tab chips now wrap to three rows (`path-6-deputy-timeline.png`: Overview…Tasks / Cost…Related / Task queue). The sticky stats bar also takes about 285 px, roughly a third of the screen, and covers the top of the list (`after-390.png`). The minion found the stats bar problem, but it was outside their brief, so it needs its own task.
5. [note] The Timeline list scrolls inside its own box (`.stl-list` max-height 72dvh, `SessionTimeline.css:135`), and the page scrolls around it. At 1920 this leaves blank space under the list (`after-1920.png`), and a phone gets two scroll areas.
6. [note] Some docs already listed the detail page's tabs and classes but were out of date before this change: `ai/sessions/doc/ui/detail-layout.md:3` still names the old Conversation tabs, and `ai/sessions/doc/ui/classes.md` lists none of the Session* tab classes. This diff didn't break them, but the Timeline is missing there too.
7. [note] The minion's log says core/Session readmes are now stale because `on_session` passes `(session, lines)`. I grepped every .md under `public/framework`: only `ai/AISession/readme.md` mentions `on_session`, and that file is updated. Nothing is stale.
8. [note] The `StoreFolder.js` change is outside the brief: redirect targets are no longer treated as moved tasks. It is the real cause of the short-id hang, it is recorded in session.jsonl (02:50:00), and `known()` loads `moved("/")` first, so `_task_dirs` always exists before it is read.

## Requirements
- Timeline tab after Overview, `?tab=timeline` opens it — yes — `AISessionDetail.js` TABS; `path-4-timeline.png`, `path-6-deputy-timeline.png`
- New class `SessionTimeline extends View`, CSS `stl-` registered under AISession — yes — `SessionTimeline.js`, `SessionTimeline.css`, `css-scopes.txt` after `soutline-`
- One compact row per event, newest at the bottom, opens scrolled to the bottom — yes — `after-390.png` (last row is the newest prompt); `draw()` and `shown()` set scrollTop
- Kinds: prompt (raw words one click down), task added/done (green check_circle), child started/landed (linked, state, model, `AICost.cost_line`), note, decision, review, log/tag — yes — `SessionTimelineRows.row`; `icon_of("done")` uses `SessionOutlineView.state_icon`; `kid_meta` uses `AICost.cost_line`. The landed row is proved only by the fixture: e00f55c9 has no landed child.
- Reuse the SessionTasks tail, no second fetch of the record — yes — `on_session(s, this.lines)` in `SessionTasks.js:23`
- No record: show the prompts alone or one sentence — yes — `settle("record")` when there is no file; `empty-390.png`
- Live without a reload — yes — session.jsonl 02:50:30: a note appended to the deputy's record took the total from 4 to 5
- Filters ▾ as a Popover, built like the list header's, no new widget — yes — `SessionPopover.open` lifted out and used by both pages; `after-390-all-menu.png`; log and tag lines off by default ("1 of 4 events", `path-6-deputy-timeline.png`)
- Phone first: one or two lines per row, no sideways scroll — yes — `after-390.png`; scrollWidth 390 (log 02:50:30)
- Short id resolves — yes — `AISessionDetail.expand` and `AISessionsPage.child`; root cause fixed in `StoreFolder.js`
- Two numbers agree — yes — 763 = 603 + 160 + 0 on e00f55c9; `node SessionTimeline.test.mjs` passes (17 = 13 + 3 + 1), which I re-ran in the worktree
- Shots: before/after 390, after 1920, owner's path 1–6 — yes — all present in this folder (but see note 1)
- Readmes: `ai/AISession/readme.md` and the "One session" line — yes — both updated in 962e47509
- New class: can you open a page that shows its live instances? — n/a — the Timeline holds no state the owner would watch beyond the tab itself
- Can a fresh agent continue from this folder? — yes — session.jsonl ends with the report: commits, numbers, shots and what is left

## Words
- Row and menu labels are plain ("Tasks added and changed", "Child sessions landed", "Every kind of event is switched off. Turn some on with Filters.") — yes — `SessionTimelineRows.KINDS`, `SessionTimeline.js:250`
- Readme paragraph says what it is, where its data comes from and how it is tested — yes — `ai/AISession/readme.md` Timeline bullet
