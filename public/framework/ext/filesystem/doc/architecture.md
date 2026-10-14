# filesystem architecture — plain objects for files, and one door for writing them

`ext/filesystem` is the data behind every file on the site: [`FsFile`](../FsFile.js) and [`Dir`](../Dir.js), built once from the dev server's `/directory.json` by [`tree.js`](../tree.js) and shared. It holds no UI; [`ext/files`](/framework/ext/files/) draws these objects. `FsFile` is also the only code that writes files.

## FsFile is the only writer

**Decided:** every file write on the site goes through `FsFile.write`, `FsFile.append`, `FsFile.clear` or a `.jsonl` file's `store`; nothing else calls the dev socket's `write` or `append` RPC.
**Why:** about 15 scattered raw socket calls meant each one re-solved failure handling, and none shared an echo-skip list. Now there is one place to check for localhost and one place to fix.
**Instead:** each caller talking to the socket itself (flexible, but every caller repeats the guards). `node Server/review.mjs --file-api` fails a branch that adds a raw call.
**Detail:** [readme.md, One file API](../readme.md#one-file-api)

## A log is only ever appended

**Decided:** `append` takes plain objects (one call for any number of lines) and only for `.jsonl`; `write` refuses a `.jsonl`; `clear` is the one whole-file operation a log allows, for compaction.
**Why:** rewriting a log drops lines another writer added since you read it.
**Instead:** read-modify-write of a log, which loses lines under concurrent writers.
**Detail:** [doc/decisions.md](./decisions.md)

## One writer per log, through its store

**Decided:** a `.jsonl` `FsFile` exposes `store` (`Item.Store.for(url)`, one cached instance per url); when an Item is attached (`store.host`), `append` goes through the store, otherwise `send` makes a single RPC.
**Why:** every `FsFile` built for the same path must share one writer and one echo-skip list, even though a tree walk builds a fresh instance per row.
**Instead:** each `FsFile` owning its own queue, which would double-send and double-echo.
**Detail:** [doc/decisions.md](./decisions.md)

## Failure is a false, never a throw

**Decided:** a write with no live dev socket warns once and returns `false`; so do server refusals and bad input.
**Why:** production is static and has no socket, so callers should not each guard for that.
**Instead:** throwing, which would force try/catch at every call site.
**Detail:** [FsFile.js](../FsFile.js)

## The socket loads on first write

**Decided:** `FsFile` imports `Socket` inside its write methods, not at the top of the file.
**Why:** every row of every file tree builds an `FsFile` just to `render()`, and loading the socket for rows nobody writes to was a measured cost.
**Instead:** a top-level import, simpler but paid on every page that shows a tree.
**Detail:** [FsFile.js](../FsFile.js)

## The names: `FsFile` keeps its prefix, `Dir` drops it

**Decided:** the file class is `FsFile`; the directory class is `Dir` (`FsDir.js` is a one-line re-export).
**Why:** `File` is the browser's own upload class, and shadowing it bites the first feature needing both; nothing global is called `Directory`.
**Instead:** `File` (the silent collision) or `FsDir` (an unneeded prefix).
**Detail:** [doc/decisions.md](./decisions.md)

## One shared tree, null off the dev server

**Decided:** `root()` fetches the tree once (via `core/Page/Markdown.js`'s `tree()`), caches the promise on `Dir.rooted`, and resolves `null` when there is no `/directory.json`; `resolved()` is its synchronous half for callers that cannot await.
**Why:** one fetch for the whole page, and production has no directory listing.
**Instead:** each reader fetching its own copy, or building the tree on a server.
**Detail:** [tree.js](../tree.js)

## Folders still draw themselves

**Decided:** `FsFile.render()` uses `ui/item`'s row; `Dir.render()` stays hand-built.
**Why:** `ext/files` folders build their rows lazily on first click, and `ui/item`'s tree mode hands open/shut to `<details>` with no hook for that.
**Instead:** moving folders to `ui/item` too, which is a rewrite of the click routing rather than a class swap.
**Detail:** [ui/item reuse](/framework/ui/item/)
