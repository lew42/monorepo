# How a page renders

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

**Short answer:** a page is a class instance. Most pages are still written as code with the little helper functions (`h1()`, `p()`, `div()`). A page can instead (or also) be a `page.jsonl` log, which the page replays into content blocks. Both end up in the same list, `page.content`, and the same View draws it.

## 1. The basics, in plain sentences

A page is an object made from `class Page` ([`Page.class.js`](../Page.class.js)). A page's folder holds a tiny `page.js` that makes one (the whole recipe is at the top of the [readme](../readme.md)):

```js
export default new Page({ meta: import.meta, title: "Hello", content(){ h1("Hello"); p("Some text."); } });
```

The `content(){…}` function is where the helper functions come in. `h1()`, `p()`, `div()`, `css()` and the rest are small functions exported by [`View.js`](../../View/View.js) (`export const { el, div, p, h1, … } = View.elements()`). Each one builds a real DOM element wrapped in a `View` and, because a View captures into whatever box is currently being filled (`View.captor`), appends it there. Calling `h1("Hello")` inside `content()` is therefore all it takes to add a heading. That is why they read like plain statements. Capturing is synchronous only: [`View/doc/capturing.md`](../../View/doc/capturing.md).

So: **yes, the helper functions are still how a view writes DOM.** Nothing replaced them.

## 2. What was added on top: `page.jsonl`

A page can also be a log, a file called `page.jsonl` with one JSON object per line ([`jsonl.md`](jsonl.md), loader in [`Jsonl.js`](../Jsonl.js)):

- **Line 1 builds the page:** `new Page(line1)` (so `{"title":"Notes","icon":"description"}`). It may name a subclass with `"class": "./Card.js"`.
- **Every later line is one `page.set(line)` call.** A key that is a method is called with the value, so `{"place":"note.md"}` calls `place()`. The class is the vocabulary; there is no table.
- **`{"content":{"add":{…}}}` adds a block** to `page.content`.

We are **not** replacing the helper functions with JSON. JSON is for what an agent or tool wants to *append* to a page without editing code. Code is for anything with logic.

### The blocks (what a `content` line can add)

Each kind is an `Item` subclass with its own View, registered by name ([`content.md`](content.md), [`parts/`](../parts/readme.md)):

| `type` | Class | Draws |
|---|---|---|
| `part-heading` | [`PageHeading`](../parts/PageHeading.js) | a heading |
| `part-text` | [`PageText`](../parts/PageText.js) | markdown text |
| `part-card` | [`PageCard`](../parts/PageCard.js) | a card |
| `part-link` | [`PageLink`](../parts/PageLink.js) | a link to another page ([`part-link.md`](part-link.md)) |

Columns are not a block kind: they are a layout *mode* a page draws itself in ([`Columns.js`](../Columns.js), [`columns.md`](columns.md)).

The code in `content(){…}` is itself one more block, a *code part* ([`PageCode.js`](../PageCode.js)). [`PageContent.fill()`](../PageContent.js) wraps a function, a string or an address (`"/notes/x.md"`) into one bare block, while a `{"content":{"add":…}}` line adds real parts. So code and lines share one list and one draw: [`PageContent.View`](../PageContent.js).

## 3. Which pages are code, which are JSONL, which are both

| Kind | How it is written | Live example |
|---|---|---|
| **Code** | `page.js` with `content(){…}` and helpers (the large majority: 1,503 tracked `page.js` files on 2026-10-15, against 919 `page.jsonl`) | [/framework/core/Page/](/framework/core/Page/) |
| **JSONL only** | `page.jsonl`, no `page.js` | [/framework/core/Page/parts/](/framework/core/Page/parts/) (its [`example/`](../parts/example/page.jsonl) is a readme drawn as parts) |
| **Both** | a class with `content()` plus `content.add` lines in `page.jsonl` | [/framework/core/Page/content-shapes/both/](/framework/core/Page/content-shapes/both/) ([class](../content-shapes/class-body/ClassBody.js), [lines](../content-shapes/both/page.jsonl)) |

Agents write JSONL pages and parts through the page tools (`page_set`, `page_add`, `page_read`, `create_page`; [`ai-api.md`](ai-api.md), tools in [`Servex/pages.js`](../../../../../Servex/pages.js)). They append one line and never rewrite the file.

## 4. Markdown pages

Any `.md` file is also a page. Add `md/` to a url (`/framework/core/Page/md/readme/`) and the folder's markdown is rendered ([`markdown.md`](markdown.md), [`Markdown.js`](../Markdown.js)). A bare `.md` file is the last step of the loader before a 404. A `part-text` block is markdown too.

## 5. How live updates arrive

No polling. Appending a line to `page.jsonl` makes the dev server's watcher send just the new bytes over a socket ([`Tail.js`](../../../../../Server/plugins/SocketServer/Tail.js)); [`ext/JSONL/live.js`](../../../ext/JSONL/live.js) hands them to the page's `Page.Reader`, which calls `page.set(line)`; the page redraws in place. Full trip: [`streaming.md`](streaming.md). On the static production site there is no socket: the file is fetched once.

## 6. The whole flow

```
page.js ──new Page({content(){ h1(); p() }})──┐
                                              ▼
                              Page ──▶ page.content (a PageContent List)
                                              ▲        │ each item draws via its class's View
page.jsonl ─▶ Reader ─▶ page.set(line) ───────┘        ▼
   (line 1 builds; {"content":{"add":…}} adds parts)   DOM
   ▲
 page_set / append (agents)   ── live() tail redraws open tabs, no reload
```

Which of these steps loads a page for a url (memory → declared `page.jsonl` → `md/` → `route()` → `page.js` → bare `.md` → 404): [`loading.md`](loading.md).

## Open choices

- `page.children` (a Map) and `page.pages` are two names for the child pages; the plan to retire the first is in [`content.md`](content.md). Nothing here needs it.
- Asked by the owner on 2026-10-13 ([`requirements-4.md`](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-4.md), asks 2 and 3).
