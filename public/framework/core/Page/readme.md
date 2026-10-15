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

**Working on this module?** Start at [`doc/start-here.md`](doc/start-here.md) (the inbox, the work log, the tests, what is next door) and [`doc/classes.md`](doc/classes.md) (the 23 files, one line each). This module has an expert: ask it with `ask_expert core/Page …` (Servex).

**When to reach for which:** a #List when something is ordered and needs watching
(events are built in); an #Item when it is a thing (an icon, a title, saved); a
#Page when it has a URL.

## Storage and streaming (the tip; the rest is one click down)

A page is a folder, and the folder is its storage:

- `page.js` — a page written as code (import a class, instantiate it).
- `page.jsonl` — a page written as a log: line 1 builds it, each later line is one change. Appending a line redraws every open tab, no reload (on the dev server; the static site reads the file once).
- `files.jsonl` — the folder's own file list, kept by the dev server. (`directory.json`, the old whole-site list, is off: `Server/doc/directory-off.md`.)

A Page whose data lives in node (a query source, loaded on first use, unloaded when idle): [`doc/server.md`](doc/server.md).

How a line travels from a writer to the screen, and who may write: [`doc/streaming.md`](doc/streaming.md).
The classes and the decisions (log growth, big collections, file vs database): [`doc/architecture.md`](doc/architecture.md).
**Where the lines can be kept** (files today; a Durable Object, D1 or an archive later; the `Store` backends, costs and the first slice): [`doc/storage.md`](doc/storage.md).
**A page body as a list of parts** (heading, text, card; each one a line in `page.jsonl`): [`parts/`](parts/readme.md), [architecture](parts/doc/architecture.md). **Pages, content, parts: one way each, and the plan for `children` and `content`:** [`doc/content.md`](doc/content.md); step 1 built: [`doc/content-list-step-1.md`](doc/content-list-step-1.md).
**Templates** (one layout rendered many times from its own data, bound to live `Property` values): [`doc/templates.md`](doc/templates.md), demo [Template](./Template/). **Binding** (a view that follows its data: subscribe and unbind, linked clone vs hard copy, when a value is a Property; measured on 1,000 rows): [`doc/binding.md`](doc/binding.md).
**Agents change any page with one tool**, `page_set(path, delta)`: a property, a card, a subpage; `page_read(path)` shows the result. The model and the "to do X, send delta Y" table: [`doc/ai-api.md`](doc/ai-api.md). Live demo: [tool](./tool/).

- **Architecture** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#architecture), verbatim.
## How a page loads

A url is resolved one folder name at a time: memory → a declared `page.jsonl` → `md/`/`fs/`/`inbox/` →
`route()` → a `page.jsonl` in the loaded folder listing → `page.js` → a bare `.md` file → not found. The full order, with a code line for
each step and the two traps that catch people, is [`doc/loading.md`](./doc/loading.md).
[core/Router](/framework/core/Router/) ([readme](../Router/readme.md)) walks the url and calls `page.child(name)` once per folder name; this module decides what each name resolves to.

- **The sub-systems** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#the-sub-systems), verbatim.
## Making a page: reuse a layout first

Load the `page` skill (what, where, layout, content) and let `create_page` make the files.
**Match your content first:** [content → layout](/framework/styles/layouts/catalog/doc/matching.md) (ranked [catalog](/framework/styles/layouts/catalog/), with use counts). Then pick the layout from **[the audit](./audit/)**: the layouts the site already uses, most-used
first, each with its one opt-in call. Doc pages (top tabs) and column pages are the two that
cover most modules. A child starts from its parent's layout. Pages drift two ways: building
their own tab strip, sidebar or shell, or a one-page CSS tweak on top of a shared layout (a
local `order` rule is what pushed the AI 2 tabs flush right). Propose a new layout before you
build one, and check the page with `node Server/layout-check.mjs --bands <url>`.

- **Five ways to make a page** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#five-ways-to-make-a-page), verbatim.
## Read next

**Layout** — [layout](./layout/), the layout system: concepts top down, every kind of layout, how to decide, the research worth keeping.

**Navigation** — [navigation](./navigation/) (the pattern: persistent vs switching) · [one model](./navigation/model/) (the four questions answered, live) · [`doc/navigation.md`](./doc/navigation.md) (children, menus, where links open) · [`doc/labels.md`](./doc/labels.md) (title, label, icon) · [`doc/markdown.md`](./doc/markdown.md) and [`doc/open.md`](./doc/open.md) (`.md` files as pages, and where a click opens)

**Agents change pages** — [`doc/architecture.md`](./doc/architecture.md) (path + delta through `page_set`, `Servex/agents/page_tools.js`; tabs, layout words and session pages work live) · the ask: [`doc/page-tool-2026-10-09.md`](./doc/page-tool-2026-10-09.md)

**A thing has a page** — [`doc/composition.md`](./doc/composition.md) (the rule: a thing holds a page by reference; today `AITask` and `AISessionDetail` still extend `Page`; page CRUD/move is a known gap)

**Content inside a page** — icon items, sections, outlines: [ux/Content/structure](/framework/ux/Content/structure/)

**Split plan** — [`doc/split-plan.md`](./doc/split-plan.md) (why the file was 2,270 lines, half of it comments, and how it was split; `Page.class.js` is 721 lines since 2026-10-12)

**Reference** — [doc](./doc/) (every method, property and topic in full, on its own tab) — [`doc/words.md`](./doc/words.md) (the six page words) · [`doc/api.md`](./doc/api.md) (every method and property) · [`doc/jsonl.md`](./doc/jsonl.md) (the log format in full) · [`doc/data-children.md`](./doc/data-children.md) (children from data) · [`doc/property/related.md`](./doc/property/related.md) (related pages) · [`doc/indexing-2026-10-08.md`](./doc/indexing-2026-10-08.md) (open: directory deltas, session index, querying) · [`doc/watch-out.md`](./doc/watch-out.md) (the traps, one line each) · [`doc/architecture.md`](./doc/architecture.md) (the classes and decisions), [`doc/decisions.md`](./doc/decisions.md) (older history) · Files: `Page.class.js` (the class), `Page.css` (the core `.page-*` rules; other modules keep their own beside them), `page.js` (this module's Doc page; its Overview tab is the palette), `tools/links.mjs` (a link-checking script, not a page)

**Asks** — [`doc/asks.md`](./doc/asks.md) (the owner's repeated asks about the page system, merged, open first)

**Vision** — [`doc/vision.md`](./doc/vision.md) (the page as the core data item, debug views of any instance; back-burner ideas kept)

- Notes (history and lessons moved out of the code comments): [doc/Frame-notes.md](doc/Frame-notes.md) · [doc/Page-notes.md](doc/Page-notes.md) · [doc/page-js-notes.md](doc/page-js-notes.md)

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
