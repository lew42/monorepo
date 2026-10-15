# ErrorLog — a UI error becomes one log line a session can follow

`ErrorLog.watch(stateFn)` once per page, `ErrorLog.report(e, ctx)` for caught errors. Appends to `/framework/ai/errors/<date>.jsonl` through the one file API. First used on [Refine](/framework/ext/Refine/). Design, options and open questions: `doc/design.md`.

## More

- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why
