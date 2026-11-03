# Every page has an `md/` — its markdown files, as pages

Add `md/` to any page's url and you get that folder's markdown, rendered. Nothing to write:
it is built into `Page`, so every module has it.

| url | shows |
|---|---|
| `/framework/ext/Panel/md/` | the explorer: `readme.md` in the pane, every `.md` of `ext/Panel` listed beside it |
| `/framework/ext/Panel/md/readme/` | `ext/Panel/readme.md`, rendered |
| `/framework/ext/Panel/md/doc/decisions/` | `ext/Panel/doc/decisions.md`, rendered |
| `/framework/ext/Panel/doc/decisions.md` | the raw file, unchanged |

Try it: [/framework/ext/Panel/md/](/framework/ext/Panel/md/).

## The Markdown Explorer (2026-10-19)

`/<module>/md/` is a [`Browse`](/framework/ux/Browse/) (the same list-and-detail as `/framework/ai/tasks/`): the list of every `.md` on the left, the clicked file on the right, the module's `readme.md` in the pane until you click. `PageMarkdown.Explorer extends Browse` in `Markdown.js`; the file pages are the same `Page.file()` pages as before, mounted in Browse's detail pane.

- **Width:** at 400 the list shows first, then the file (back returns to the list); at 1200 and up they sit side by side; the pane keeps a readable `measure` at 1920 and 3440.
- **URL:** `/<module>/md/` (readme), `/<module>/md/doc/<name>/` (a file). Every click is a URL, so reload and back land in the same place.
- **The `md` tab:** every module page shows it when the module has declared `doc` notes or a `readme.md` in its folder; a page with neither has no tab (the Page module's own strip, already 14 tabs, leaves it out so it does not wrap to a third row; its explorer is at `/framework/core/Page/md/`). It sits next to `doc`, which stays: `doc` is the notes a `page.js` declares, `md` is every `.md` in the folder. The rule is `md_tab()` in `ext/Doc/Doc.js`. Never `this.tab({name:"md"})`: the placeholder makes `Page.child()` skip the `md/` route.
- **Production** has no file list, so the list column says so and the readme still shows.
- Design and decisions: `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/markdown-explorer/plan.md`.

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
[task log](/framework/ai/sessions/2026/09/24/md-open/md-pages/).

## Watch out

- **No page can have a real child named `md`.** `Page.child()` checks for `md` before
  `route()`, so even a page that routes every name still has one.
- **The trailing slash matters.** `ext/Panel` documents `flow.js` in `doc/file/flow.js.md`,
  and a url ending in `.js` is answered as a file (a 404), never as the app.
- **The index reads each folder's own `page.jsonl`** (its `file` lines, through `Page.listing()`),
  one folder at a time, and looks inside a sub-folder by that folder's own log, up to 40
  folders (`PageMarkdown.budget`); the rest come from one `/directory.json` read. A folder with
  no log falls back to the dev server's `/directory.json`; with neither, the index shows the
  folder's `readme.md` instead, and a folder name nobody has checked opens as an empty
  folder rather than a 404.
- **The module is a guess.** 68 of 2,276 `.md` files (in 13 folders with no `page.js`,
  measured 2026-09-24) sit where no page is, and a link to one of them 404s.
- **A folder with its own `page.js` isn't listed** in its parent's index, because it has its
  own `md/`.

Where a clicked doc opens (navigate, next column, or in place) is the page's own choice: [open.md](/framework/core/Page/doc/open.md).

Files: `Markdown.js` (the `PageMarkdown` class and its `Explorer`), `Markdown.css`, `Page.md_url()` (where a link goes), `Page.child()`
(the one line that makes the first `md/`), `core/Router/Router.js` `link_clicked()`.

## Moved from CLAUDE.md (2026-10-12)

These sentences were cut from the root `CLAUDE.md` because they belong here. The wording is the owner's, unchanged; the id is the sentence's place in `CLAUDE.md` at `87afbdd55`. The map is `public/framework/ai/sessions/2026/10/12/session-3b391f22/claude-md-consolidate/manifest.md`.

<!-- claude-md:L40 -->
**Name things, and write `.md` links as files** — L40.2

Markdown renders at `<dir>/md/<file>/` (see `core/Page/doc/markdown.md`), and `Page.class.js` rewrites a link to `readme.md` or `doc/x.md` into that route when the page renders.
