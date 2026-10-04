# filesystem — the DATA behind every file on the site: `FsFile` and `Dir`, plus a link to any of them

> **⚠ Converge (the owner, 2026-10-02):** file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [ext/filesystem](/framework/ext/filesystem/) (`FsFile`, `FsDir` → `Dir`), [ext/files](/framework/ext/files/) (the tree UI), [ext/JSONL](/framework/ext/JSONL/), and about 15 direct `Socket` `"append"`/`"write"` calls. Before adding to any of them, consider consolidating: ONE file object (`FsFile`: `read`, `write`, `append`, and a `store` for .jsonl) as the only caller of the dev socket. Logs are appended one line at a time, never rewritten. A `LiveList`'s change events are both the view update and the line that gets appended. Design: [page-item-design.md](/framework/ai/2026-09-30/proposal-flow/page-item-design.md).

The browsing WIDGET (the tree you click through) is a different module, [`ext/files`](/framework/ext/files/) — its name is easy to confuse with this one's. This module only holds the plain objects; `ext/files` draws them.

## What

Two plain classes, built once from the dev server's `/directory.json` and shared: `FsFile`
(a path, a name, an extension, its parent, and read/write/render/link operations) and
`Dir` (a path, a name, its parent, its `children`, `find(path)`, `walk()`). `ext/files`
draws them; `/fs/` (any path + `fs`) shows a whole folder of them full screen. This ext is
the data structures; the browsing UI is [`ext/files`](/framework/ext/files/).

## Use

```js
import { file_link } from "/app.js";
import { root } from "/framework/ext/filesystem/tree.js";

file_link("framework/ext/filesystem/FsFile.js", 42);   // "/framework/ext/filesystem/fs/FsFile.js/#L42"

const site = await root();                      // the whole site, once, shared
const file = site.find("framework/ext/filesystem/FsFile.js");
await file.read();                               // the text on disk
```

`file_link(path, line?)` is the one thing most pages want: a link that opens `/fs/` with
that file already selected. Put it in a readme or a page's `content()` wherever you'd
otherwise type a raw path.

## One file API

**`FsFile` is the only thing on the site that writes files.** Nothing else calls the dev
socket's `write` or `append` RPC (2026-10-02).

```js
await FsFile.append("/x/log.jsonl", { said: "hi" });          // one line, or an array of lines: ONE call
await FsFile.write("/x/page.js", source);                     // a whole file, for anything that is not a log
await FsFile.clear("/x/log.jsonl");                           // empty a log, only to compact it
file.store                                                    // a .jsonl's Item.Store, for an Item that lives in it
```

- `append` takes plain objects only; the Append RPC refuses anything else (`append refused: lines must be an array of objects`).
- `write` refuses a `.jsonl`: rewriting a log loses lines other writers added since you read it.
- Each returns true or false and warns once off localhost; a caller never checks the socket itself.
- **The review checks it.** `node Server/review.mjs --file-api <worktree>` (and every review run) fails on a raw `async_rpc("append"|"write"` or `method: "append"|"write"` outside `FsFile.js` and `dev/Socket/`.

## Watch out

- `Dir`, renamed from `FsDir` (2026-10-02) — the owner's own plain word for it, once the
  `Fs` prefix wasn't needed: nothing on this site collides with a global `Directory`.
  `FsDir.js` stays as a one-line re-export so an old import keeps working.
  [doc/decisions.md](./doc/decisions.md)
- `FsFile` keeps its `Fs` prefix on purpose — `File` is the browser's own built-in for a
  picked upload; shadowing it would bite silently the first time a feature needs both in
  one file. [doc/decisions.md](./doc/decisions.md)
- `root()` returns `null` off the dev server (no `/directory.json` at all — production).
  Every reader here checks for that before walking.
- **`ext/files/fs.js`'s own file LISTING no longer reads this tree (2026-09-29).** It
  now walks each folder's own `page.jsonl` (`core/Page/Markdown.js`'s `walk()` — the
  page-files-log work), which is faster for a shallow folder and doesn't need
  `/directory.json` at all. `root()`/`Dir`/`FsFile` are unaffected and still the one
  shared tree for everything else here — `file_link()`'s ancestor walk, `FsFile.render()`
  /`Dir.render()`'s rows, the right-click menu — `/directory.json` still exists and
  this file was intentionally left alone; only that one reader moved.
- `file_link()` only picks WHICH file `/fs/` shows selected. Scrolling to and
  highlighting the `#L` line itself is built in `ext/files` (`code.file(…, {
  lines: true })`'s gutter, `mark_lines()`) — a separate piece, not this one.
- Writes need a live dev socket, nothing more. `FsFile` does not read the rail's `edit()`
  toggle (the Dictate and Mic log fallbacks write regardless of it); an editor control
  checks `edit()` itself before it offers a button.

## More

- [Overview](/framework/ext/filesystem/) — the tree live, `file_link` live
- [doc/decisions.md](./doc/decisions.md) — names weighed, the url form, what's reused, what's left
- [`ext/files`](/framework/ext/files/) — the browsing UI built on these classes
- Files: `FsFile.js` · `Dir.js` (`FsDir.js` stays as a re-export shim) · `tree.js` (the
  one shared `root()`) · `file_link.js` · `menu.js` (the right-click menu) ·
  `filesystem.css`
