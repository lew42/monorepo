# self-evident-minors — the seven minor findings round three left

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `ux`. One builder. Round three ruled "nothing above minor remains"; this pass closes the minors so the two screens ship clean.

## The three laws, and your length budget

1. **Less is more.** Seven small fixes, each the smallest change that removes the misreading. No redesign, no new prose beyond a label or a title.
2. **Clear beats brief.** After each fix, re-run the critic's gesture headless and shoot it.
3. **Prioritize.** The critic's order, 1 → 7.

Budget: a landing report of one screen — a line per number, fixed how, after-png path.

## The spec is round three's log

`public/framework/ai/2026-09-13/self-evident-critique-3/task.jsonl` — the numbered finding lines and the landing `outcome` (the table of seven), pngs `01-…png` … `05-…png` beside it. Read them all first. Round two's fix brief (`self-evident-fixes-2/requirements.md`) has the method and the data rules; read it once.

## The seven

1. **Make · the drawer's twelve nest chips** wear the same fill as the acts beside them (`Put it inside`). Give a selected nest chip a state shape that is not the act shape — the same distinction the seven word rows got in fix pass two (`paging/config.js`, `paging.css`).
2. **The two colour swatches** (Make's right pane and the realm's stages): a `title` naming the surface, and a swatch that shows the three near-white surfaces apart (a hairline or a pattern is fine) — `paging/toolbar.js`, `paging.css`.
3. **Importance · the judge cards** do not say what kind of thing each is. One small word per card (`question` / `caveat` / `option`) beside the glyph, and a `title` on the glyph — `importance/views.js`.
4. **Importance · `qualifies`** is `edge.rel` printed raw where a status goes. Say "qualifies the answer above", or drop it — `importance/views.js` / `page.js`.
5. **`/imagine/` · the wall** cuts 19 of 24 card descriptions mid-word, and its second line still says *Nothing here opens a new screen*. End a clamped description on a word (or at a sentence), and make the line true or delete it — `public/imagine/page.js`, `public/imagine/imagine.css` (read core's `.page-preview` rules in `core/Page/Page.css` first; fix the realm's own rule, not core).
6. **Importance · the reason box** carries no `title` for its key rule while the name box does. One title: "typing here — 1 / 2 do not cast while you type a reason" (or shorter) — `importance/views.js`.
7. **Make · the unarmed `Reset`** does not say its scope. The label carries it: "Reset the pages you made" (or the fixer's shorter true phrase) — `paging/baseline.js` / `make/page.js`.

## Fences

- Own: `public/imagine/paging/make/**`, `public/imagine/paging/config.js`, `public/imagine/paging/toolbar.js`, `public/imagine/paging/baseline.js`, `public/imagine/paging/paging.css`, `public/imagine/importance/**`, `public/imagine/page.js`, `public/imagine/imagine.css`, `public/framework/ai/2026-09-13/self-evident-minors/**`. Nothing under `public/framework/`.
- Data rules, exactly as before: full copy of `public/imagine/paging/made/` before the first gesture, probe pages `zzz-probe-*` deleted before landing, `diff -r` and `git status` on `made/` unchanged; `md5sum` the three importance data files before and after, every test row removed by id, both hashes logged.

## Rules every brief carries

- `new-task` first (`ai/2026-09-13/self-evident-minors/task.jsonl`, group `ux`, the seven numbers as `steps`; append one line to `ai/2026-09-13/day.jsonl`). Skills: `code`, `css` / `new-css-class` for any style or class, `ui-test` before headless runs, `documentation` if a readme changes, `skill-improvement` for anything that misled you, `finish-task` to land.
- **Never kill or restart the dev server on port 80. Never drive the owner's tabs. Never `git stash`. Never commit.** Private server `PORT=8093 node server.js` from the repo root (another 809x if taken), killed by pid at landing. Pngs into your task dir as `NN-after-1280.png`.
- Resolve, don't park; findings as `log` lines.

## Landing report (to the mastermind)

One screen: seven lines (number · fixed how · after-png), the cleanup line with its evidence.
