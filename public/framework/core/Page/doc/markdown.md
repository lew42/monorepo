# Every page has an `md/` — its markdown files, as pages

Add `md/` to any page's url and you get that folder's markdown, rendered. Nothing to write:
it is built into `Page`, so every module has it.

| url | shows |
|---|---|
| `/framework/ext/Panel/md/` | a list of every `.md` in `ext/Panel` |
| `/framework/ext/Panel/md/readme/` | `ext/Panel/readme.md`, rendered |
| `/framework/ext/Panel/md/doc/decisions/` | `ext/Panel/doc/decisions.md`, rendered |
| `/framework/ext/Panel/doc/decisions.md` | the raw file, unchanged |

Try it: [/framework/ext/Panel/md/](/framework/ext/Panel/md/).

## Links find it on their own

A link to a `.md` file opens the rendered page, wherever the link came from:

- **Inside markdown**, `md.route()` (ext/markdown) rewrites the href, so hovering shows the
  page's url.
- **Anywhere else** (a link a `page.js` built by hand), the Router catches the click.
- **`x.md?raw`** still opens the raw file. A query means the writer wanted the file.

The link goes to the file's **module**: the folder above `doc/`, or else the file's own
folder. `/framework/core/Page/doc/roles.md` → `/framework/core/Page/md/doc/roles/`.

## Why `md/` and not `.md`

A url ending in `.md` is a real file, so the server returns it raw. `md` is a folder name
that doesn't exist, so the server hands the url to the app (the SPA fallback: `Server.js`
on dev, `not_found_handling` in `wrangler.jsonc` in production). Pages made by `route()`
depend on the same fallback.

The other shape we weighed was `/ext/Panel/md-decisions`: one segment, and nothing
reserved, but it gives no index and no subfolders. The choice and its reasons are in the
[task log](/framework/ai/2026-09-24/md-pages/).

## Watch out

- **No page can have a real child named `md`.** `Page.child()` checks for `md` before
  `route()`, so even a page that routes every name still has one.
- **The trailing slash matters.** `ext/Panel` documents `flow.js` in `doc/file/flow.js.md`,
  and a url ending in `.js` is answered as a file (a 404), never as the app.
- **The index reads each folder's own `page.jsonl`** (its `file` lines, through `Page.listing()`),
  one folder at a time, and looks inside a sub-folder by that folder's own log. A folder with
  no log falls back to the dev server's `/directory.json`; with neither, the index shows the
  folder's `readme.md` instead, and a folder name nobody has checked opens as an empty
  folder rather than a 404.
- **The module is a guess.** 68 of 2,276 `.md` files (in 13 folders with no `page.js`,
  measured 2026-09-24) sit where no page is, and a link to one of them 404s.
- **A folder with its own `page.js` isn't listed** in its parent's index, because it has its
  own `md/`.

Where a clicked doc opens (navigate, next column, or in place) is the page's own choice: [open.md](/framework/core/Page/doc/open.md).

Files: `Markdown.js` (the `PageMarkdown` class), `Page.md_url()` (where a link goes), `Page.child()`
(the one line that makes the first `md/`), `core/Router/Router.js` `link_clicked()`.
