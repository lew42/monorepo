# paging-fix-6 — the fix pass after audit 6 (Opus)

Read first: the repo's `CLAUDE.md` (law 2, the Presentation section), `../mastermind-day/requirements.md`, `../../2026-09-04/mastermind-platform/minion-rules.md`, the two sixth audits — `../paging-audit-6/task.jsonl` (the newcomer: 5/5/5/4/5/5, seven steps passed, six S items on the address seam) and `../paging-audit-6b/task.jsonl` (the designer: conditions 1 and 2 true, three breaks on nesting and the default tab, seven items with file:line) — and `../paging-fix-5/task.jsonl`. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `css`, `ui-test`, `documentation`, `finish-task`. You own `public/imagine/paging/`.

## The merged list, in order

1. **The address gets its own line.** When `content` is an address the CONTENT group is 106px tall against 57px siblings and "Draw it" wraps. Give the address its own full-width line under the seven words; the field takes the row's spare width (153px on a 357px value today — a reader sees 12 of 56 characters); a Copy button beside it. Measure the bar's group heights after: equal.
2. **A nested page survives being saved.** The drawer hands you `?nest=dashboard` and both exports — `config.js:317 node_for()` and `:295 code_for_config()` — drop the nest silently. Carry it: `nest` into `mode` (`blocks.js:295 EXTRAS`), read back in `stage.js`. Prove: save a nested configuration, open the made page cold, the nest is there; the printed `page.js` carries it.
3. **The default tab is read on the saved page.** `build/words.js:181` writes `mode.default`, `build/stage.js:54` reads it, `stage.js:72 stage_props()` returns no `open` — one line (`open: kids.findIndex(is_default)`), and the printed `page.js`'s dangling `// the tab that opens first` gets its code.
4. **The two url controls accept the same pages, and a miss tells the truth.** `?nest=<preset url>` runs while `?content=<the same url>` says "There is no page or file at…" — `stage.js:422 page_at()` asks `nest_of()` first. The miss sentence says what an address may be ("a page you made, a preset, or a `.md` file"). An off-site address (`https://…/a.md`) is either fetched or declared unreadable at the field — never dropped silently while the url keeps it.
5. **Build: the bar owns the words.** `build/page.js:188/190/192` duplicate three of the bar's seven controls — remove them; the left column keeps Name · Blocks · Pages · Code. The file pane (`.build-json-text`, 287 client on 455 scroll at 1280) takes the card's width with its own scroll and a Copy, like step 7's box.
6. **Small:** `/imagine/paging/content/`'s lede says the ninth answer (an address) — today it is two folds down; the nest chips get `aria-pressed` (12 of 51 lack it); the docs one level in rewritten to what exists (`doc/mechanisms.md:48-56`, `doc/templates.md:52-60`, `build/readme.md:71-73` still teach `chips()`/`at("mech")`/`axes:`/`Template.Toolbar`/`dress()`); `blocks.js:68 kind_of()` deleted (called by nothing); `make/made.js:212` writes `made/page.json` with a trailing newline so a save leaves no spurious diff.

## Prove it

`ui-test`: the bar's group heights with an address in the box; a saved nest round-trips cold; the default tab opens on a made page; `content=<preset url>` runs; an off-site address gives the declared result; Build's three duplicate controls gone and the file pane's width. Screenshots at 1280 and 3440 of the bar with an address, Build, a nested made page. Zero console errors at 400/1280/1920/3440 across the realm (58 pages last time; match it), only the known `readme/page.js` probe 404.

## Fences and budget

Write only under `public/imagine/paging/`; this task dir. Never `core/`, `ext/`. Private server (kill by the pid you started); never `find /`; never spawn agents; never `git stash`/commit; restore any file a save test wrote. Budget ~350k tokens. Report in ≤ 10 plain lines: which of the six landed, the proofs for 1–4, what you left and why.
