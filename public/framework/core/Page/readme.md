# Page — a folder with a `page.js` or `page.jsonl` is a page: a url, some content, and children.

**How a page renders** (code with helper functions, `page.jsonl` deltas, or both; markdown; live updates): [`doc/how-a-page-renders.md`](doc/how-a-page-renders.md).

## Make a page (the whole recipe)

1. Create `<parent>/hello/page.js`:
```js
import { Page, h1, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Hello",
	content(){
		h1("Hello");
		p("Some text.");
	}
});
```
2. Add `"hello"` to the PARENT page's `children:` (for example `children: "hello"`). A page nobody declares still opens by its url (`Page.child()` imports its `page.js`), but it is missing from the parent's tabs, menus and cards.
3. Open `/<parent path>/hello/`.

**Working on this module?** Start at [`doc/start-here.md`](doc/start-here.md) (the inbox, the work log, the tests, what is next door) [`doc/class-block.md`](doc/class-block.md) (Item, List, Page in one code block) and [`doc/classes.md`](doc/classes.md) (the 23 files, one line each). Its inbox: `module_inbox core/Page` (Servex); no standing expert is registered as of 2026-10-16 (`list_experts` is empty).

**When to reach for which:** a #List when something is ordered and needs watching
(events are built in); an #Item when it is a thing (an icon, a title, saved); a
#Page when it has a URL.

## Storage and streaming (the tip; the rest is one click down)

A page is a folder, and the folder is its storage:

- `page.js` — a page written as code (import a class, instantiate it).
- `page.jsonl` — a page written as a log: line 1 builds it, each later line is one change. Appending a line redraws every open tab, no reload (on the dev server; the static site reads the file once).
- `files.jsonl` — the folder's own file list, kept by the dev server. (`directory.json`, the old whole-site list, is off: `Server/doc/directory-off.md`.)

A Page whose data lives in node (a query source, loaded on first use, unloaded when idle): [`doc/server.md`](doc/server.md). **A cached server-side instance per page that the tools call `set(delta)` on, and why not "the whole App" (design, not built):** [`doc/server-instance.md`](doc/server-instance.md).

- **Streaming** — a line from writer to screen, and who may write: [`doc/streaming.md`](doc/streaming.md).
- **Decisions** — classes, log growth, big collections: [`doc/architecture.md`](doc/architecture.md).
- **Storage** — where lines can be kept, today and later: [`doc/storage.md`](doc/storage.md).
- **Parts** — a page body as a list (heading, text, card), one `page.jsonl` line each: [`parts/`](parts/readme.md), [architecture](parts/doc/architecture.md).
- **Content** — pages, content, parts: one way each: [`doc/content.md`](doc/content.md); step 1 built: [`doc/content-list-step-1.md`](doc/content-list-step-1.md).
- **Templates** — one layout rendered many times from its data: [`doc/templates.md`](doc/templates.md), demo [Template](./Template/).
- **Binding** — a view that follows its data: [`doc/binding.md`](doc/binding.md).
- **Agents change a page** with `page_set(path, delta)`; `page_read(path)` shows the result: [`doc/ai-api.md`](doc/ai-api.md), live demo [tool](./tool/).
- **Subpages** are `page.jsonl` lines, never a `page.js` edit: [`doc/subpages.md`](doc/subpages.md).

- **Architecture** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#architecture), verbatim.
## How a page loads

A url is resolved one folder name at a time: memory, `page.jsonl`, `route()`, `page.js`, a bare `.md`, else not found.

- **Full order** with code and the two traps: [`doc/loading.md`](./doc/loading.md).
- **page.js vs page.jsonl** handoff, one real file line by line: [`doc/jsonl-pages.md`](./doc/jsonl-pages.md).

[core/Router](/framework/core/Router/) ([readme](../Router/readme.md)) walks the url and calls `page.child(name)` once per folder name; this module decides what each name resolves to.

- **The sub-systems** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#the-sub-systems), verbatim.
## Making a page: reuse a layout first

Load the `page` skill and let `create_page` make the files; pick a layout from the catalog and don't drift: [`doc/readme-moved-2026-10-17.md`](./doc/readme-moved-2026-10-17.md#making-a-page-reuse-a-layout-first).
- **Five ways to make a page** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#five-ways-to-make-a-page), verbatim.
## Read next

**Layout** — [layout](./layout/), the layout system: concepts top down, every kind of layout, how to decide, the research worth keeping.

**Navigation** — [navigation](./navigation/) (the pattern: persistent vs switching) · [one model](./navigation/model/) (the four questions answered, live) · [`doc/navigation.md`](./doc/navigation.md) (children, menus, where links open) · [`doc/labels.md`](./doc/labels.md) (title, label, icon) · [`doc/markdown.md`](./doc/markdown.md) and [`doc/open.md`](./doc/open.md) (`.md` files as pages, the `md/` explorer and its tab, and where a click opens)

**Also** — agents change pages, a thing holds a page, content inside a page: [`doc/readme-moved-2026-10-17.md`](./doc/readme-moved-2026-10-17.md#agents-change-pages-a-thing-has-a-page-content-inside-a-page).

**Split plan** — [`doc/split-plan.md`](./doc/split-plan.md) (why the file was 2,270 lines, half of it comments, and how it was split; `Page.class.js` is 721 lines since 2026-10-12)

**Reference** — [doc](./doc/) holds every method, property and topic on its own tab:

- [`words.md`](./doc/words.md) the six page words · [`api.md`](./doc/api.md) every method and property · [`jsonl.md`](./doc/jsonl.md) the log format
- [`data-children.md`](./doc/data-children.md) children from data · [`property/related.md`](./doc/property/related.md) related pages
- [`watch-out.md`](./doc/watch-out.md) the traps · [`architecture.md`](./doc/architecture.md) decisions · [`decisions.md`](./doc/decisions.md) older history
- [`indexing-2026-10-08.md`](./doc/indexing-2026-10-08.md) open: directory deltas, session index
- Files: `Page.class.js` (the class), `Page.css` (core `.page-*` rules), `page.js` (this module's Doc page)

**Query** ([`doc/query.md`](./doc/query.md)) · **Asks** ([`doc/asks.md`](./doc/asks.md)) · **Vision** ([`doc/vision.md`](./doc/vision.md)) · Notes: [Frame](doc/Frame-notes.md) · [Page](doc/Page-notes.md) · [page.js](doc/page-js-notes.md). The original lines: [`doc/readme-moved-2026-10-17.md`](./doc/readme-moved-2026-10-17.md#query-asks-vision-notes).

## Also here (readme audit, 2026-10-13)
- [content-shapes](./content-shapes/) — every shape a page's content can take
- [dynamic](./dynamic/) — pages nobody saved: a parent's `route()` answers the name
- [generator](./generator/) — a virtual page tree from a spec string, real urls
- [overview](./overview/) — palette: one card per building block
- [settings](./settings/) — tabs that manage themselves, the page's own nav switch
- [weight](./weight/) — one number per page saying how much it matters
- [ai](./ai/) — the page-based AI system: open tasks and agent work shown on each page
- [card](./card/) — the site's card design system
- [ext](./ext/) — page extensions: a `page.jsonl` line turns a small behavior on by name
- [jsonl](./jsonl/) — the `page.jsonl` system: live demos of a page written as a log
- [old](./old/) — the first Page docs, kept as reference
