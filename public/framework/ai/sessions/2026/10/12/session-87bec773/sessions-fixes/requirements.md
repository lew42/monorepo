# Sessions page: three defects the screenshot review found (fix brief)

From [today-shots-review/report.md](../today-shots-review/report.md), 2026-10-12, live `michael/dev`:
1. **Session detail 404s on every load:** its own `page.jsonl` and `ai/2026-10-11/files.jsonl`. The second is the old flat task path: the `task-folders` move put tasks under `ai/sessions/YYYY/MM/DD/`, so some reader still builds `ai/<date>/` paths. Find every such builder (one path helper exists now: use it), and make a missing `page.jsonl` a quiet empty result, not a 404. A same-origin 404 fails smoke.
2. **3440:** the table uses about 740 px; the right two-thirds are empty. Use the space: the table fills the column (DataGrid `fill`), or a rail plus detail (the data-grid toggle); pick by screenshot.
3. **400:** the tab bar hides SESSIONS/TESTS with no scroll cue. Make the tabs fit (wrap or shorter labels) or show they scroll.

## Done when
- [ ] Shots via [Shots](/framework/ext/Shots/) at 400/1200/1920/3440, before and after; `Server/smoke.mjs` shows no 404 for the detail page.
- [ ] `hold.mjs`; commit each fix; merge; land. Remove the two lines from `ai/todo.md` once they are fixed.

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`.
