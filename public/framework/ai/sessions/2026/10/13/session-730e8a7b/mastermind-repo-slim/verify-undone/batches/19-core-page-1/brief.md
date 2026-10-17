# Check 20 asks against the repo: core/Page

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/19-core-page-1/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `core/Page`, folder `public/framework/core/Page` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/core/readme.md`, `public/framework/core/Page/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/core/Page/readme.md`)

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

Load the `page` skill and let `create_page` make the files.

- **Match content first:** [content → layout](/framework/styles/layouts/catalog/doc/matching.md), [catalog](/framework/styles/layouts/catalog/).
- **Pick a layout** from [the audit](./audit/): most-used first. Doc pages (top tabs) and column pages cover most modules; a child starts from its parent's layout.
- **Don't drift:** no own tab strip or shell, no one-page CSS tweak on a shared layout. Propose a new layout first.
- **Check:** `node Server/layout-check.mjs --bands <url>`.

- **Five ways to make a page** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#five-ways-to-make-a-page), verbatim.
## Read next

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/19-core-page-1/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 20 asks

1. `1223c4ebe2` (7 days old): Build a set of page tools, at least one that accepts a path and deltas
2. `c9de67eea7` (7 days old): Let any AI agent edit a page through deltas
3. `b0d51c6af6` (7 days old): Build a blind logging tool that appends a JSONL entry for whatever it is given
4. `7d529472cb` (7 days old): Decide whether logging goes through a page method or appends to any path, and how to keep control over what gets logged
5. `ca467178a8` (7 days old): Build a page as a live list of sections stored in its page.jsonl
6. `4ed220d804` (7 days old): Log every delta applied to a page's live list
7. `a90087394d` (7 days old): Route paths through the pages route even when a page has no page.jsonl of its own
8. `4b1009f354` (7 days old): Treat the page system as the go-to storage and streaming container
9. `180429f339` (7 days old): Document the core Page class, explaining page.js versus page.json files
10. `420067f2a6` (7 days old): Document the files.json indexing system
11. `c9149c707a` (7 days old): Document every path-based and per-directory convention under the page system
12. `8e40aa83d4` (5 days old): Instantiate the page on the server side so a node tool can act on it quickly
13. `bc29325828` (5 days old): Decide which page functions actually need a full live instance with current data
14. `12bfb89441` (5 days old): Instantiate the page in the browser with the same data structure the page tool uses
15. `f1b077fafd` (5 days old): Make the headless server-side instance skip rendering
16. `e8bd02f993` (4 days old): Allow server-side page instances to be used by tools, possibly making the page instance the storage
17. `e42e374435` (4 days old): Document in the page class whether any server-side instantiation happens
18. `55fb788d93` (4 days old): Make the client not auto-load everything when the same page class runs on client and server
19. `209af86443` (4 days old): Let the server trigger a full load asynchronously on a query command, then query, with a timeout
20. `ec4b46e8f4` (4 days old): Should full load be restricted, e.g.
