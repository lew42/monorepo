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
| fetched it any other way | `.js`, `.md`, `.json`, a fetched `.css` | **reload**, once, for the whole batch |

Only after every path is judged does it reload, and only once — a batch of
twenty files is one navigation, not twenty.

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

**⚠ `window.$BLOCKRELOAD` short-circuits the whole method**, not just the reload
branch. A swap changes the page under you too — a devtools style edit is exactly
the state `$BLOCKRELOAD` exists to protect — so blocked means *nothing happens*.

**⚠ `public/index.html` is a navigation entry, not a resource entry**, so editing
it no longer reloads anything. Known and accepted: the SPA fallback means the
navigation url is the *route*, not the file, and `index.html` changes about once
a year. Hard-reload the tab after editing it.

**⚠ It depends on a line in `/app.js`.** `performance.setResourceTimingBufferSize(100000)`
runs before the app is built, because the default buffer stops recording at ~250
entries and this page alone loads 339. Without it a long-lived tab quietly forgets
its own files and stops reloading — with no error, ever.
