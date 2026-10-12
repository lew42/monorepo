# paging-fix-8 — the closing pass after audit 8 (Sonnet)

Read first: the repo's `CLAUDE.md` (law 2, the Presentation section), `../../2026-09-04/mastermind-platform/minion-rules.md`, then the two eighth audits — `../paging-audit-8/task.jsonl` (the newcomer: 6/6 at 5, exit condition met, four cosmetic items) and `../paging-audit-8b/task.jsonl` (the designer: two items, one of them the last thing a reader would notice) — and `../paging-fix-7/task.jsonl` for the shape of a fix pass here. Skills: `new-task` (this dir, group `paging`), `code`, `ui-test`, `finish-task`. You own `public/imagine/paging/`.

## Six small items, in order

1. **The drawer's boxes never go stale.** `config.js:92` reads `page.node_now()` OUTSIDE the drawer callback; `ext/drawer/drawer.js:44` re-runs only the callback, so after you press a word the tick says Saved, the disk is right, and the file box below still shows the old word — and Copy hands out the stale text. Move `const node = page.node_now()` inside the callback; pass `copy_chip` a getter (`config.js:420/425`; its own comment at `:26` says so). Prove: open the drawer, press **Wide**, read the file box without closing the drawer — it says wide; Copy yields wide.
2. **A default-tab star on Make's rows.** `build/page.js:359` is the only caller of `set_default`; `make/tabs.js:60` gives a row rename/up/down/add/delete and no star. A sixth row act through the same `make.apply()` seam. Prove: star Later on `make/notes/`, reload, Later opens first; restore.
3. **The file's dialect, said once.** Under *This page, as a file*, one line: "`surface` is content colour, `background` is page colour, `type` is type size — the disk keys are older than the labels" (the recorded decision in `doc/decisions.md`).
4. **A typed nest is named by its title.** The nest field's sentence says "**notes** goes inside this page's box" for `/imagine/paging/make/notes/`; use the fetched page's title (*Notes*), the way the twelve chips do.
5. **The drawer's grip is visible.** The file and code boxes are 280px at 1280 and 275px at 3440 while the JSON needs 430; the drawer IS resizable (304 → 797px measured) but its edge is 12 unmarked pixels. Mark the grip (a hairline handle, the way `ext/grip` draws one — read it; import, do not copy) and, on a window over 1920, open the drawer wider by default so the boxes fit.
6. **One table row.** `/imagine/paging/templates/navigation/`, the *uses* table: the row described as `imagine/paging/paging.js` links `/imagine/paging/mechanisms/`; make the text and the href agree.

## Prove it

`ui-test` for 1 and 2; screenshots of the drawer at 1280 and 3440 after 5; zero console errors at 400/1280/1920/3440 across the realm (108 pages last time; match it), only the known `readme/page.js` probe 404; `made/` byte-identical by md5 after your tests.

## Fences and budget

Write only under `public/imagine/paging/`; this task dir. Never `core/`, `ext/`. Private server (kill by the pid you started — the mastermind's is down, the owner's is on 80: never touch it); never `find /`; never spawn agents; never `git stash`/commit. Budget ~150k tokens. Report in ≤ 8 plain lines: which of the six landed, the proof for 1, what you left and why.
