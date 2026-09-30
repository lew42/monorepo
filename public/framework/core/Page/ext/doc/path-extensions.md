# Path extensions — every module that hands a page an extra url or workspace

An **extension** (the readme one level up) turns on *inside* one page's own box — a
`page.jsonl` line, a render hook. It never changes what urls exist. A **path
extension** is the opposite kind of thing: it answers an url the page itself never
declared — sometimes one folder (`md/`), sometimes a whole new subtree of them
(`/framework/ai/<date>/<slug>/`). This page is the full list, found by reading
`Page.class.js`'s `child()` end to end and grepping every `route()` in `core/Page`.

Short version, with links: the readme's own "Path extensions" section. This is the detail
behind it — what each one costs, whether it moved, and why.

## Built into every page — checked before anything dynamic

| Adds | Saves | File |
|---|---|---|
| `md/` — this folder's own `.md` files, rendered, one page per file | nothing (read-only) | [`Markdown.js`](/framework/core/Page/md/doc/file/Markdown.js.md), added by `Page.class.js`'s `child()` |
| `fs/` — this folder's real files, full screen, browsable | nothing (read-only) | `Page.class.js`'s `fs_folder()`, drawn by [`ext/files`](/framework/ext/files/) (`explorer.js` v2, `fs.js` v1 behind `?v=1`) |

Both are checked **before** a page's own `route()` ever runs (`core/Page/doc/loading.md`,
step 3) — that ordering is the whole point: a page that routes every single name still
gets `md/` and `fs/`, because the check happens first, synchronously, with no per-page
opt-in line.

**Why neither moved onto `core/Page/ext/`.** This ext system's whole contract is
*opt-in, one page at a time* — nothing happens until a page says `{"ext": "Name"}` or a
module calls `Page.use(Ext)`, and setup runs through a dynamic `import()` after the page
has already started building. `md/` and `fs/` need the opposite guarantee: ALWAYS on,
checked synchronously, before a page's own `route()` gets a chance to claim the same
name. The ext system has two hooks today, `line` and `render` (the readme, above) —
neither is "claim a child name before routing," so giving `md/` or `fs/` to this system
would mean adding a *third* hook type and wiring it into `child()`'s own lookup order,
right where the code today warns "checked before anything dynamic, so they always
exist." That is real surgery, not a re-export — more than the "cheap" bar
(`{"ext": ...}` or `Page.use()`, under ~30 changed lines, every existing url still
works) this task was told to stay under. Left as they are.

## Built, but per PAGE rather than per FOLDER

These three don't add a fixed child name the way `md/`/`fs/` do — each one reads a
*path segment* (a date, a card id) and builds a workspace for it, straight off disk,
with no `page.js` anywhere in that subtree.

| Gains | Reached at | Saves | Built by |
|---|---|---|---|
| Its own AI assistant + manager, and a chat log | any page, the moment the owner or an agent sends it a message (the drawer's AI tab, `POST /api/page-ai`) | `<page>ai/chat.jsonl` | Servex's `Layers.js` — [`Servex/agents/doc/page-pairs.md`](/framework/servex/) is the whole system; nothing in `core/Page` implements this, it is read and written straight off the page's own url |
| A day's task folders, read as a dashboard | `/framework/ai/<date>/` (e.g. `/framework/ai/2026-09-28/`) | `ai/<date>/<slug>/task.jsonl`, `requirements.md`, `session.json` … (written by the `new-task`/`finish-task` skills, not by this route) | `public/framework/ai/page.js`'s own `route(name)` |
| A card's own folder, read as a page | `/framework/ai2/<year>/<month>/<day>/<card>/` | that folder's `page.jsonl` | `ai2/card.js`'s `Card.Folder.child()` |

**Why none of these moved either.** The AI pair (`Layers.js`) isn't a `Page` routing
mechanism at all — it never touches `child()`, `route()` or `page.jsonl`; a page's chat
file is fetched straight off its own url by the drawer, entirely inside Servex. There is
nothing shaped like a `Page` extension to move. The AI day-folders (`ai/page.js`) and the
AI 2 card-folders (`ai2/card.js`) *are* `route()`-based, the same mechanism
[`core/Page/dynamic/`](/framework/core/Page/dynamic/) names — but both files sit outside
this task's fence (`public/framework/ai/` and `public/framework/ai2/` belong to the AI
board and AI 2 tasks running at the same time), so moving them was not this task's call
to make even if it had been cheap.

**A finding along the way:** `core/Page/ai/readme.md` used to say the drawer's
`POST /api/page-ai` route "does not exist yet." It exists now — `Layers.js` answers it,
and the reply lands in `<page>ai/chat.jsonl` a few seconds later (`page-pairs.md`). Fixed
in that readme, since leaving it would send the next reader looking for a route that is
already live.

## Not built

The owner's own third idea — "any page slash edit creates a whole module and
workspace," an editor for any page the way `md/` and `fs/` are a viewer for any page —
has no generic version. The one thing on the site named `edit`,
[`/imagine/cms/edit/`](/imagine/cms/edit/), is a single hand-built page that edits one
hard-coded file (`welcome.md`); visiting `<anything else>/edit/` 404s. `ext/editor/` is a
real drag-and-drop block workspace, but it too is a page you visit at its own url, not
something every page gains. Building the real thing — a page-specific save location, the
same way `md/`/`fs/` are page-specific read locations — is future work, not started here.

## Two doc pages that explain the pattern but don't implement it

[`core/Page/dynamic/`](/framework/core/Page/dynamic/) names the *idea* behind `route()`
(a url nobody saved, that still opens) and [`core/Page/make/`](/framework/core/Page/make/)
teaches the five ways to build a page at all. Neither one itself hands any OTHER page an
extra url — they are the readable version of the mechanism the table above actually uses.
`core/Page/ai/` is the same kind of thing for the AI pair: a guide to where the pieces
live, not an implementation. All three got a one-line pointer back to this page in their
own readme, so a reader who lands there first still finds the census.

## More

The full working notes — every url checked, before/after screenshots, what was
considered and ruled out — are the task log:
[`ai/2026-09-30/inbox-ext/path-ext/modules.md`](/framework/ai/2026-09-30/inbox-ext/path-ext/modules.md).
