# The idea: a path is a page

**A dynamic page is a url that opens even though nothing was ever saved at that path** — no folder, no `page.js`. An ancestor page answers the name itself, through `child()`, which asks `route()` before it ever checks the filesystem. Where that mechanism is actually explained — not repeated here:

- [`doc/method/child.md`](/framework/core/Page/doc/method/child.md) — the method: memory, then `route()`, then the filesystem, in that order.
- [`doc/property/route.md`](/framework/core/Page/doc/property/route.md) — the `route(name)` hook on its own.
- [`overview/route/`](/framework/core/Page/overview/route/) — a small hard-coded demo: three urls built from one object.
- [`overview/folders/`](/framework/core/Page/overview/folders/) — a page built the instant you ask for it, the same shape AI 2's own day and card pages use.
- [`dynamic/example/`](/framework/core/Page/dynamic/example/) — this module's own live example: real data on disk, one template.
- [`doc/uses.md`](/framework/core/Page/dynamic/doc/uses.md) — where this runs for real, today.

## Whatever it returns is a real page

Nothing about the result is special or partial. `route()`/`child()` hand their answer to `add()`, the one place every page gets adopted (a `name`, a `parent`, `app`) — the same door a `page.js` file's page walks through. A page instance always looks like a page instance, whichever door it came in by.
