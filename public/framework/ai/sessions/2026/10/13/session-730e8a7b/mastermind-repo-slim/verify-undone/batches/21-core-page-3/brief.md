# Check 20 asks against the repo: core/Page

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/21-core-page-3/results.json` and stop.

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

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/21-core-page-3/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 20 asks

1. `3ba1ca44b2` (4 days old): A page can change its layout, background, and color scheme, and can be a card inside another page
2. `6cab9e0155` (4 days old): Page settings must persist properly
3. `ef710ac885` (4 days old): Make page data structure the go-to wrapper for cards and templates
4. `ef173e76e2` (4 days old): Pages define a render method that wraps a view class, rendered on import
5. `b34cec1466` (4 days old): Use a views array and iterate it on updates if a page must render multiple times
6. `29082f25d1` (4 days old): Question whether pages really need multiple renders
7. `1d37ab4325` (4 days old): Add a page.clone that records duplicates, instead of extending instances
8. `43fd411a13` (4 days old): Work out how linked clones stay in sync when linkage toggles and events fire
9. `d019b14726` (4 days old): Wrap each page preview in its own Template wrapper, reusing a small set of robust layouts
10. `ab7447a9f8` (4 days old): Confirm naming the class Template extends Page rather than Layout
11. `75774baa20` (4 days old): Decide whether templates are cloned and how mock data gets rewired to real data
12. `0b877a9231` (4 days old): Use default pad X and pad Y tokens for standard container padding, with card mode set to mobile so it scales down
13. `207395ec61` (3 days old): Give each page a background color distinct from the global canvas so its start and stop is visible.
14. `6471b08f1c` (3 days old): Solve the page-boundary problem through different page layouts.
15. `523660ecc0` (3 days old): Lay out each page inside a 1920px-wide wrapper that is vertically scrollable, with multiple 1920 containers stacked vertically or horizontally when appropriate
16. `7246c112ac` (3 days old): Prioritise above-the-fold content at the top of each page, as in web design
17. `d85c13c218` (3 days old): Add a per-page inbox in page.jsonl, and in class.jsonl for classes, where agents drop recommendations and preferences
18. `ebbf6ef00e` (3 days old): Work out how pages are instantiated and how agents read live updates without it getting tricky
19. `6674a593f3` (3 days old): Keep the existing JSONL logic and lean on it while it is the primary mechanism
20. `1bc9c42b42` (3 days old): Let page types store data as JSON snapshot, JSONL log, local or remote SQLite, or Durable Object
