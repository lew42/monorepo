# Link tracking — requirements

## The owner's words (2026-09-18, 14:40)

> the path would break if we drag and drop a page from one place to another. Maybe we need
> an import tracking system so that for any page we track where that page is imported, so
> that when you drag and drop it, the AI or some node function can automatically update all
> the import paths so things don't break. If the page.json system is functional, put that
> kind of meta tracking data in the page.json.

## What exists

`rpc:move` landed this morning (`Server/plugins/SocketServer/Runtime.js`; the orchestration
is `public/imagine/paging/make/real.js` — read `ai/2026-09-18/real-page-move/task.jsonl`'s
landing and `public/imagine/paging/make/doc/decisions.md`): a drag of a real page in Make
(`?real=`) renames the directory and rewrites both parents' plain-string `children:` lines,
with a one-minute undo. Nothing rewrites the LINKS and IMPORTS that point at the moved page.
Yesterday's Move 3 rewrote ~400 links by hand with `rg` counts. Made pages live in
`made/<path>/page.json`; real pages have no `page.json`.

## Deliverables

1. **A links census** — `public/framework/core/Page/tools/links.mjs` (or beside the other
   CLIs, e.g. next to `importance.mjs` — say where and why): walks `public/` (skipping
   `framework/ai/**`, `node_modules`, the personal dirs `alex arya castin michael edric`,
   `core/new`, `core/legacy`) and records, per page url, every file that links
   (`href="/x/"`, markdown `](/x/)`, `url: "/x/"`) or imports (`import … from "/x/…"`) it,
   writing `public/links.json` (`{ "/x/": { "links": [file:line], "imports": [file:line] } }`),
   idempotent, with a count line at the end; for a made page that has a `page.json`, also
   write the same under a `linked_from` key in that `page.json` (the owner asked for it
   there) — only for made pages, never inventing a page.json for a real page.
2. **The move rewrites them:** `rpc:move` (or Make's move flow around it) reads the census
   for the moved url and rewrites every link and import from the old url to the new one —
   exact string, with a leading-boundary check so `/a/b/` never matches `/a/bc/` — and
   returns the count; Make's confirm sentence grows one clause: "… and N links in M files
   are rewritten". Undo reverses them too. If the census is stale (file older than the
   newest `page.js`), the move re-runs it first (say how long it takes on this repo: measure).
3. **Proof** on your private server (`PORT=8128 node server.js`, background, killed by its
   real Windows PID): a scratch tree `public/imagine/paging/made-real2/` with three real
   pages where one links to another and a fourth file imports it; drag it in Make; the
   census count, the rewrite count and `rg` after the move all agree (three numbers); undo
   restores all; delete the scratch tree at landing.
4. **Docs:** `core/Page/readme.md` one Watch-out line (moving a page rewrites its links from
   `links.json`), the tool's own header comment, Make's readme line, the Server readme's rpc
   table row.

## Fence

The tool file, `public/links.json` (generated), `Server/plugins/SocketServer/Runtime.js` (or
`Move.js`), `public/imagine/paging/make/**`, the scratch tree (deleted at landing),
`public/framework/core/Page/readme.md` (one line only — another minion is in core/Page's CSS
and class; touch nothing else there), your task dir. The owner's dev server on port 80 is
running: never touch it (the Server change needs their restart — say so in the landing as
the owner item, 1 min). Never `git stash`, never `find /`, never drive the owner's tabs; an
`rg` pattern starting with `/` returns nothing here — drop the slash.

Final message: one screen — the census counts (pages, links, imports, seconds), the three
agreeing numbers from the proof, the links, what was left and why.
