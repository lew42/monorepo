# Page — a folder with a `page.js` or a `page.jsonl` is a page: a url, content, and children

`class Page extends Item` (`Page.class.js`, the 23 small files beside it are its parts, listed in [doc/classes.md](doc/classes.md)). A page is built either from code (`page.js`) or from a log (`page.jsonl`); the Router finds it by walking the url one folder name at a time. Its demo and Docs: [/framework/core/Page/](/framework/core/Page/).

## The recipe: make a page

```js
// <parent>/hello/page.js
import { Page, h1, p } from "/app.js";
export default new Page({ meta: import.meta, title: "Hello", content(){ h1("Hello"); p("Some text."); } });
```

Then add `"hello"` to the **parent** page's `children:`. A page nobody declares still opens by its url (`Page.child()` imports its `page.js`), but it is missing from the parent's tabs, menus and cards. Agents make pages with the `create_page` tool; load the `page` skill first.

## On disk: a page is a folder, and the folder is its storage

| File | What | Written by | Read by |
|---|---|---|---|
| `page.js` | the page as code (a tiny file: import a class, instantiate it) | a person or builder agent | the browser (`Page.load()`) |
| `page.jsonl` | the page as a log: line 1 builds it, every later line is one `set()` | the page tools (below), `append_log`, `append.mjs`, a browser tab (`Item.Store` → `Append.js`) | `Page.Reader` (`Page.class.js`, `extends Item.Store`) through `PageJsonl.load()` |
| `files.jsonl` | the folder's own file list, `{"file":"x.png"}` per file that appeared or went (a jsonl page keeps its list inside its `page.jsonl`) | `Server/plugins/PageFiles.js`, automatically | `Page.listing()` (tabs, listings) |
| `settings.jsonl` | the page's preferences about itself (e.g. tab weight) | the page tools, `append.mjs` | the parent's tab strip |
| `inbox.jsonl` | notes left on the page (`note`, `inbox`, `note_state` lines) | `page_note`, Servex `/api/inbox` | `PageInbox.js` → the page's Inbox tab ([Inbox](ext/Inbox/readme.md)) |
| `readme.md`, `doc/*.md` | the folder's index and its detail | a person or agent | the `md/` route of every page |
| `directory.json` | the old whole-site list; **off** since 2026-10-09, frozen on disk ([Server/doc/directory-off.md](/Server/doc/directory-off.md)) | nothing | a few old readers |

## How a url becomes a page

The Router ([core/Router](/framework/core/Router/)) calls `page = await page.child(name)` once per folder name. `child()` tries, in order: memory (`this.children`) → a declared `page.jsonl` → the built-in `md/` and `fs/` → the page's `route(name)` → `page.js` → a bare `.md` file → not found (the Router falls back to a real navigation). A declared child skips `route()`. Code and the two traps: [doc/loading.md](doc/loading.md).

## How a line reaches the screen (streaming)

```
writer → appends one line to page.jsonl → dev server watcher → Server/plugins/SocketServer/Tail.js (reads the new bytes)
       → socket frame → ext/JSONL/live.js → Page.Reader → page.set(line) → changed() → the page redraws
```

Opening a page is the same road from offset 0. Off localhost there is no socket: the file is fetched once and nothing streams. Append only, whole lines, validated by `.claude/hooks/jsonl-schema.mjs`; a hand write into a `.jsonl` is blocked by `jsonl-guard.mjs`. The full trip and writers: [doc/streaming.md](doc/streaming.md).

## Who changes a page

- **Agents:** `page_set(path, delta)` is the one tool; `page_add`, `page_call`, `page_log`, `page_note` are aliases for common deltas, `page_read(path)` returns the computed state (never read the raw lines). All in `Servex/agents/page_tools.js` (`page_tools()`), which validates and appends one line; the same six also run in-process as the `local` SDK server ([ai/doc/agents/mcp.md](/framework/ai/doc/agents/mcp.md)). A delta's shape: a plain key sets a property, a method key calls it (`{"content":{"add":{…}}}`), a card id walks into that card. Reference: [doc/ai-api.md](doc/ai-api.md).
- **A person or the browser:** `page.js` edits; a change made in a tab is queued by `Item.Store` and appended through `ext/filesystem/FsFile.js`.
- **Subpages** are `page.jsonl` lines, never a `page.js` edit: [doc/subpages.md](doc/subpages.md).

## Parts of a page

`content` is a list of parts (heading, text, card), one `page.jsonl` line each: [parts/](parts/readme.md). Templates (one layout, many data rows): [doc/templates.md](doc/templates.md). Binding a view to its data: [doc/binding.md](doc/binding.md). A page whose data lives in node: [doc/server.md](doc/server.md). Pick a layout from the catalog before inventing one: [layout/](layout/).

## Which class

A **List** when something is ordered and watched; an **Item** when it is a thing (an icon, a title, saved); a **Page** when it has a url.

## Overlaps

`page.js` vs `page.jsonl` are two ways to make one kind of page ([doc/jsonl-pages.md](doc/jsonl-pages.md)); `AITask`/`TaskPage` are Page subclasses for tasks ([ai/AITask](/framework/ai/AITask/), [core/Task](/framework/core/Task/)); `core/Page/ai/` is the per-page AI view, `ai/` is the AI system's records.

Also here: [audit/](audit/) (every page layout in use, most-used first) · [make/readme-page/](make/readme-page/) (a readme as the whole page).

## Folders here

[content-shapes](content-shapes/) · [dynamic](dynamic/) (a parent's `route()` answers a name) · [generator](generator/) (virtual tree from a spec) · [overview](overview/) · [settings](settings/) · [weight](weight/) · [ai](ai/) · [card](card/) · [ext](ext/) (turn a behavior on by name; [Inbox](ext/Inbox/readme.md)) · [jsonl](jsonl/) · [layout](layout/) · [navigation](navigation/) · [parts](parts/readme.md) · [Template](Template/) · [tool](tool/) · [old](old/)

## More

Reference: [doc/words.md](doc/words.md) (the six page words) · [doc/api.md](doc/api.md) · [doc/jsonl.md](doc/jsonl.md) · [doc/watch-out.md](doc/watch-out.md) (traps) · [doc/architecture.md](doc/architecture.md) · [doc/start-here.md](doc/start-here.md) (working on this module: inbox, log, tests). The readme as it stood before this rewrite, with the split-out sections and dated notes: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).
