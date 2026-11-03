# Check 20 asks against the repo: core/Page

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/20-core-page-2/results.json` and stop.

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

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/20-core-page-2/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 20 asks

1. `7bc9cc5ebd` (4 days old): Make the inbox a secondary page, not the default, showing recent or unseen items
2. `a35455a5f8` (4 days old): Let inbox items be read, then archived or cleared
3. `45b7bafce0` (4 days old): Make the assembler block or suggest a fix when a template is placed in the wrong spot, before render
4. `540dcc9121` (4 days old): Decide whether a page can hold child pages, items and content, or only one kind
5. `4012d61ca3` (4 days old): Decide whether a page dropped into a page becomes a child page or an item, given pages carry routing
6. `58d91620ab` (4 days old): Check where the shrunken page class work stands
7. `22742c6e9b` (4 days old): Investigate whether specific templates can be screenshotted by crop at specific resolutions.
8. `d76c3c870d` (4 days old): Store screenshots in a per-page or per-sub-page folder referenced by path, inside the page directory, even when the sub-page does not live in that file.
9. `05504ec382` (4 days old): Build screenshotting into the templating and page system at component granularity, so the templating system takes visual diffs.
10. `f8dac383fb` (4 days old): Let certain cards be sub-pages where it makes sense, not every element.
11. `e07f48a20c` (4 days old): Add a resolutions array per layout, with mobile-only layouts captured at 400px and responsive layouts captured at all levels.
12. `f975fb1a85` (4 days old): Decide whether every layout should be auto-screenshotted at every lower breakpoint to check it does not break.
13. `ffea522cb7` (4 days old): Decide how to handle very tall, narrow screenshots from full-page layouts at mobile widths.
14. `7857ead0d9` (4 days old): Skip screenshots of max-width content that stops changing layout once it reaches its maximum width.
15. `fb75e302de` (4 days old): Rank templates by how frequently they are used, and mark the good ones.
16. `db9194bd85` (4 days old): Allow a newly created template to be marked as good.
17. `0eedc38924` (4 days old): Decide how to rank templates.
18. `b59cec383b` (4 days old): Document the data-binding system and research outcome in the Page class docs
19. `88638492b7` (4 days old): Do not create a new class for each slightly different layout; keep it flexible
20. `26cf134291` (4 days old): Use the Page class as the organizer; maybe extend Page for specific patterns or modes, designed so it works and makes sense
