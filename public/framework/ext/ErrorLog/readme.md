# ErrorLog — a UI error becomes one log line a session can follow

`ErrorLog.watch(stateFn)` catches a page's uncaught errors and rejections; `app.js` calls it once on every page (since 2026-10-24). `ErrorLog.report(e, { where, module })` is for an error you caught but still want seen.

## On disk

- **`<module>/failures.jsonl`** (the primary log, since 2026-10-24): one `{at, fail:{kind:"page-error", page, msg, where, stack}}` line in the folder of the module that broke: `context.module`, else the first `/framework/…` file in the stack, else the page's folder (`ErrorLog.module_of`). The same file and shape `Servex/WorktreeWatch.js` writes for a failing test or page check, so whoever `follow`s the module hears it. Git-ignored (`**/failures.jsonl`).
- **`/framework/ai/errors/<date>.jsonl`**: a copy of every line, the old global index, until its readers move to the module logs.

Both are written through the one file API (`FsFile.append`, the dev socket; a no-op off localhost), one line per distinct page and message per page load. First used on [Refine](/framework/ext/Refine/); dictation's Debug tab reports each red layer here ([ux/Dictate/doc/debug-tab.md](/framework/ux/Dictate/doc/debug-tab.md)).

## More

- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why
- [`doc/design.md`](./doc/design.md) — design, options and open questions
- [`doc/page-watcher.md`](./doc/page-watcher.md) — **proposal, not built:** re-run a page when its files change and log only new errors; how `ai/errors/` moves to per-module logs
