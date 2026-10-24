# The page API for AIs: two tools, one model

An agent changes a page with **one tool, `page_set`**, and looks at it with **one tool, `page_read`**. Everything else is a delta: a small JSON object the agent picks itself.

## The model: a page is a log of deltas

```
page.jsonl          one JSON line per change, appended, never rewritten
  → page.set(line)  each line is applied to the page, in order (the browser tails the file live)
  → the page        properties (title, icon, the six layout words), `content` (a list of cards), `pages` (its subpages)
```

A delta is applied key by key:

- **A plain key is a property**: `{"title":"Notes"}` sets the title.
- **Code and parts share one list**: a page's `content(){…}` is one item in `page.content` and `{"content":{"add":…}}` lines add more beside it; both show ([live](/framework/core/Page/content-shapes/both/)).
- **A key naming a method calls it**: `{"content":{"add":{…}}}` calls `add` on the content list.
- **A key that is an id walks into that item**: `{"c1":{"text":"new"}}` changes the card `c1`.

The tool stamps `id`, `by` and `ts` for you, and answers `{ok, ids, line, size}`: `ids` lists every id it made. Every open tab redraws within about a second, with no reload.

## To do X, call `page_set` with delta Z

`path` is the page's url as the browser shows it. Omit it to mean your own session page.

