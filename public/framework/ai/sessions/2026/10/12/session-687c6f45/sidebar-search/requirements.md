# Sidebar search finds every page, loaded or not

**Owner's ask, 9 times** (2026-09-14 to 2026-10-09; [core/Page/doc/asks.md](/framework/core/Page/doc/asks.md) #4): find any page on the site from the sidebar without knowing the path. Today search covers only loaded rows.

## Done when
- [ ] Search reads the site's page index (the existing `files.jsonl` / directory data; find what exists, do not build a second index) so an unloaded page is found and opening it loads its ancestors in the tree.
- [ ] Results update as you type, routed (a reload keeps the query), keyboard reachable.
- [ ] Proof: headless, type the name of a page three levels deep that was never opened; it is found and opens. Layout-check 400/1200/1920/3440.
- [ ] Tick the ask in `core/Page/doc/asks.md` with the commit.

Sonnet 5.5, medium. Worktree; commit each step; merge. One-sentence chat replies; `STATE.md`; land with `finish-task`.
