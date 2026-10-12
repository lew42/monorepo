# page-json-core — a page declares whether it has data; page.json is both the page's data and its directory; Make becomes an editor over core's tree

Load the `minion` skill first. Then this brief. The owner thought this through out loud in two dictations; the essence is the deliverable, the details are the mastermind's decisions below with their alternatives — write each as a `decision` line (paths, caveats) and build the chosen path.

**Three laws.** Less is more (one flag, one file per directory, no probing). Clear beats brief by far. Prioritize (the flag and the load first; the directory question second; Make third).

## The owner's words (2026-09-18, 15:20 and 15:45)

> a page.js could have a `json: true` flag: if true, the page automatically loads its own page.json. A JSON-only page makes sense for dynamically created pages — one file, not two. A scriptable page keeps its advantages. I don't like a URL pattern to indicate JSON vs page.js. The whole Make page system could and should be merged into the core page system.

> every time we load a page.js it automatically fetches the JSON data and awaits it to render the page and the navigation. Maybe that saves the whole children problem — the children list was a developer-experience shortcut. Rather than `json: true` you could pass a POJO and put all the data right in there. Each page declares whether it has data; pages without it load nothing and are as efficient as before — no 404s, no probing.

> the site-wide directory.json is several megabytes, almost bigger than the site; thousands of pages now. A directory per path is on demand. Maybe the page.json becomes the directory.json — we don't need two files if one does the trick. Snapshot versus log: I like having both — the small snapshot, and the append-only history to rewind and to validate the state against the log. Import a dynamic sub page by importing the parent; its data instantiates the children; look the child up through a property.

## What exists

- `core/Page`: `children:` as a string / array / POJO / Pages / a **function returning a promise** (`doc/data-children.md`, applied 2026-09-17); `Page.load()` probes `<url>page.js` then `.md`; `Page.from(url)`; `page.store()`; `declare()`. Read `Page.class.js` in full and `doc/decisions.md`.
- `Server/plugins/Directory.js` rebuilds `directory.json` files on every change ("Rebuilding Framework Directories" in the server log) — find every reader: `rg -n "directory.json" public Server --glob "*.js"` (the AI dashboard enumerates task dirs from it; `has_page_js()`; others). Measure the root `directory.json`'s size.
- Make: `/imagine/paging/make/` — `made/<path>/page.json` per page, `made.js`'s `Store`/`FileStore` (writes through `rpc:write`, moves through `rpc:move` since this morning), `children()` reading the tree; `/imagine/cms/json/` — JSON pages from a snapshot plus a delta log (the snapshot-versus-log shape the owner likes; read it).
- `ext/JSONL`: append-only logs replayed into object state, live over the socket.

## The mastermind's decisions to build (each a `decision` line with the alternative)

1. **`data:` on a page** — `data: true` loads `<url>page.json` (awaited before the page renders and before its children are declared); `data: { … }` is the same thing inline (a POJO, no fetch); absent means no fetch, no probe, no 404 — exactly as today. The loaded object may carry `title`, `description`, `icon`, the words, `blocks`, and `children` (the same forms `children:` takes), which merge over the page's own config (config wins for keys it sets; say why). Alternative: `json: true` as the owner first said — `data` is chosen because the inline POJO form needs the same key. Alternative two: probe page.json in `Page.load()` for every directory — rejected: a probe per page is the 404 storm the owner named.
2. **A directory with only a page.json is a page.** `Page.load()` tries `page.js`, then `page.json` (a plain `Page` with `data: <that file>`), then `.md` — one more rung, no URL pattern. So a made page is a real page under any directory, and Make's `children()` seam is no longer needed for made pages: `made/` becomes an ordinary subtree. Prove the 18 data-backed urls from the data-children work still answer identically (`ai/2026-09-17/core-data-children/18-urls.json`).
3. **page.json is the directory.** A page's `children` in its page.json IS its directory listing; core needs no `directory.json` for such a page. The site-wide `directory.json` stays for the readers that need it today (list them with what they use it for); say in the doc which readers could move to per-directory data and what it would take — do not rip it out tonight. Alternative: a per-directory `directory.json` written by the server — rejected as the second file the owner does not want.
4. **Snapshot and log, both.** A made page's edits append to `made/<path>/page.jsonl` (the history) while `page.json` stays the snapshot; a `validate` CLI (or a route on Make) replays the log and reports whether it matches the snapshot. Reuse `/imagine/cms/json/`'s delta-log shape if it fits; say so.
5. **Make over core.** Make's tree, middle pane and settings keep working over pages that are now core pages with `data:`; delete the `children()` seam and any Make-only page model that the core rung makes dead; count lines removed. `?real=` and the drag-to-move stay.
6. **Importing a dynamic child** — `parent.children.get(name)` after `await parent.source_children()` (or the seam's name after this task) is the lookup; document it in `doc/data.md` with the owner's sentence.

## Prove

- The 18 urls identical; the site crawl (`check.mjs`, `/framework/` + `/notes/`) zero new failures before and after; a page without `data:` makes zero extra requests (count network requests on three ordinary pages before and after — two numbers that must agree); a cold deep reload of the deepest made page with the cache disabled; Make's proofs from `ai/2026-09-17/editor-select/` and `ai/2026-09-18/real-page-move/` re-run on your private server (`PORT=8140 node server.js`, background, killed by its real Windows PID).

## Rules

- Load `code`, `documentation`; `new-task` before the first edit (your dir exists: `ai/2026-09-18/page-json-core/`); `finish-task` at the end. Core is live on the owner's dev server (port 80): never touch it; every core edit in ONE write, loaded headless within a minute; if broken, `git checkout -- <that one file>` at once and retry.
- **Fence:** `public/framework/core/Page/**` (check `git status` there first — a related-sidebar minion may still be landing; wait for its `landed_at` in `ai/2026-09-18/related-sidebar/task.jsonl`), `public/imagine/paging/make/**`, `public/imagine/cms/json/**` (only if you reuse its log shape), `Server/plugins/Directory.js` (read; edit only if a reader must change — say so), your task dir. Never `made/` except through Make's own seam in a restored test. Never `git stash`, never `find /`, never drive the owner's tabs; an `rg` pattern starting with `/` returns nothing here — drop the slash.
- Landing: `outcome` = a headline, the six decision lines summarised, the counts (requests before/after, lines removed, 18 urls, crawl), the links, what was left and why. One screen.
