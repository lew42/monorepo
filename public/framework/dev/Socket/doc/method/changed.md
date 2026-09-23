## Usage

**Zero callers in `public/`** — like `reload()`, it is invoked by name from the
server, through `message()`'s method lookup. `Server/plugins/SocketServer/LiveReload.js`
debounces chokidar's writes and broadcasts one frame:

```json
{ "method": "changed", "args": [["/framework/core/Page/Page.css", "/app.js"]] }
```

Paths on the wire are **url-paths** — forward slashes, root-absolute, never
`public/…`. [wire](/framework/dev/Socket/doc/wire/) is the full protocol.

## Necessity

This is what replaced "every save reloads every tab". During a parallel agent
fan-out the old broadcast made a dozen tabs thrash on files none of them had
ever loaded; `changed` asks each tab whether the write concerns *it*.

**The decision, per path, in order:**

| the tab | the path | outcome |
|---|---|---|
| never fetched it | anything | **ignored** — no reload, nothing |
| fetched it as a `<link rel="stylesheet">` | matching link found | **hot-swap** — `?t=` bumped on that element |
| **read it as data** (`fetch`/XHR) | `.json` `.jsonl` `.md` `.txt` `.csv` | **`data` event** — `socket.emit("data", path)`, no reload |
| fetched it any other way | `.js`, a fetched `.css`, a fetched `.html` | **reload**, once, for the whole batch |

Only after every path is judged does it reload, and only once — a batch of
twenty files is one navigation, not twenty.

## The data row is the one that mattered (2026-09-22)

A tab left open on `/framework/ai/` reloaded **215 times in one day**, and **203
of those were `directory.json`** — `Server/plugins/Directory.js` rebuilds that
manifest whenever any file appears anywhere under `public/`, and every agent
starting a task creates several. The board had *fetched* that file, a fetched
path counted as not-swappable, and not-swappable meant reload. Ninety-four
percent of the day's reloads were the tab being told about a file it had read
rather than run.

A data file cannot be hot-swapped — nothing in the DOM points at it, the page
*read* it. But a change to one is new **content**, not new **code**: the program
running in the browser is byte-identical afterwards, so re-reading the file is
the whole fix. So the tab now fires an event and any page can subscribe:

```js
// the socket is the only thing in the browser that hears the file system
const off = app.socket.on("data", path => {
    if (path.endsWith("/directory.json")) reread();
});
```

`on(name, fn)` returns its own unsubscribe. The first subscriber is
`ext/AITask/dashboard.js` — the AI board's day list and index rail re-read the
manifest in place, so a new task dir appears without the page moving.

**⚠ Extension *and* initiator both have to say data.** [files](/framework/ext/files/)
FETCHES a `.js` to show its source, and that same `.js` is a live module that
really does need a reload. The extension test is what keeps those apart.

**What is still left that needs a reload, and why it cannot be helped here:** a
changed ES module. There is no build step on this site, and a browser cannot
re-import a module over the old one — the old instances, their closures and
their event listeners are already live. Re-importing with a cache-busting query
gives you a *second* copy running beside the first, which is worse than a
reload. That is the whole remaining case, and it is now most of what a reload is
for.

`paths` absent, or containing a `null`, means *"the server does not know what
changed"* and falls back to `reload()`. That is deliberately the old behaviour:
`Directory.update()` and anything else that can't name a file keeps working
without knowing this method exists.

## The two helpers

`loaded()` answers *"what did this tab actually fetch"* from
`performance.getEntriesByType("resource")`, keyed by pathname, same-origin only.
Its value is whether the path is still hot-swappable — **false once anything read
the file as data** (`initiatorType` `fetch` or `xmlhttprequest`). `md.file()` and
[files](/framework/ext/files/) both do that, and swapping a `<link>` would leave
the source shown on screen stale. When in doubt, reload.

`restyle(path)` finds every same-origin `<link rel="stylesheet">` whose pathname
matches and bumps `?t=<n>` on it, counting up through `socket.swaps`. It returns
`false` when no link matches, which is how a `.js` — or a `.css` pulled in by
`@import` rather than a link — falls through to the reload branch with no
extension test anywhere.

## Traps

**⚠ It mutates the SAME `<link>` element.** Appending a replacement and removing
the old one is the usual recipe and it is wrong here: a new element registers its
`@layer` names at the *end* of the cascade, so `site` silently lands past `util`
and the whole site's overrides invert. Setting `href` on the element in place
keeps its position in `document.styleSheets`; verified — the swapped sheet stays
at the same index, and the new rules apply with no navigation.

**⚠ `window.$BLOCKRELOAD` no longer short-circuits this method** — changed
2026-09-22. It used to stop everything, on the reasoning that a hot-swap changes
the page under you as well. That reasoning was too broad: blocking means *do not
throw my state away*, and neither a CSS swap nor a data event throws anything
away — they are exactly what you wanted **instead of** a reload. So only
`reload()` itself refuses now, and it counts each refusal
(`socket.skipped`, shown as "3 held" in the dev bar — `dev/DevBar/blocked.js`).
A devtools style edit you want to keep is still protected the same way it always
was: the swap re-fetches the file, it does not re-apply your inspector overrides,
which a reload would have discarded anyway.

**⚠ `public/index.html` is a navigation entry, not a resource entry**, so editing
it no longer reloads anything. Known and accepted: the SPA fallback means the
navigation url is the *route*, not the file, and `index.html` changes about once
a year. Hard-reload the tab after editing it.

**⚠ It depends on a line in `/app.js`.** `performance.setResourceTimingBufferSize(100000)`
runs before the app is built, because the default buffer stops recording at ~250
entries and this page alone loads 339. Without it a long-lived tab quietly forgets
its own files and stops reloading — with no error, ever.
