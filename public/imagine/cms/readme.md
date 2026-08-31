# CMS — how it is built

A working content pipeline made of seams that already existed, plus the think-through that
argues against adding a backend yet. Four pages, one stylesheet-free prototype, no dependency.

## Use

- **[`thinking.md`](/imagine/cms/thinking/)** — the options matrix (git files · `node:sqlite` ·
  D1 · Durable Objects · KV · R2) and the adapter seam. Read this one; the rest is the demo.
- **[`welcome.md`](/imagine/cms/welcome/)** — the content. A plain markdown file with no
  `page.js`; core's [`Page.file()`](/framework/core/Page/doc/declaring/) renders it as a page.
- **[`edit/`](/imagine/cms/edit/)** — the editor. Source beside a live preview, one Save button.
- **[`services/`](/imagine/cms/services/)** — a **mock** management UI for Cloudflare. Every
  control prints its `npx wrangler` line instead of running it.

## The two seams it is built from

Neither was written for this. That is the point.

1. **`rpc:write`** (`Server/plugins/SocketServer/Runtime.js`) writes any file under `public/`
   over the dev socket. `ext/Saver`'s `FileSaver` has used it for JSON since the persistence
   stack landed; markdown is the same call with the `JSON.stringify` left out.
2. **`Page.file()`** (`core/Page/Page.class.js:134`) makes a `.md` file beside a page *be* a
   page. So the content file and the published page are the same object.

Publishing is `git commit`. There is no build, no migration and no admin account.

## Verified

Headless, 2026-08-30: typed in `/imagine/cms/edit/`, clicked Save, `welcome.md` went 940 → 1021
bytes on disk, a **cold** load of `/imagine/cms/welcome/` rendered the edit, and the original was
restored through the same seam. `node:sqlite` also confirmed built in on this box (Node v24.15.0,
`DatabaseSync`, zero npm deps) — the numbers are in [`thinking`](/imagine/cms/thinking/).

2026-08-31: [`json/edit`](/imagine/cms/json/edit/) now writes over **`rpc:append`** — one line per
edit, `page.json` byte-identical, and **Compact** folded `page.jsonl` 4 lines / 651 B → 0 / 0 into
a snapshot that kept the edit and all three child pages. The same contract, streamed live between
two windows, is [`/imagine/stream/`](/imagine/stream/).

## Watch out

- **`public/data/` is in `.gitignore`.** Every saver in the repo writes there, which is right for
  *user state* and wrong for *content*: a CMS document saved to `public/data/` can never be
  committed, so it can never be deployed. Content goes beside the page that draws it.
- **`rpc:write` does not mute the socket that wrote.** `LiveReload.mute()` is opt-in and only
  `Start.js` and `Ask.js` call it, so a browser saving a watched file reloads its own tab —
  mid-edit. `edit/page.js` works around it with core's own `$BLOCKRELOAD` flag
  (`dev/Socket/Socket.js:147`), lifted after the 300 ms flush. **The real fix is one line** in
  `Runtime.js`'s `write()`, and it belongs to whoever owns `Server/`:
  `this.server.socket_server?.live_reload?.mute(full_path, this.socket);`
- **JSON is the wrong container for prose.** `"body": "# Hi\n\nA paragraph…"` puts a whole
  article on one line, so a two-word fix reads as a whole-file diff. Markdown keeps the diff
  honest, which is the entire reason to keep content in git.
- **A `.md` page has no `description`**, so its card on the parent is a title and nothing else.
  Correct, not a bug — `Page.file()` returns `{ title, content }` and inventing more would mean
  parsing front-matter nobody has asked for yet.
- **The factories only chain `.c()`.** `textarea.attr(…)` throws; it is `textarea().attr(…)`.
  Cost two pages a "Page Load Error" before the console said why.

## More

[`thinking.md`](/imagine/cms/thinking/) — the whole argument · [`ext/Saver`](/framework/ext/Saver/)
— the interface this proposes extending · [`page.store()`](/framework/core/Page/) — in core
since 2026-08-31; [edit](/imagine/cms/edit/) uses it for drafts.

[`doc/undo-proposal.md`](/imagine/cms/doc/undo-proposal.md) — **awaiting a verdict**: undo for the delta stream, three shapes measured; replay wins with no contract change.
