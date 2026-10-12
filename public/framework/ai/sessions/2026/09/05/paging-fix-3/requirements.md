# paging-fix-3 — the fix pass after audit 3 (Opus)

Read first: the repo's `CLAUDE.md` (law 2, the Presentation section), `../mastermind-day/requirements.md`, `../../2026-09-04/mastermind-platform/minion-rules.md`, then the two audits you are fixing — `../paging-audit-3/task.jsonl` (the newcomer: scores 3/5/5/4/4/3, six items, all names and defaults) and `../paging-audit-3b/task.jsonl` (the designer: a live throw, Build's old schema, nine items with file:line) — and `../paging-fix-2/task.jsonl` for what the last pass did. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `css`, `ui-test`, `documentation`, `finish-task`. You own `public/imagine/paging/`.

## The merged list, in order

1. **Make's Save throws.** `make/page.js:427` calls an undefined `words`; call the seven-word reader (`config_of`). Prove: press Save under the JSON box on `/imagine/paging/make/`, no error, the file on disk carries the seven words.
2. **Build speaks the seven words.** `build/words.js:116` `DEFAULT_MODE` becomes the same seven keys Make writes (`navigation` `content` `room` `arrangement` `surface` `background` `type`, plus `arrange`/`blocks` if they are real); `build/page.js:164/166/168` controls write those; delete the migration branch in `make/tabs.js:40` once nothing writes the old keys. Rename Build's step 4 from "Layout" to **Arrangement** with the bar's seven values, not `LAYOUTS`' three. Prove: build a page in Build, open it in Make, change a Make chip — it changes (today Build's Navigation/Surface/Layout are no-ops on Make pages).
3. **One meaning per name.** `build/words.js:93` `BLOCKS` collides with `blocks.js:151` `BLOCKS`; two `nav_of`, two `code_for` — one each. The file-format examples (`make/made.js:32`, `make/page.js:248/254` — "three mode words") show the seven-word schema.
4. **Everything sendable.** The nine `cross/` cells become links to `?navigation=X&arrangement=Y` (`cross/page.js:44`); the nest preset's nest gets an id (`library/page.js:46`) so `?nest=` appears, the drawer chip lights and can be clicked off.
5. **The bar's last two controls.** `Code` and `More` both call `fill_drawer` unchanged (`toolbar.js:113/123`) — Code scrolls the drawer to the code box, or one button goes. The Library's "PICK ONE OF TWELVE" reads as unset while a preset runs — fold it into the bar as an eighth labelled select showing the live preset's name. The drawer's `Layout 1.stack` (`blocks.js:91`) says "one column" in words and links the layouts realm beside it.
6. **First impressions at 3440.** `/stage/`, `/skin/`, `/mechanisms/swap/` open on 720px of prose in a 2739px box; open the block pages on `content: cards` the way the hub does, so a wide screen's first look is not a mostly-white box. Measure the box's used width before and after.
7. **Honest docs.** `stage.js:24` and `readme.md:100` claim one renderer; say "one renderer for a configured page" and link `doc/builder.md`, which gets the corrected order (the schema first, then `draw_child`, then `BuildStage` → `PagingStage`). `compare/` is dropped from the plan: `cross/` is that page.
8. **Dead rule** `paging.css:297` `.paging-stage-flip`.
9. **If budget remains after 1–8:** `BuildStage` renders a `PagingStage` behind a `draw_child` seam — only now that the schema is one.

## Prove it

`ui-test`: Save on Make; a Build-made page edited in Make; a cross cell click landing on its configuration; the nest chip lighting and clearing. Screenshots at 1280 and 3440 of Build, Make, cross, and a block page's first fold. Zero console errors at 400/1280/1920/3440 across the realm's pages (the last pass ran 25 pages × 4 widths; match it).

## Fences and budget

Write only under `public/imagine/paging/`; this task dir. Never `core/`, `ext/`. Private server (kill by the pid you started); never `find /`; never spawn agents; never `git stash`/commit. Budget ~400k tokens. Report in ≤ 10 plain lines: which of the nine landed, the two proofs (Save; a Build page edited in Make), the 3440 first-fold numbers, what you left and why.
