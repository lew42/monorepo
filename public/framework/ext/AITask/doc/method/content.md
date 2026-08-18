The `Page` entry point — not part of the `report()` override chain (see
[template](/framework/ext/AITask/doc/template/)). Awaits `session()` and
`requirements()` **once**, in parallel, then hands both to `report()`.

⚠ Follows the synchronous-capture pattern exactly: `div.c(…, async $s => …)`
captures the container before the `await`, and the result is filled inside
`$s.append(() => …)` — a callback, which re-establishes the captor. A factory
call written directly after the `await` (not inside that callback) would
append to whatever the captor has since become, silently.

No manifest and no `requirements.md` renders one line — "No `task.jsonl` or
`session.json` beside this page yet" — rather than a blank page a reader
might mistake for a slow load.
