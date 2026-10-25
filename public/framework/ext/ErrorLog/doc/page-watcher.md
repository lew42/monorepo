# Proposal (not built): re-run a page when its files change, and log only new errors

The owner, 2026-10-24: errors are logged per page and per module, so we know the moment one happens, and the goal is pages with zero errors; "propose (don't build yet) a watcher that re-runs a page when its files change and logs any new errors." This is that proposal. Nothing here exists yet except what the first section names.

## What already exists (reuse it, don't build a second one)

- **`Servex/WorktreeWatch.js`** already does most of this, but only for a worktree an agent holds: 45 s after the last save it runs the tests near the changed files and `Server/layout-check.mjs` on the pages those files belong to (`pages_for()`), and writes a failure that still stands as one line in `failures.jsonl` in the module's own folder, with a `{clear}` line when it passes again.
- **`ErrorLog`** ([ErrorLog.js](../ErrorLog.js)) now writes a browser error as one line in the same file of the module that threw (since 2026-10-24), and `app.js` installs it on every page.
- **Servex `follow`** delivers a new line in any followed `.jsonl` to whoever follows that folder ([Servex/doc/follow.md](/Servex/doc/follow.md), "One subscription system").

## The proposal

1. **Same class, one more tree.** Give `WorktreeWatch` a "main" mode that watches `public/` of the main checkout, the way it watches a worktree today. No new watcher class.
2. **Which pages to re-run:** the pages a changed file belongs to (`pages_for()`, today: the file's own folder page), plus the pages that import it one level up (the import list the test runner already reads for "near" tests).
3. **When:** after the same quiet spell (45 s after the last save), never per save; one headless page at a time through the shared queue, so a burst of saves costs one run.
4. **What counts:** `pageerror`, `console.error` and failed requests (4xx/5xx for the page's own files). A page's first run records its errors as the baseline; later runs report only an error that is **new** and still there on a second load ten seconds later (the noise rule).
5. **Where it goes:** one `{at, fail:{kind:"page-error", page, msg}}` line in the module's `failures.jsonl`; a page that was failing and now loads clean writes one `{at, clear:{page}}` line. Nothing is sent to anyone directly: an agent changing a module follows it and hears it.
6. **The zero-errors board:** a node script folds every `failures.jsonl` into one list (page, module, still failing since) for a page under [/framework/ai/errors/](/framework/ai/errors/), computed on read.

**Cost and risk.** One Chromium page at a time, about 2 to 5 s per page; a save to a shared module (`core/View`) touches every page, so the import fan-out is capped (the first 20 pages by visits, the rest on the nightly crawl). Instead: run the whole crawl (`Server/health`) every few minutes, which is simpler but slow and would report old errors again and again.

## How the global `ai/errors/` folder moves to per-module logs

1. **Done (2026-10-24):** every error is written to its module's `failures.jsonl` first; the day file `ai/errors/<date>.jsonl` still gets a copy, as the index.
2. **Next:** the zero-errors board (step 6 above) reads the module files, and the few readers of the day file (this module's own page, and audits that quote it) move to it.
3. **Then:** `ErrorLog.report()` stops writing the day file, and old day files move to `ai/errors/archive/` (moved, never deleted).