| To… | delta |
|---|---|
| set a page property | `{"title":"Notes","description":"One line."}` · layout words: `navigation` `width` `arrangement` `surface` `background` `type_size` |
| add a heading | `{"content":{"add":{"type":"part-heading","text":"Findings"}}}` |
| add a card | `{"content":{"add":{"type":"part-card","title":"Cache","text":"Hit rate 92%."}}}` |
| add a paragraph | `{"content":{"add":{"type":"part-text","text":"Some **markdown**."}}}` |
| add after a card | `{"content":{"add":{…,"after":"c1"}}}` (`"after":null` puts it first) |
| update a card | `{"c1":{"text":"Hit rate 95%."}}` (the id `page_set` returned) |
| move a card | `{"content":{"move":{"id":"c1","after":"h1"}}}` |
| remove a card | `{"content":{"remove":"c1"}}` |
| reorder all cards | `{"content":{"order":["h1","c2","c1"]}}` |
| clear every card | `{"content":{"clear":true}}` (history stays in the log; the page's own `content(){}` code is kept) |
| call any method | `{"<id or property>":{"<method>":<argument>}}`, e.g. add an answer to question card k2: `{"k2":{"answers":{"add":{…}}}}` |
| **create a subpage** | `{"pages":{"add":{"name":"notes","title":"Notes","icon":"📝","description":"One line."}}}` |
| add a link card to a subpage | `{"content":{"add":{"type":"part-link","path":"./notes/","title":"Notes"}}}` ([part-link.md](part-link.md)) |
| **promote a card to its own subpage** | `{"pages":{"promote":{"id":"c1","name":"notes"}}}` (the card moves into `notes/`, a link card stays) |
| rename a subpage | `{"pages":{"rename":{"name":"notes","to":"ideas"}}}` |
| remove a subpage | `{"pages":{"remove":"notes"}}` (moved aside, never deleted) |
| write on a subpage | the same deltas, with `path` set to the subpage's url (`…/notes/`) |
| read the current state | **`page_read(path)`**: title, every card with its id, the subpages |

## Asking without writing: queries

`page_set` changes, but a class can also list **queries**: methods and getters that only read (`static queries` on the class, `Item.describe().queries`). With the item tool, a delta whose keys are all queries is answered and **writes no line**: `item({path, delta:{"summary":{}}})` answers `{ok, answer:{summary:{…}}}`. `item({path, delta:{"progress":{},"cost":{}}})` asks two at once; `target:["a"]` asks the child `a`. A delta that mixes a query with a change is refused (send two calls). There is no separate `get` key. Detail and the list for Task and Session folders: [Servex/doc/item-tool.md](/Servex/doc/item-tool.md).

A bad line is refused before it is written: a `_` key, a `part-*` type nobody registered (`core/Page/parts/kinds.js` is the one list), or a line that would not replay. The answer says why and `Nothing was written.` Detail: [Servex/doc/item-tool.md](/Servex/doc/item-tool.md), "A real Page".

## Names, once

- **page**: anything with a url. **subpage**: a page inside another, with its own folder and url.
- **content**: the page's own list of cards. **card**: one item in it (`part-heading`, `part-text`, `part-card`; any registered type).
- **delta**: the JSON object you send. **line**: that delta, stamped and appended to `page.jsonl`.

## Old tool names still work

`page_add(item)` = `page_set({"content":{"add":item}})`. `page_call(target, method, args)` = `page_set` with `{[method]: args}` nested under `target`. `page_log(text)` = `page_set({"log":{"text":…}})` (the "now doing" line). `create_page(parent, name, …)` = `page_set(parent, {"pages":{"add":{name, …}}})`. `target` on `page_set` is optional sugar: `page_set(path, ["c1"], {"text":"…"})` = `page_set(path, {"c1":{"text":"…"}})`.

## How a subpage is stored

`pages.add` makes `<page folder>/<name>/page.jsonl` (line 1: title, icon, description) and links it from the parent: one `{"file":"<name>/page.jsonl"}` line in the parent's `page.jsonl` (made if the parent only has a `page.js`; no `page.js` is ever edited). More: [subpages.md](subpages.md). `rename` moves the folder and writes a `gone` line for the old name and a `file` line for the new one. `remove` moves the folder to `<page folder>/_removed/<name>-<time>/` and writes a `gone` line. The code is `Servex/agents/Subpages.js`.

## Decisions, and the alternatives

- **One write tool, not one per card kind or per verb.** The owner (2026-10-12): "a few universal tools that take deltas". Alternative: keep `page_add`/`page_call`/`create_page` as first-class tools. Kept only as aliases, so no caller breaks.
- **`pages` is handled by the tool, not written as a line.** The tool turns `pages.add` into a folder plus the existing `file` line the browser already understands. Alternative: teach `Page.set()` a `pages` verb so the line itself says `{"pages":{"add":…}}`. Rejected for now: a browser cannot make folders, and `Page.class.js` is frozen while its [split plan](split-plan.md) runs.
- **A tab is a lighter subpage.** `{"tab":{"name":"notes","title":"Notes"}}` makes a subpage kept inside this page's own file (no folder). Use it for a view of this page; use `pages.add` for a page that should stand on its own.

## The live proof

Built 2026-10-12 (`Servex/agents/Subpages.js`, `page_tools.js`, `ai/AISession/AISessionDetail.js`). A headless Chromium on a private worktree server, writing through the real `page_tools`, saw on a session page (`/framework/ai/sessions/<id>/`): a `part-heading` after 39 ms, a `part-text` after 12 ms, a `part-card` and its in-place update after 14 ms, with no reload; a subpage made by `pages.add` opened at `…/<id>/notes/` and survived a reload (about 0.4 s). Probe and screenshots: `ai/sessions/2026/10/12/session-cb7ffa45/page-ai-api/build/` (`probe.mjs`, `session.png`, `notes.png`).

How the session page draws it: `AISessionDetail.Parts` keeps the `part-*` items of the session's `page.jsonl` and draws them with the same Items and Views a `Page` content list uses, with a "Subpages:" row of links under them; a `{"file":"notes/page.jsonl"}` line adds the link and makes `AISessionDetail.child("notes")` load that folder at the session route.

### A fresh Haiku, from the tool descriptions alone (2026-10-12)

A new `claude-haiku-5-5` agent (effort low, only `page_set` and `page_read` allowed, never shown this doc) was asked for a heading, three cards and a subpage with its own heading on its session page. It made 6 calls in 13 s, **0 wrong deltas**, $0.19 for the turn. A headless browser on the live site saw each step:

| step (Haiku's call) | written | seen | ms |
|---|---|---|---|
| heading "Fruit facts" | 08:15:27.239 | 08:15:27.350 | 111 |
| card Apple | 08:15:28.050 | 08:15:28.116 | 66 |
| card Banana | 08:15:29.079 | 08:15:29.190 | 111 |
| card Cherry | 08:15:29.292 | 08:15:29.313 | 21 |
| subpage "seeds" (🌱, its own title line) + heading "Seed notes" | 08:15:31.268 | page_read lists both; the parent link is the row below | – |

The subpage link row was added after this run (the first run built the subpage on disk, but the parent showed no link to it); a second `pages.add` with the row in place appeared 41 ms after the write. Files: `ai/sessions/2026/10/12/session-cb7ffa45/page-ai-api/proof/` (`haiku-seen.json`, `sub-seen.png`, `layout/` at 400/1200/1920/3440: no overflow).

Related: [content.md](content.md) (what content is), [page-tool-2026-10-09.md](page-tool-2026-10-09.md) (the first version of the tool), [jsonl.md](jsonl.md) (the wire format).
