# Page system: answers (2026-10-15)

These answer the page questions in [ask-ea3d4c58.md](../ask-ea3d4c58.md) (section A) and the children question from voice ask 3bb94c8c. Minions read the code: [trace](answers/trace/out.md) (Haiku), [opinions](answers/opinion/out.md) (Sonnet) and [debug views](answers/debug-views/out.md) (Haiku). I spot-checked the decisive lines. The ideas are kept in [core/Page/doc/vision.md](/framework/core/Page/doc/vision.md). Earlier answers: [report.md](report.md), [followup.md](followup.md).

## 00. The class architecture: Item, List, Page

```js
class Item extends Events(Object)    // a thing: id, data, set(delta), lists(), walk(), save()
class List extends Item              // an ordered set: owner, name, items[], add/insert/move/remove/find(id)
class Page extends Item              // an Item with a url: name, url
  pages    : List "pages"            //   the child pages (page.pages.items)
  children : PageChildren (a Map)    //   the old name: a Map over the same pages
  content  : List (Page.Content)     //   the body, a list of parts
```

`pages` is **not** an alias of `items`: an Item has no `items` field. `items` is the array inside any List, and a Page owns two Lists, `pages` and `content`. The full picture, with the main API and file lines, now sits at the top of [core/Page/doc/classes.md](/framework/core/Page/doc/classes.md).

## 0b. How page.jsonl pages reach their child pages

**Today:** there are two ways.

```jsonl
{"file":"kid/page.jsonl"}                        // a child in its own folder: a stub in children, loaded when the url reaches it
{"tab":{"name":"notes","title":"Notes"}}         // a child with no folder: a Page made from the line itself
```

Neither is a List line. The child pages land in `page.pages` through `add()`, but the log never says `{"pages":{"add":…}}`. Content does use list lines: `{"content":{"add":{…}}}` adds an Item to `page.content`. So children and content are written two different ways, and only content gets ids, `after` and `move`.

**Could:** children could be written as list lines on `pages`, the same verbs content uses. A folder child carries a `file` reference; an embedded child carries its own data:

```jsonl
{"pages":{"add":{"id":"kid","file":"kid/page.jsonl"}}}
{"pages":{"add":{"id":"notes","title":"Notes","content":"…"}}}
{"pages":{"move":{"id":"notes","after":"kid"}}}
```

**Should (my opinion):** yes, eventually, because it is one model for every list: a page's children would then be ordered, moved and removed by id exactly like its content, and `page.children` (the Map) could retire, as [content.md](/framework/core/Page/doc/content.md) already plans. It is not urgent. 55 files use `file` lines and the page tools write them (`Servex/agents/Subpages.js`), so the change means: teach `Jsonl.js` to read `pages` lines, keep reading `file` and `tab` lines forever, and switch the writer. The alternative is to keep `file` lines. That wins while nobody needs to reorder child pages in a log; today none do.

## 0. What a children list looks like in page.jsonl

A `page.js` names its children in one string. A `page.jsonl` names each child with its own `file` line:

```js
// framework/ai/AITask/tree/page.js
children: "demo lanes outline flow"
```
```jsonl
// framework/ai/sessions/2026/09/19/cards/page.jsonl
{"file":"answer-cards/page.jsonl"}
{"file":"ask-on-board/page.jsonl"}
```

**No `page.jsonl` declares `children` as a string today** (0 files; 55 use `file` lines). The string would still work on line 1: line 1 goes to `new Page(line)` (`Jsonl.js:42`), and the constructor's `declare()` splits it on spaces (`Page.class.js:47`, `:291`). A `file` line marks the child as jsonl, so it loads without a guess (`Jsonl.js:80-86`).

## 1. How the url walk reaches a page.jsonl child

The parent names it, or the folder listing does; the code never probes for a `page.jsonl` blind.

```
Router.load_segments(url)            core/Router/Router.js:104
  → page.child(name)                 Page.class.js:360
      → Page.jsonl(url + name + "/") :198   (named by a file line, or found in the loaded files.jsonl, :381-387)
          → Jsonl.load(host, url)    Jsonl.js:26
              → new Class(line 1)    Jsonl.js:42   (Class = Page, or line 1's "class")
              → reader.attach(page)  Jsonl.js:45   replays every later line
```

