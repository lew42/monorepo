# The idea: a path is a page

A url is just a list of names separated by slashes — `/framework/core/Page/dynamic/example/route/` is really four names, walked one at a time. Normally each name needs its own folder with its own `page.js` sitting inside it. A **dynamic page** skips that: no folder for that one name exists on disk, and the url still opens, because the page ABOVE it answers the name itself.

## How the walk works

One method decides every url segment, `child(name)`, in exactly this order — see the live example on this module's own page, [`dynamic/example/`](/framework/core/Page/dynamic/example/), which is built on the middle step:

1. **Memory** — `children.get(name)`. A page already built and remembered.
2. **`route(name)`** — this page's own hook, if it defined one. Runs only for a name nobody declared, so it can never shadow a real `page.js`.
3. **Filesystem** — a `page.js` probed off disk, then a plain markdown file beside the page.

Full method doc: [`doc/method/child.md`](/framework/core/Page/doc/method/child.md). The hook itself, on its own: [`doc/property/route.md`](/framework/core/Page/doc/property/route.md).

## Two small demos that show it with nothing but a hard-coded list

- [`overview/route/`](/framework/core/Page/overview/route/) — three urls (`html`, `css`, `js`) built from one object inside `route()`.
- [`overview/folders/`](/framework/core/Page/overview/folders/) — a page built the instant you ask for it (`2025/`, `2026/`), the same shape AI 2's own day and card pages use for real.

## Whatever it returns is a real page

Nothing about the result is special or partial. `route()`/`child()` hand their answer to `add()`, the one place every page gets adopted (a `name`, a `parent`, and `app`) — the same door a `page.js` file's page walks through. A page instance always looks like a page instance, whichever door it came in by.

More: [`../doc/uses.md`](/framework/core/Page/dynamic/doc/uses.md) — where this runs for real.
