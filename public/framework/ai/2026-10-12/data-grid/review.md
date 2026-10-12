verdict: fix
1. [fix] The branch is out of date and will not merge. Commit 0443c3b95 (worktree/data-grid-5) conflicts with michael/dev in `ai/AISession/AISessionsPage.js` (`git merge-tree` reports CONFLICT). Since the branch was cut, the server-query parity work (d5634fab3, bf22ffdaf) moved `arrange()` into `AISessionBuckets.arrange` and made remote mode the default on the dev socket. Rebase onto michael/dev and redo the change against the new code.
2. [fix] Deleting `AISessionBucketView.js` breaks remote mode. On michael/dev the node query still sends bucket heads (`remote_row_of`: "A bucket head … is drawn as sent"), and `bucket_view()` (AISessionsPage.js:140) still builds an `AISessionBucketView`. Removing the file without removing those bucket heads in node (`AISessionBuckets.arrange` / the query source) leaves remote mode, which is the default, with a missing import or rows it cannot draw. Hide routine kinds in node too, or keep the file.
3. [fix] The chips and search only work in `?source=files` mode. The new search box and `render_kinds()` live on the files path (`render_controls`/`arrange`). Remote mode has its own `remote_controls()` search (AISessionsPage.js:~498) and never calls `arrange()`. So a chip click (`this.grid.apply(false)`) does nothing there; it needs `this.remote_ask()`, as the old bucket toggle on michael/dev does. The owner sees the remote page by default, so the asked-for "chips instead of grey rows" will not show up there.
4. [fix] The stats line can read "NaN routine hidden". `render_counts()` (diff, AISessionsPage.js render_counts) tests `this.filtered_count > (this.listed ?? 0)` but then subtracts `this.listed` raw. In remote mode `listed` is never set while `filtered_count` comes from the server, so the line prints `NaN`. Use the same fallback in both places, or set `listed` in `remote_ask`.
5. [note] The chip head always says "routine, hidden", even when some chips are on (render_kinds). "routine:" plus the pressed state on each chip would not contradict the chips.
6. [note] Search returns `{ base: hits, filtered: hits }` before the date, closed and role filters run, which is what the tooltip promises. But the role chips then total the search hits, not the window, which can surprise a reader. Worth one line in doc/buckets.md.
7. [note] probe-find.mjs and find.json show it working in files mode (0 page errors at 3440/1920/400; the search reaches routine "clarity" sessions). No shot or probe covers remote mode, which is where items 2–4 break.

## Requirements
Widths given: none (this is a follow-up diff with no review shots; find-3440.png, find-1920 data and find-400.png from the task's own probe were used).
- 1 "One grid" — yes — STATE.md: ui/datagrid and ui/table re-export ext/DataGrid (an earlier commit, 137750706); this diff does not touch it.
- 2 "Sessions on it without regression" — no — remote mode (the default on michael/dev) loses its bucket view and gets chips that do nothing (items 2–4).
- 3 "Class architecture page first" — yes — ext/DataGrid/doc/architecture.md exists (STATE.md, Decided).
- 4 "Two views, a setting not two classes" — yes — the Table/Rail toggle is unchanged by this diff; the bucket card variant goes away with the buckets.
- 5 "Coordinate with the sessions masterminds" — no — this diff was built on a stale base while the server-query parity work changed the same file (item 1).
- 6 "Smoke clean; commit each step; merge" — no — it does not merge cleanly.

## Words
- content 1 — yes — the chip labels say kind · count · cost ("short headless · 2,976 · $174").
- content 2 — yes — the tooltips are plain sentences; the shortened OpenRouter line moves its caveats into the title.
- content 3 — no (a note) — "routine, hidden" is wrong once a chip is on (item 5).
- content 4 — yes — doc/buckets.md records why the grey rows became chips and links the shots.