It recurses: a jsonl page is a `Page`, so its own children go through the same `child()`. Those children can be either `page.jsonl` or `page.js` (`Page.class.js:393`).

## 2. A page.jsonl, line by line

```jsonl
{"title":"Parts","icon":"view_agenda","class":"./Parts.js"}
{"tab":{"name":"notes","title":"Notes","content":"A tab an agent added."}}
{"navigation":"tabs"}
{"content":{"add":{"id":"h1","type":"part-heading","text":"A page made of parts"}}}
{"content":{"add":{"id":"c2","type":"part-card","title":"Added later"}}}
{"content":{"move":{"id":"c2","after":"h1"}}}
```

1. Builds the page. It must come first; a first line that is a `file` line makes the folder a listing instead.
2. Adds a tab subpage named `notes`. A later line with the same name merges into it.
3. Sets a page word. When a word is set twice, the last line wins.
4. and 5. Add two parts to the content list.
6. Moves `c2` by its id. It must come after the line that added `c2`.

Lines are replayed top to bottom. Order matters only where a line refers to something an earlier line made.

**Opinion: keep the deltas.** An append is safe with many writers; a read-modify-write lost 98% of updates when it was measured. A new line reaches an open tab in about 100 ms, and history comes free. The real cost is replay and growth: the biggest file has 9,760 lines, and 10 files pass 1 MB. The fix (a snapshot line written at compaction) is designed in [doc/storage.md](/framework/core/Page/doc/storage.md) but not built. Build it when a log you actually open feels slow.

## 3. The Page class, and a split proposal

`Page.class.js` is **721 lines**, not thousands. It was 2,270 lines until 2026-10-12, when [split-plan.md](/framework/core/Page/doc/split-plan.md) moved the parts out. The 23 files are listed in [classes.md](/framework/core/Page/doc/classes.md).

```js
class Page extends Item {          // Page.class.js:32
  // identity     naming() words() chain() nearest() link() crumbs() slug()
  // children     pages  children  declare() add() move() child() load_all_children()
  // loading      static of() file() load() jsonl() listing() props()
  // rendering    container() activate() deactivate() render() render_content()
  // links, nav   nav() open_link() swap_link() columns() previews()
  // log          set() tab() place() tab_state() log_view()   (forward to Page.Jsonl)
}
```

- `pages` is not Item's `items`: it is its own `List` named `"pages"` (`Page.class.js:112`).
- `children` is a Map-shaped view over `pages` (`:114`, `PageChildren extends Map`). A declared child that has not loaded yet reads as `null`. So the tree is one list, with two names.
- The name and path are `page.name` and `page.url`. `chain()` walks to the root.

**Proposal only, no refactor:**
1. Replace the ~90 one-line forwarding methods with one install line per part. The behaviour stays identical, and the file drops to about 450 lines.
2. Move the page words (`naming`, `words`, ~35 lines) into `Page.Words`.
3. Stop there. Rendering stays in the file: `render()` has hundreds of callers and subclasses override it.

The alternative is to leave it as it is. That wins if readers can now find things, because each further move costs a `check_page` sweep.

## 4. Storage permutations

| form | good for | count |
|---|---|---|
| `page.js` | code, behaviour, demos | 1,503 |
| `page.jsonl` | live pages with history (cards, sessions, agent pages) | 921 |
| `page.json` | one static object | 12 |
| a `tab` line in the parent's jsonl | a small child with no folder | 3 files |
| `route(name)`, `generator/`, `dynamic/` | pages made by code on demand | ~177 `page.js` files use `route` |

**Opinion: the file name is the declaration, and that is right.** A `store` field on every page would say the same thing twice, and the two could disagree. Where a page is kept in production (files, a database, an archive) is already designed as one optional `home` line that defaults to files ([doc/storage.md](/framework/core/Page/doc/storage.md)). Dynamic pages have one weak spot: you can't find them, because they have no file. A listing page fixes that, not a field.

## 5 and 6. Debug views and the core-item vision

Both are recorded in [core/Page/doc/vision.md](/framework/core/Page/doc/vision.md). The debug view is mostly built already: `view(thing)` draws any instance as a tree, and `InstanceTree` draws the live page tree. The dev-shell sidebar just doesn't show it yet; adding `instances` at `dev/DevShell/DevShell.js:165` is the one-line first step.
