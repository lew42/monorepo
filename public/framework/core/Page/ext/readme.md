# Extensions — a page.jsonl line turns a small piece of behavior on, by name

See it running: **[this page](/framework/core/Page/ext/)** — its own `page.jsonl` has
one line, `{"ext": "Inbox"}`, and two `{"inbox": …}` messages. That's the whole demo.

An extension is one file, `core/Page/ext/<Name>/<Name>.js`, exporting a class with a
static `setup(page)`. Core never imports it for you — a page has to ask, by name, so a
page that asks for nothing pays for nothing.

## Turn one on

**From data**, one page.jsonl line, no code anywhere:
```json
{"ext": "Inbox"}
```

**From code**, every page gets it, from the moment the module that calls this loads:
```js
import Inbox from "/framework/core/Page/ext/Inbox/Inbox.js";
Page.use(Inbox);
```

Both end up calling the exact same `Inbox.setup(page)`.

## The two hooks a `setup(page)` gets

- `page.on("line", fn)` — called once per page.jsonl line after line 1, with that
  line's own object (`{"inbox": {…}}`, say). `page.jsonl_lines` holds every line the
  page has seen so far — read that first to catch up on anything that arrived before
  your extension finished loading (its import is async; the page's own line replay
  isn't — `Inbox.js` does exactly this).
- `page.on("render", fn)` — called once, after the page's own content is drawn.

`page.ext_ready` is an array of promises, one per `{"ext": …}` line on this page —
`await Promise.all(page.ext_ready ?? [])` before reading what an extension set up, if
you're not sure it's finished yet (`demo.js`, on this page, does this).

## Extensions so far

- **PluginsFixture** (`./PluginsFixture/`) — not a real feature: a node-safe fixture (no DOM import) that
  `core/Page/Page.plugins.test.mjs` turns on through `page.ext("PluginsFixture")`, to prove the mechanism works
  without importing a browser-only extension like Inbox into a plain `node` test.
- **Inbox** (`./Inbox/`, its own readme) — collects a page's own `{"inbox": {…}}`
  lines (any agent, or the owner, just appending a message) into `page.inbox`. Click
  through to it from this page's own file tree, below. The newer `{"note": {…}}` line
  (`page_note`, Servex) is read straight off this same page.jsonl, with no Servex
  dependency — unlike `{"inbox": …}` (`drop`), which needs Servex's `/api/inbox` to show.

## Path extensions — a different kind: a page gains a URL, not a behavior

An extension above turns on *inside* one page's own box. A **path extension** hands
a page an *extra url* it never declared — one folder (`md/`) or a whole subtree
(`/framework/ai/<date>/<slug>/`). Found by reading every `route()` and every hard-coded
check in `core/Page`, below the table this page draws live:

| Adds | On | Where it saves | Built? |
|---|---|---|---|
| `md/` — this folder's `.md` files, rendered | every page | nothing (read-only) | Yes, core |
| `fs/` — this folder's real files, full screen | every page | nothing (read-only) | Yes, core |
| Its own AI assistant, manager and chat log | any page, on first message | `<page>ai/chat.jsonl` | Yes, Servex's `Layers.js` |
| A day's task folders | `/framework/ai/<date>/` | `ai/<date>/<slug>/task.jsonl` … | Yes, `ai/page.js` |
| A card's own folder | `/framework/ai2/<y>/<m>/<d>/<card>/` | that folder's `page.jsonl` | Yes, `ai2/card.js` |
| A generic `<page>/edit/` workspace | — | — | **No** — one hand-built page only, [`/imagine/cms/edit/`](/imagine/cms/edit/) |

None of these go through `{"ext": "Name"}` — `md/` and `fs/` are checked before a
page's own `route()` ever runs, and the AI/AI2 rows read straight off disk, outside
`Page` entirely. Why none moved onto this page's own mechanism, and the full census:
[`doc/path-extensions.md`](./doc/path-extensions.md).

## Watch out

- The name in the jsonl line IS the folder and file name, spelled exactly the same:
  `{"ext": "Inbox"}` imports `core/Page/ext/Inbox/Inbox.js`.
- This is [core/Plugin](/framework/core/Plugin/readme.md)'s `Pluggable`, not a tiny copy any more (fold-2, 2026-11-09):
  `Page.use(Ext)` is `Pluggable`'s `use`, and a `{"ext": "Name"}` line (`page.ext(name)`) turns the plugin on for
  THAT page only (`Page.available(Ext)` then `toggle_plugin(rec, true)`) — every other pluggable class on the site
  (`Server/Events.js`'s subclasses included) works the same way.
- `page.jsonl_lines` keeps every line, for the life of the page — the same tradeoff
  `this.listed` and `this.placed` (Log.js) already make. Fine for an ordinary page;
  a page whose log runs to many thousands of lines pays for that memory whether or
  not it uses an extension.

Files: `Page.class.js` (`ext()`, `Page._ext`, `Page.plugged(this)` in the constructor) ·
`../../Plugin/Plugin.js` (`Pluggable`: `use`, `available`, `toggle_plugin`, the rest) ·
`Log.js` (`on`/`emit`, `jsonl_lines`) · `page.jsonl` + `demo.js` (this page,
the demo itself) · `paths.js` (the path-extensions table, above) ·
`doc/path-extensions.md` (the full census).

## Notes from your asks

- Inbox zero is the aim across core: a row that needs no action should not sit in the inbox. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p11150), 2026-10-12)
