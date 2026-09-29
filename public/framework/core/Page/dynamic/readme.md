# dynamic — pages nobody saved

**What** — a dynamic page is a url with no `page.js` and no folder for it on disk, that still opens, because an ancestor page's `route(name)` (read by `child()`) catches the name and hands back a real page. Named as its own idea, separate from the method that runs it: [`doc/property/route.md`](/framework/core/Page/doc/property/route.md) is "how route() works"; this module is "what a dynamic page IS and why you'd want one."

**Use** — open [`/framework/core/Page/dynamic/`](/framework/core/Page/dynamic/) for the whole idea in one screen: the lookup order (memory, then `route()`, then the filesystem), and the powerful part — a folder of plain data (`index.json` + one small file per item) rendered through one template function, with a live working example at [`dynamic/example/`](/framework/core/Page/dynamic/example/).

**Watch out**

- **A DECLARED child skips `route()` entirely.** `route()` runs only when `known === undefined` — a name already in `children:`, even one that resolves to `null` (declared but not yet loaded), never reaches it. If a route stops firing, check the parent's `children:` list first.
- **A plain `Page`'s own `doc/*.md` files are not clean urls.** They're reached by linking the literal `.md` path (`.../doc/idea.md`) — the Router's link handler swaps the raw file in via `Page.md_file()`/`Page.md_url()`. Clean `.../doc/<name>/` urls are only real routes on an `ext/Doc` page (one that declares `notes:`). This module is a plain `Page`, so every doc link here ends in `.md`.
- **Every branch of `child()` ends in `.load_all_children(levels)`.** A dynamic page built by hand and returned from `route()`/`child()` needs this call too, or it never gets `app` handed down and never loads its own children.

**More** — [`doc/idea.md`](/framework/core/Page/dynamic/doc/idea.md) (the lookup order, the two small demos), [`doc/uses.md`](/framework/core/Page/dynamic/doc/uses.md) (AI 2's cards, the AI day pages — file and template for each), [`doc/method/child.md`](/framework/core/Page/doc/method/child.md) and [`doc/property/route.md`](/framework/core/Page/doc/property/route.md) (the method itself), [`core/Page/jsonl/`](/framework/core/Page/jsonl/) (the simplest built-in case: a whole page from log lines, no `route()` needed).
